-- CreateTable
CREATE TABLE `group_assessment_questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `phase` ENUM('PRETEST', 'POSTTEST') NOT NULL,
    `order_index` INTEGER NOT NULL,
    `question_text` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `group_assessment_questions_group_id_phase_order_index_idx`(`group_id`, `phase`, `order_index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_assessment_answers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `value` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_assessment_answers_user_id_question_id_idx`(`user_id`, `question_id`),
    UNIQUE INDEX `user_assessment_answers_user_id_question_id_key`(`user_id`, `question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `group_assessment_questions` ADD CONSTRAINT `group_assessment_questions_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `learning_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_assessment_answers` ADD CONSTRAINT `user_assessment_answers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_assessment_answers` ADD CONSTRAINT `user_assessment_answers_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `group_assessment_questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
