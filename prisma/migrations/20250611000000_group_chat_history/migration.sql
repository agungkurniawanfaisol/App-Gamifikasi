-- AlterTable
ALTER TABLE `chat_history` ADD COLUMN `group_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `chat_history_user_id_group_id_created_at_idx` ON `chat_history`(`user_id`, `group_id`, `created_at`);

-- AddForeignKey
ALTER TABLE `chat_history` ADD CONSTRAINT `chat_history_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `learning_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
