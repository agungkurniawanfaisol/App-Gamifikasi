-- CreateTable
CREATE TABLE `assistant_knowledge` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `keywords` JSON NOT NULL,
    `question_en` TEXT NOT NULL,
    `question_id` TEXT NULL,
    `answer_en` TEXT NOT NULL,
    `answer_id` TEXT NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `is_published` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `assistant_knowledge_slug_key`(`slug`),
    INDEX `assistant_knowledge_is_published_priority_idx`(`is_published`, `priority`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
