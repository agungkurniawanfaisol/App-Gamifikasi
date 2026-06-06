-- AlterEnum
ALTER TABLE `user_point_events` MODIFY `event_type` ENUM('MATERIAL_COMPLETE', 'CORRECT_ANSWER', 'ON_TIME_BONUS', 'DISCUSSION_MILESTONE', 'GROUP_COMPLETE', 'PROFICIENCY_LEVEL_UP', 'CHALLENGE_REWARD') NOT NULL;

-- CreateTable
CREATE TABLE `challenge_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `recurrence` ENUM('DAILY', 'WEEKLY') NOT NULL,
    `icon_key` VARCHAR(191) NOT NULL DEFAULT 'target',
    `objectives` JSON NOT NULL,
    `point_reward` INTEGER NOT NULL DEFAULT 20,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `challenge_templates_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `challenge_periods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `template_id` INTEGER NOT NULL,
    `period_key` VARCHAR(191) NOT NULL,
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `challenge_periods_starts_at_ends_at_idx`(`starts_at`, `ends_at`),
    UNIQUE INDEX `challenge_periods_template_id_period_key_key`(`template_id`, `period_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_challenge_progress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `period_id` INTEGER NOT NULL,
    `objective_counts` JSON NOT NULL,
    `status` ENUM('IN_PROGRESS', 'COMPLETED', 'REWARDED') NOT NULL DEFAULT 'IN_PROGRESS',
    `completed_at` DATETIME(3) NULL,
    `rewarded_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `user_challenge_progress_user_id_status_idx`(`user_id`, `status`),
    UNIQUE INDEX `user_challenge_progress_user_id_period_id_key`(`user_id`, `period_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `challenge_periods` ADD CONSTRAINT `challenge_periods_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `challenge_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_challenge_progress` ADD CONSTRAINT `user_challenge_progress_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_challenge_progress` ADD CONSTRAINT `user_challenge_progress_period_id_fkey` FOREIGN KEY (`period_id`) REFERENCES `challenge_periods`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default challenge templates
INSERT INTO `challenge_templates` (`slug`, `title`, `description`, `recurrence`, `icon_key`, `objectives`, `point_reward`, `is_active`, `sort_order`, `updated_at`) VALUES
(
  'daily-challenge',
  'Daily Challenge',
  'Selesaikan target harian untuk menjaga streak belajar English setiap hari.',
  'DAILY',
  'sun',
  JSON_ARRAY(
    JSON_OBJECT('type', 'COMPLETE_MATERIALS', 'target', 2, 'label', 'Selesaikan 2 materi'),
    JSON_OBJECT('type', 'CORRECT_ANSWERS', 'target', 3, 'label', 'Jawab benar 3 soal')
  ),
  15,
  true,
  1,
  CURRENT_TIMESTAMP(3)
),
(
  'weekly-english-mission',
  'Weekly English Mission',
  'Misi mingguan: selesaikan grup, jawab soal, dan aktif di diskusi AI.',
  'WEEKLY',
  'calendar',
  JSON_ARRAY(
    JSON_OBJECT('type', 'COMPLETE_GROUPS', 'target', 1, 'label', 'Selesaikan 1 grup belajar'),
    JSON_OBJECT('type', 'CORRECT_ANSWERS', 'target', 10, 'label', 'Jawab benar 10 soal'),
    JSON_OBJECT('type', 'CHAT_MESSAGES', 'target', 5, 'label', 'Kirim 5 pesan di AI Chat')
  ),
  50,
  true,
  2,
  CURRENT_TIMESTAMP(3)
),
(
  'speaking-challenge',
  'Speaking Challenge',
  'Latihan speaking mingguan: kumpulkan jawaban speaking yang lulus.',
  'WEEKLY',
  'mic',
  JSON_ARRAY(
    JSON_OBJECT('type', 'SPEAKING_CORRECT', 'target', 5, 'label', 'Lulus 5 soal speaking')
  ),
  30,
  true,
  3,
  CURRENT_TIMESTAMP(3)
);
