-- CreateTable
CREATE TABLE `user_daily_challenge_questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `period_id` INTEGER NOT NULL,
    `content_item_id` INTEGER NOT NULL,
    `sub_question_index` INTEGER NOT NULL DEFAULT 0,
    `order_index` INTEGER NOT NULL,
    `is_answered` BOOLEAN NOT NULL DEFAULT false,
    `is_correct` BOOLEAN NULL,
    `answered_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_daily_challenge_questions_user_id_period_id_idx`(`user_id`, `period_id`),
    UNIQUE INDEX `udcq_user_period_item_sub_key`(`user_id`, `period_id`, `content_item_id`, `sub_question_index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_daily_challenge_questions` ADD CONSTRAINT `user_daily_challenge_questions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_daily_challenge_questions` ADD CONSTRAINT `user_daily_challenge_questions_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `challenge_periods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_daily_challenge_questions` ADD CONSTRAINT `user_daily_challenge_questions_content_item_id_fkey` FOREIGN KEY (`content_item_id`) REFERENCES `group_content_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Update daily challenge template to 5 random questions per day
UPDATE `challenge_templates`
SET
  `description` = 'Kerjakan 5 soal random dari bank soal yang tersedia setiap hari.',
  `objectives` = JSON_ARRAY(
    JSON_OBJECT('type', 'DAILY_RANDOM_QUESTIONS', 'target', 5, 'label', 'Kerjakan 5 soal random harian')
  ),
  `updated_at` = CURRENT_TIMESTAMP(3)
WHERE `slug` = 'daily-challenge';
