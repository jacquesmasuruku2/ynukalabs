-- Create opportunity_motivation_forms table
-- This table stores the motivation forms submitted by candidates for opportunities

CREATE TABLE IF NOT EXISTS `opportunity_motivation_forms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `opportunity_id` int NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_name` varchar(255),
  `user_avatar` longtext,
  `linkedin_url` varchar(500),
  `twitter_url` varchar(500),
  `portfolio_url` varchar(500),
  `message` longtext,
  `cv_file_url` longtext,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_opportunity_id` (`opportunity_id`),
  KEY `idx_user_email` (`user_email`),
  CONSTRAINT `fk_opportunity_motivation_opportunity` FOREIGN KEY (`opportunity_id`) 
    REFERENCES `opportunities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Optional: Add index for faster queries
ALTER TABLE `opportunity_motivation_forms` 
  ADD INDEX `idx_opportunity_email` (`opportunity_id`, `user_email`);

-- If the table already exists and you need to add the cv_file_url column:
-- ALTER TABLE `opportunity_motivation_forms` ADD COLUMN `cv_file_url` longtext;
