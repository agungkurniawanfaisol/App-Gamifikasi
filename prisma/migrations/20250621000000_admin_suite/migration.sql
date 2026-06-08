-- Admin Suite: announcements, content versions, app settings, scheduled publish

ALTER TABLE `learning_groups` ADD COLUMN `publish_at` DATETIME(3) NULL;

CREATE TABLE `announcements` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `link_url` VARCHAR(191) NULL,
  `link_label` VARCHAR(191) NULL,
  `starts_at` DATETIME(3) NOT NULL,
  `ends_at` DATETIME(3) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `target_role` ENUM('ADMIN', 'STUDENT') NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  INDEX `announcements_is_active_starts_at_idx`(`is_active`, `starts_at`),
  INDEX `announcements_starts_at_ends_at_idx`(`starts_at`, `ends_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `content_item_versions` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `content_item_id` INTEGER NOT NULL,
  `version_number` INTEGER NOT NULL,
  `snapshot` JSON NOT NULL,
  `changed_by_user_id` INTEGER NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `content_item_versions_content_item_id_version_number_idx`(`content_item_id`, `version_number`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `app_settings` (
  `key` VARCHAR(191) NOT NULL,
  `value` JSON NOT NULL,
  `updated_at` DATETIME(3) NOT NULL,

  PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
