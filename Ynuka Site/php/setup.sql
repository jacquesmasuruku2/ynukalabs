-- Ynuka Labs Database Setup
-- This file creates necessary tables and admin user
-- Execute with: mysql -u ynukalab_admin-jacques -p ynukalab_database_website < setup.sql

USE ynukalab_database_website;

-- ============ ADMIN USERS TABLE ============
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(120) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Generate hash with: php generate-admin.php "YourPassword"
-- Then replace BCRYPT_HASH_HERE with the actual hash
INSERT INTO `admin_users` (email, password_hash, name) VALUES
('admin@ynukalabs.com', '$2y$10$REPLACE_WITH_BCRYPT_HASH_FROM_generate-admin.php', 'Admin');

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
