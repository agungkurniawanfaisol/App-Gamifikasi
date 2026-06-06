-- AlterTable
ALTER TABLE `user_progress` ADD COLUMN `group_score_percent` INTEGER NULL,
    ADD COLUMN `ai_completion_feedback` TEXT NULL,
    ADD COLUMN `testimonial_rating` INTEGER NULL,
    ADD COLUMN `testimonial_text` TEXT NULL,
    ADD COLUMN `testimonial_submitted_at` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `user_progress_testimonial_submitted_at_idx` ON `user_progress`(`testimonial_submitted_at`);
