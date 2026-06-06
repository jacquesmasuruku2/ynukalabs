-- Blocs galerie : titre d'événement, lien Drive, jusqu'à 6 images par bloc
CREATE TABLE IF NOT EXISTS `gallery_blocks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `drive_url` VARCHAR(512) NULL,
  `position` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Lier les images existantes à un bloc (si la colonne n'existe pas encore)
-- Exécuter manuellement si ALTER échoue (colonne déjà présente) :
-- ALTER TABLE `gallery_images` ADD COLUMN `block_id` INT NULL AFTER `id`;
-- ALTER TABLE `gallery_images` ADD INDEX `idx_gallery_images_block_id` (`block_id`);
