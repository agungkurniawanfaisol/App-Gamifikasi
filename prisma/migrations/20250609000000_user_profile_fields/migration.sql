-- AlterTable
ALTER TABLE `users`
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `date_of_birth` DATE NULL,
    ADD COLUMN `gender` ENUM('MALE', 'FEMALE') NULL,
    ADD COLUMN `institution` VARCHAR(191) NULL,
    ADD COLUMN `student_id` VARCHAR(191) NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX `users_institution_idx` ON `users`(`institution`);

-- CreateIndex
CREATE INDEX `users_student_id_idx` ON `users`(`student_id`);
