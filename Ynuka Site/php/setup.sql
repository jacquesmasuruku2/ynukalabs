-- Ynuka Labs Database Setup
-- This file creates necessary tables and admin user
-- Execute with: mysql -u ynukalab_admin-jacques -p ynukalab_database_website < setup.sql

USE ynukalab_database_website;

-- ============ ADMIN USERS TABLE ============
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255),
  `name` VARCHAR(120),
  `google_id` VARCHAR(255) UNIQUE,
  `avatar_url` VARCHAR(500),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============ ALTER TABLE (if table already exists) ============
-- These will fail silently if columns already exist
ALTER TABLE `admin_users` ADD COLUMN `google_id` VARCHAR(255) UNIQUE AFTER `password_hash`;
ALTER TABLE `admin_users` ADD COLUMN `avatar_url` VARCHAR(500) AFTER `google_id`;
ALTER TABLE `admin_users` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;
ALTER TABLE `admin_users` ADD INDEX idx_google_id (google_id);

-- ============ ADMIN ALLOWED EMAILS TABLE ============
CREATE TABLE IF NOT EXISTS `admin_allowed_emails` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `note` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Generate hash with: php generate-admin.php "YourPassword"
-- Then replace BCRYPT_HASH_HERE with the actual hash
-- INSERT INTO `admin_users` (email, password_hash, name) VALUES
-- ('info@ynukalabs.com', '$2y$10$REPLACE_WITH_BCRYPT_HASH_FROM_generate-admin.php', 'Admin');

-- ============ EXISTING TABLES ============
-- The following tables should already exist in your database:
-- - users (utilisateurs du système)
-- - user_roles (rôles des utilisateurs)
-- - blog_posts (articles de blog)
-- - blog_comments (commentaires du blog)
-- - contact_messages (messages de contact)
-- - donations (dons)
-- - events (événements)
-- - event_registrations (inscriptions aux événements)
-- - gallery_images (images de galerie)
-- - newsletter_subscribers (abonnés newsletter)
-- - projects (projets)
-- - resource_items (ressources)
-- - team_members (membres de l'équipe)
