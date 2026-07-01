-- Allow OAuth-only users (Google sign-in) without a local password hash
ALTER TABLE `users` MODIFY `password` VARCHAR(191) NULL;
