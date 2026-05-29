-- Ynuka Labs Admin — créer la table des administrateurs
-- À exécuter UNE FOIS sur la base ynukalab_database_website

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(120) NULL,
  `avatar_url` VARCHAR(500) NULL,
  `google_id` VARCHAR(64) NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Si la table existe déjà, ajoutez les colonnes Google :
-- ALTER TABLE `admin_users` ADD COLUMN `avatar_url` VARCHAR(500) NULL;
-- ALTER TABLE `admin_users` ADD COLUMN `google_id` VARCHAR(64) NULL UNIQUE;
-- Pour Google OAuth, password_hash peut être vide (les comptes Google n'ont pas de mot de passe local) :
-- ALTER TABLE `admin_users` MODIFY `password_hash` VARCHAR(255) NULL;

-- Créer un premier compte admin (option A — SQL) :
--   php -r "echo password_hash('VotreMotDePasse', PASSWORD_BCRYPT);"
-- INSERT INTO `admin_users` (email, password_hash, name) VALUES
-- ('admin@ynukalabs.com', '$2y$10$...', 'Admin');

-- Emails autorisés à s'inscrire par formulaire quand ALLOW_REGISTRATION=false sur le serveur.
-- (Les connexions Google créent le compte automatiquement si GOOGLE_OPEN_ACCESS=true, défaut.)
CREATE TABLE IF NOT EXISTS `admin_allowed_emails` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `note` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Exemple : autoriser un collaborateur à créer un mot de passe
-- INSERT INTO admin_allowed_emails (email, note) VALUES ('collab@example.com', 'Équipe marketing');

-- Connexion Google : par défaut tout email Google vérifié peut entrer (GOOGLE_OPEN_ACCESS=true).
-- Pour restreindre : GOOGLE_OPEN_ACCESS=false + emails dans admin_allowed_emails.
