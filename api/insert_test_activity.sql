-- Script SQL pour insérer une notification de test
-- À exécuter via phpMyAdmin ou en ligne de commande

INSERT INTO admin_activities (type, user, message, details, metadata, read, created_at, updated_at)
VALUES (
    'login',
    'test@ynukalabs.com',
    'Test de notification',
    'Ceci est une notification de test pour vérifier que le système fonctionne',
    '{"ip": "127.0.0.1", "location": "Test"}',
    FALSE,
    NOW(),
    NOW()
);

-- Vérifier l'insertion
SELECT * FROM admin_activities ORDER BY created_at DESC LIMIT 1;
