-- Table pour stocker les activités et notifications du panel admin
CREATE TABLE IF NOT EXISTS `admin_activities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` ENUM('login', 'register', 'message', 'notification', 'alert') NOT NULL,
  `user` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `details` TEXT,
  `metadata` JSON,
  `read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_type` (`type`),
  INDEX `idx_user` (`user`),
  INDEX `idx_read` (`read`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
