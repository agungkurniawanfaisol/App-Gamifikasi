-- External API tokens + audit log for Ollama gateway

CREATE TABLE `external_api_tokens` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `token_prefix` VARCHAR(191) NOT NULL,
  `token_hash` VARCHAR(191) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `scopes` JSON NOT NULL,
  `allowed_origins` JSON NULL,
  `last_used_at` DATETIME(3) NULL,
  `expires_at` DATETIME(3) NULL,
  `created_by_user_id` INTEGER NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  UNIQUE INDEX `external_api_tokens_token_hash_key`(`token_hash`),
  INDEX `external_api_tokens_is_active_idx`(`is_active`),
  INDEX `external_api_tokens_created_by_user_id_idx`(`created_by_user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `external_api_token_logs` (
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

ALTER TABLE `external_api_tokens` ADD CONSTRAINT `external_api_tokens_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `external_api_token_logs` ADD CONSTRAINT `external_api_token_logs_token_id_fkey` FOREIGN KEY (`token_id`) REFERENCES `external_api_tokens`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
