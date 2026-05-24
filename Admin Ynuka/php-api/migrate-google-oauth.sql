-- Migration Google OAuth — idempotente (réexécutable sans erreur #1060)
-- Base : ynukalab_database_website — phpMyAdmin → onglet SQL → Exécuter tout le bloc

-- 1) Mot de passe optionnel (comptes Google-only)
ALTER TABLE `admin_users`
  MODIFY COLUMN `password_hash` VARCHAR(255) NULL;

-- 2) Colonne google_id (uniquement si elle n'existe pas encore)
SET @sql_google_id = (
  SELECT IF(
    COUNT(*) > 0,
    'SELECT ''google_id déjà présent'' AS info',
    'ALTER TABLE `admin_users` ADD COLUMN `google_id` VARCHAR(64) NULL UNIQUE AFTER `name`'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'admin_users'
    AND COLUMN_NAME = 'google_id'
);
PREPARE stmt FROM @sql_google_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3) Colonne avatar_url (uniquement si elle n'existe pas encore)
SET @sql_avatar = (
  SELECT IF(
    COUNT(*) > 0,
    'SELECT ''avatar_url déjà présent'' AS info',
    'ALTER TABLE `admin_users` ADD COLUMN `avatar_url` VARCHAR(512) NULL AFTER `google_id`'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'admin_users'
    AND COLUMN_NAME = 'avatar_url'
);
PREPARE stmt FROM @sql_avatar;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4) Vérification (résultat attendu : google_id + avatar_url visibles)
SHOW COLUMNS FROM `admin_users`;
