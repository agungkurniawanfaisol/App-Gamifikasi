-- AlterEnum: add WRITING to QuestionSkill
ALTER TABLE `group_content_items` MODIFY `skill` ENUM('SPEAKING', 'READING', 'WRITING', 'LISTENING') NULL;

-- AlterEnum: add YES_NO to QuestionFormat
ALTER TABLE `group_content_items` MODIFY `format` ENUM('MULTIPLE_CHOICE', 'YES_NO', 'ESSAY', 'SPEECH_RECOGNITION') NULL;

-- Add sub_questions JSON column
ALTER TABLE `group_content_items` ADD COLUMN `sub_questions` JSON NULL AFTER `essay_rubric`;

-- Add sub_question_index to user_answers
ALTER TABLE `user_answers` ADD COLUMN `sub_question_index` INTEGER NOT NULL DEFAULT 0 AFTER `content_item_id`;

-- Drop old index and add unique constraint for per-sub answers
DROP INDEX `user_answers_user_id_content_item_id_idx` ON `user_answers`;
CREATE UNIQUE INDEX `user_answers_user_id_content_item_id_sub_question_index_key` ON `user_answers`(`user_id`, `content_item_id`, `sub_question_index`);
CREATE INDEX `user_answers_user_id_content_item_id_idx` ON `user_answers`(`user_id`, `content_item_id`);

-- Migrate existing single questions to sub_questions array
UPDATE `group_content_items`
SET `sub_questions` = JSON_ARRAY(
  JSON_OBJECT(
    'id', CONCAT('legacy-', `id`),
    'order', 0,
    'skill', `skill`,
    'format', `format`,
    'weightPercent', 100,
    'questionText', COALESCE(`question_text`, ''),
    'options', COALESCE(`options`, JSON_ARRAY()),
    'correctAnswer', `correct_answer`,
    'expectedSpeech', `expected_speech`,
    'audioUrl', `audio_url`,
    'explanation', `explanation`,
    'essayRubric', `essay_rubric`
  )
)
WHERE `type` = 'QUESTION'
  AND `sub_questions` IS NULL
  AND `skill` IS NOT NULL
  AND `format` IS NOT NULL;
