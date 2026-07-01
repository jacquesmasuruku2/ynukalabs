-- Add author field to blog_posts table
USE ynukalab_database_website;

ALTER TABLE `blog_posts` 
ADD COLUMN `author` VARCHAR(255) NULL AFTER `excerpt`,
ADD COLUMN `author_fr` VARCHAR(255) NULL AFTER `author`;
