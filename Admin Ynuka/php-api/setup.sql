-- Ynuka Labs Admin — créer la table des administrateurs
-- À exécuter UNE FOIS sur la base ynukalab_database_website

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(120) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Créer un premier compte admin.
-- Remplacez le hash ci-dessous : générez-le avec
--   php -r "echo password_hash('VotreMotDePasse', PASSWORD_BCRYPT);"
-- puis collez le résultat dans password_hash.
INSERT INTO `admin_users` (email, password_hash, name) VALUES
('admin@ynukalabs.com', '$2y$10$REPLACE_WITH_BCRYPT_HASH', 'Admin');
