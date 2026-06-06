-- Reward & Achievement System

ALTER TABLE `learning_groups` ADD COLUMN `is_premium` BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE `user_point_events` MODIFY `event_type` ENUM(
  'MATERIAL_COMPLETE',
  'CORRECT_ANSWER',
  'ON_TIME_BONUS',
  'DISCUSSION_MILESTONE',
  'GROUP_COMPLETE',
  'PROFICIENCY_LEVEL_UP',
  'CHALLENGE_REWARD',
  'ACHIEVEMENT_BONUS'
) NOT NULL;

CREATE TABLE `achievement_definitions` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `trigger_type` ENUM('GROUP_COMPLETE', 'LEVEL_COMPLETE', 'PROFICIENCY_REACH') NOT NULL,
  `trigger_config` JSON NOT NULL,
  `icon_key` VARCHAR(191) NOT NULL DEFAULT 'trophy',
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `sort_order` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  UNIQUE INDEX `achievement_definitions_slug_key`(`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `achievement_rewards` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `achievement_id` INTEGER NOT NULL,
  `reward_type` ENUM('BONUS_POINTS', 'CERTIFICATE', 'PREMIUM_UNLOCK') NOT NULL,
  `reward_config` JSON NOT NULL,
  `sort_order` INTEGER NOT NULL DEFAULT 0,

  INDEX `achievement_rewards_achievement_id_idx`(`achievement_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `user_achievements` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `user_id` INTEGER NOT NULL,
  `achievement_id` INTEGER NOT NULL,
  `unlocked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `notified` BOOLEAN NOT NULL DEFAULT false,

  INDEX `user_achievements_user_id_idx`(`user_id`),
  UNIQUE INDEX `user_achievements_user_id_achievement_id_key`(`user_id`, `achievement_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `certificate_templates` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `subtitle` VARCHAR(191) NOT NULL DEFAULT 'Certificate of Completion',
  `level_id` INTEGER NULL,
  `design_variant` VARCHAR(191) NOT NULL DEFAULT 'classic',
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  UNIQUE INDEX `certificate_templates_slug_key`(`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `user_certificates` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `user_id` INTEGER NOT NULL,
  `template_id` INTEGER NOT NULL,
  `achievement_id` INTEGER NULL,
  `certificate_number` VARCHAR(191) NOT NULL,
  `metadata` JSON NOT NULL,
  `issued_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `user_certificates_certificate_number_key`(`certificate_number`),
  INDEX `user_certificates_user_id_idx`(`user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `user_premium_unlocks` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `user_id` INTEGER NOT NULL,
  `level_id` INTEGER NOT NULL,
  `source_achievement_id` INTEGER NOT NULL,
  `unlocked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `user_premium_unlocks_user_id_idx`(`user_id`),
  UNIQUE INDEX `user_premium_unlocks_user_id_level_id_key`(`user_id`, `level_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `achievement_rewards` ADD CONSTRAINT `achievement_rewards_achievement_id_fkey` FOREIGN KEY (`achievement_id`) REFERENCES `achievement_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `user_achievements` ADD CONSTRAINT `user_achievements_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_achievements` ADD CONSTRAINT `user_achievements_achievement_id_fkey` FOREIGN KEY (`achievement_id`) REFERENCES `achievement_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `certificate_templates` ADD CONSTRAINT `certificate_templates_level_id_fkey` FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `user_certificates` ADD CONSTRAINT `user_certificates_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_certificates` ADD CONSTRAINT `user_certificates_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `certificate_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_certificates` ADD CONSTRAINT `user_certificates_achievement_id_fkey` FOREIGN KEY (`achievement_id`) REFERENCES `achievement_definitions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `user_premium_unlocks` ADD CONSTRAINT `user_premium_unlocks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_premium_unlocks` ADD CONSTRAINT `user_premium_unlocks_source_achievement_id_fkey` FOREIGN KEY (`source_achievement_id`) REFERENCES `achievement_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
