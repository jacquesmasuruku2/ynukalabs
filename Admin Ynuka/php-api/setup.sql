-- Ynuka Labs Admin — table administrateurs (+ colonnes Google OAuth)
-- À exécuter UNE FOIS sur la base ynukalab_database_website

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NULL,
  `name` VARCHAR(120) NULL,
  `google_id` VARCHAR(64) NULL UNIQUE,
  `avatar_url` VARCHAR(512) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Créer un premier compte admin (mot de passe classique).
-- Générez le hash : php -r "echo password_hash('VotreMotDePasse', PASSWORD_BCRYPT);"
INSERT INTO `admin_users` (email, password_hash, name) VALUES
('admin@ynukalabs.com', '$2y$10$REPLACE_WITH_BCRYPT_HASH', 'Admin')
ON DUPLICATE KEY UPDATE email = email;
