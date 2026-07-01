-- Structure de la table blog_comment_likes
-- Cette table stocke les likes individuels (qui a liké quoi)

CREATE TABLE IF NOT EXISTS `blog_comment_likes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `comment_id` INT NOT NULL,
  `user_email` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_like` (`comment_id`, `user_email`),
  KEY `idx_comment_id` (`comment_id`),
  KEY `idx_user_email` (`user_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- S'assurer que la table blog_comments a la colonne likes
ALTER TABLE `blog_comments` 
ADD COLUMN IF NOT EXISTS `likes` INT DEFAULT 0 AFTER `content`;

-- Initialiser les likes à 0 si la colonne vient d'être ajoutée
UPDATE `blog_comments` SET `likes` = 0 WHERE `likes` IS NULL;
