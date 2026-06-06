-- CreateIndex
CREATE INDEX `learning_groups_level_id_is_published_order_index_idx` ON `learning_groups`(`level_id`, `is_published`, `order_index`);

-- CreateIndex
CREATE INDEX `materials_group_id_order_index_idx` ON `materials`(`group_id`, `order_index`);

-- CreateIndex
CREATE INDEX `questions_group_id_order_index_idx` ON `questions`(`group_id`, `order_index`);

-- CreateIndex
CREATE INDEX `user_progress_user_id_is_group_completed_idx` ON `user_progress`(`user_id`, `is_group_completed`);

-- CreateIndex
CREATE INDEX `user_answers_user_id_question_id_idx` ON `user_answers`(`user_id`, `question_id`);

-- CreateIndex
CREATE INDEX `chat_history_user_id_created_at_idx` ON `chat_history`(`user_id`, `created_at`);

-- CreateIndex
CREATE INDEX `users_role_idx` ON `users`(`role`);
