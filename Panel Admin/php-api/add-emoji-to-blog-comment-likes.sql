-- Add emoji column to existing blog_comment_likes table
USE ynukalab_database_website;

-- Ensure table uses utf8mb4 charset for emoji support
ALTER TABLE `blog_comment_likes` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add emoji column with utf8mb4 support
ALTER TABLE `blog_comment_likes` ADD COLUMN `emoji` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '👍' AFTER `user_email`;
