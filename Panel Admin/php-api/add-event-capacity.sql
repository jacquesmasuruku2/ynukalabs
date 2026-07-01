-- Ajouter la colonne capacity à la table events
-- Exécuter ce script sur la base de données ynukalab_database_website

USE ynukalab_database_website;

SET @dbname = 'ynukalab_database_website';
SET @tablename = 'events';

-- Vérifier si la colonne capacity existe
SET @columnname = 'capacity';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  CONCAT(
    'ALTER TABLE ', @tablename,
    ' ADD COLUMN `', @columnname, '` INT DEFAULT 100 COMMENT "Nombre maximum de participants"'
  )
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
