-- Votes / actions de gouvernance Goma DRep (affichage public, sans données fictives)
CREATE TABLE IF NOT EXISTS `goma_drep_actions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `title_fr` VARCHAR(255) DEFAULT NULL,
  `action_type` VARCHAR(100) NOT NULL,
  `status` VARCHAR(100) NOT NULL,
  `date_or_epoch` VARCHAR(100) NOT NULL,
  `vote` VARCHAR(20) NOT NULL COMMENT 'yes | no | abstain',
  `rationale` TEXT NOT NULL,
  `rationale_fr` TEXT DEFAULT NULL,
  `source_url` VARCHAR(500) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
