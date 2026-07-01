-- Add columns to opportunity_applications table if they don't exist
ALTER TABLE `opportunity_applications`
ADD COLUMN IF NOT EXISTS `linkedin_url` varchar(500) DEFAULT NULL AFTER `user_avatar`,
ADD COLUMN IF NOT EXISTS `twitter_url` varchar(500) DEFAULT NULL AFTER `linkedin_url`,
ADD COLUMN IF NOT EXISTS `portfolio_url` varchar(500) DEFAULT NULL AFTER `twitter_url`,
ADD COLUMN IF NOT EXISTS `message` text DEFAULT NULL AFTER `portfolio_url`,
ADD COLUMN IF NOT EXISTS `cv_file_url` varchar(500) DEFAULT NULL AFTER `message`;

-- Add cv_file_url column to opportunity_motivation_forms table if it doesn't exist
ALTER TABLE `opportunity_motivation_forms`
ADD COLUMN IF NOT EXISTS `cv_file_url` varchar(500) DEFAULT NULL AFTER `message`;
