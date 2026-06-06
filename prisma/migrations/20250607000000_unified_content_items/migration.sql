-- CreateEnum replacements via MySQL ENUM columns

CREATE TABLE `group_content_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `type` ENUM('MATERIAL', 'QUESTION') NOT NULL,
    `order_index` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `content` LONGTEXT NULL,
    `question_text` TEXT NULL,
    `skill` ENUM('SPEAKING', 'READING', 'LISTENING') NULL,
    `format` ENUM('MULTIPLE_CHOICE', 'ESSAY', 'SPEECH_RECOGNITION') NULL,
    `options` JSON NULL,
    `correct_answer` VARCHAR(191) NULL,
    `expected_speech` TEXT NULL,
    `audio_url` VARCHAR(191) NULL,
    `explanation` TEXT NULL,
    `essay_rubric` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `group_content_items_group_id_order_index_idx`(`group_id`, `order_index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `group_content_items` ADD CONSTRAINT `group_content_items_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `learning_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate materials
INSERT INTO `group_content_items` (`group_id`, `type`, `order_index`, `title`, `content`, `created_at`, `updated_at`)
SELECT `group_id`, 'MATERIAL', `order_index`, `title`, `content`, `created_at`, `updated_at`
FROM `materials`;

-- Migrate questions (append after materials per group)
INSERT INTO `group_content_items` (
    `group_id`, `type`, `order_index`, `question_text`, `skill`, `format`,
    `options`, `correct_answer`, `explanation`, `created_at`, `updated_at`
)
SELECT
    q.`group_id`,
    'QUESTION',
    COALESCE(mmax.max_order, 0) + q.`order_index`,
    q.`question`,
    'READING',
    'MULTIPLE_CHOICE',
    q.`options`,
    q.`correct_answer`,
    q.`explanation`,
    q.`created_at`,
    q.`updated_at`
FROM `questions` q
LEFT JOIN (
    SELECT `group_id`, MAX(`order_index`) AS max_order
    FROM `materials`
    GROUP BY `group_id`
) mmax ON mmax.`group_id` = q.`group_id`;

-- Map old question ids to new content item ids
CREATE TEMPORARY TABLE `_question_id_map` AS
SELECT q.`id` AS old_id, gci.`id` AS new_id
FROM `questions` q
INNER JOIN `group_content_items` gci
    ON gci.`group_id` = q.`group_id`
    AND gci.`type` = 'QUESTION'
    AND gci.`question_text` = q.`question`
    AND gci.`correct_answer` = q.`correct_answer`
    AND gci.`order_index` = COALESCE(
        (SELECT MAX(m.`order_index`) FROM `materials` m WHERE m.`group_id` = q.`group_id`),
        0
    ) + q.`order_index`;

-- Add new columns to user_progress and user_answers
ALTER TABLE `user_progress` ADD COLUMN `last_content_item_id` INTEGER NULL;

UPDATE `user_progress` up
INNER JOIN `materials` m ON up.`last_material_id` = m.`id`
INNER JOIN `group_content_items` gci
    ON gci.`group_id` = m.`group_id`
    AND gci.`type` = 'MATERIAL'
    AND gci.`order_index` = m.`order_index`
SET up.`last_content_item_id` = gci.`id`;

ALTER TABLE `user_progress` DROP COLUMN `last_material_id`;

ALTER TABLE `user_answers` ADD COLUMN `content_item_id` INTEGER NULL;
ALTER TABLE `user_answers` ADD COLUMN `score_percent` INTEGER NULL;

UPDATE `user_answers` ua
INNER JOIN `_question_id_map` m ON ua.`question_id` = m.old_id
SET ua.`content_item_id` = m.new_id;

ALTER TABLE `user_answers` DROP FOREIGN KEY `user_answers_question_id_fkey`;
ALTER TABLE `user_answers` DROP COLUMN `question_id`;

ALTER TABLE `user_answers` MODIFY `content_item_id` INTEGER NOT NULL;
CREATE INDEX `user_answers_user_id_content_item_id_idx` ON `user_answers`(`user_id`, `content_item_id`);
ALTER TABLE `user_answers` ADD CONSTRAINT `user_answers_content_item_id_fkey` FOREIGN KEY (`content_item_id`) REFERENCES `group_content_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop legacy tables
ALTER TABLE `questions` DROP FOREIGN KEY `questions_group_id_fkey`;
DROP TABLE `questions`;

ALTER TABLE `materials` DROP FOREIGN KEY `materials_group_id_fkey`;
DROP TABLE `materials`;
