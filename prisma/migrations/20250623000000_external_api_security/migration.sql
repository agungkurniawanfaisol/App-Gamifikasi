-- External API security: scopes, allowed origins, audit log
-- Idempotent: 20250622000000_external_api_tokens may already include these columns/tables.

SET @scopes_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'external_api_tokens'
    AND COLUMN_NAME = 'scopes'
);
SET @sql = IF(
  @scopes_exists = 0,
  'ALTER TABLE `external_api_tokens`
    ADD COLUMN `scopes` JSON NOT NULL DEFAULT (''["chat","generate","models"]'') AFTER `is_active`,
    ADD COLUMN `allowed_origins` JSON NULL AFTER `scopes`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS `external_api_token_logs` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `token_id` INTEGER NOT NULL,
  `endpoint` VARCHAR(191) NOT NULL,
  `method` VARCHAR(16) NOT NULL,
  `status_code` INTEGER NOT NULL,
  `client_ip` VARCHAR(45) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `external_api_token_logs_token_id_created_at_idx`(`token_id`, `created_at`),
  INDEX `external_api_token_logs_created_at_idx`(`created_at`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'external_api_token_logs'
    AND CONSTRAINT_NAME = 'external_api_token_logs_token_id_fkey'
);
SET @sql = IF(
  @fk_exists = 0,
  'ALTER TABLE `external_api_token_logs` ADD CONSTRAINT `external_api_token_logs_token_id_fkey` FOREIGN KEY (`token_id`) REFERENCES `external_api_tokens`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
