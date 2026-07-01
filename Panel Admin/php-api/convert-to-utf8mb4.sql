-- Convert all relevant tables to utf8mb4 for emoji support
USE ynukalab_database_website;

-- Convert blog_comments table (converts all columns automatically)
ALTER TABLE `blog_comments` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Convert blog_posts table (converts all columns automatically)
ALTER TABLE `blog_posts` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Convert blog_comment_likes table if it exists (converts all columns automatically)
ALTER TABLE `blog_comment_likes` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Convert blog_post_likes table if it exists (converts all columns automatically)
ALTER TABLE `blog_post_likes` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
