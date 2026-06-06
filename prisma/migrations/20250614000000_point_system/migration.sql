-- AlterTable
ALTER TABLE `learning_groups` ADD COLUMN `due_at` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `user_point_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `event_type` ENUM('MATERIAL_COMPLETE', 'CORRECT_ANSWER', 'ON_TIME_BONUS', 'DISCUSSION_MILESTONE', 'GROUP_COMPLETE') NOT NULL,
    `event_key` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_point_events_user_id_event_type_idx`(`user_id`, `event_type`),
    UNIQUE INDEX `user_point_events_user_id_event_key_key`(`user_id`, `event_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_point_events` ADD CONSTRAINT `user_point_events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
