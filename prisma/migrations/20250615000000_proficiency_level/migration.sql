-- AlterTable
ALTER TABLE `users` ADD COLUMN `proficiency_score` INTEGER NOT NULL DEFAULT 0;

-- AlterEnum (MySQL: modify column enum on user_point_events)
ALTER TABLE `user_point_events` MODIFY `event_type` ENUM('MATERIAL_COMPLETE', 'CORRECT_ANSWER', 'ON_TIME_BONUS', 'DISCUSSION_MILESTONE', 'GROUP_COMPLETE', 'PROFICIENCY_LEVEL_UP') NOT NULL;

-- Backfill proficiency_score from existing answers
UPDATE `users` u
SET `proficiency_score` = (
  SELECT COALESCE(SUM(
    ROUND(COALESCE(ua.`score_percent`, IF(ua.`is_correct`, 100, 0)) / 10)
  ), 0)
  FROM `user_answers` ua
  WHERE ua.`user_id` = u.`id`
);
