-- CreateIndex
CREATE INDEX `users_role_is_active_points_idx` ON `users`(`role`, `is_active`, `points`);
