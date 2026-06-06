-- Localize challenge template copy to English (UI-facing strings stored in DB)
UPDATE `challenge_templates`
SET
  `description` = 'Complete 5 random questions from the available question bank each day.',
  `objectives` = JSON_ARRAY(
    JSON_OBJECT('type', 'DAILY_RANDOM_QUESTIONS', 'target', 5, 'label', 'Complete 5 daily random questions')
  ),
  `updated_at` = CURRENT_TIMESTAMP(3)
WHERE `slug` = 'daily-challenge';

UPDATE `challenge_templates`
SET
  `description` = 'Weekly mission: complete a group, answer questions, and stay active in AI chat.',
  `objectives` = JSON_ARRAY(
    JSON_OBJECT('type', 'COMPLETE_GROUPS', 'target', 1, 'label', 'Complete 1 learning group'),
    JSON_OBJECT('type', 'CORRECT_ANSWERS', 'target', 10, 'label', 'Answer 10 questions correctly'),
    JSON_OBJECT('type', 'CHAT_MESSAGES', 'target', 5, 'label', 'Send 5 messages in AI Chat')
  ),
  `updated_at` = CURRENT_TIMESTAMP(3)
WHERE `slug` = 'weekly-english-mission';

UPDATE `challenge_templates`
SET
  `description` = 'Weekly speaking practice: pass speaking questions throughout the week.',
  `objectives` = JSON_ARRAY(
    JSON_OBJECT('type', 'SPEAKING_CORRECT', 'target', 5, 'label', 'Pass 5 speaking questions')
  ),
  `updated_at` = CURRENT_TIMESTAMP(3)
WHERE `slug` = 'speaking-challenge';
