<?php
// Configuration de la base de données MySQL pour PRODUCTION
// Sur le serveur, la base de données est accessible via localhost

define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab');
define('DB_PASS', 'ZA5!s7Qf');
define('DB_CHARSET', 'utf8mb4');

// Configuration de l'affichage des erreurs
// En production, désactivez l'affichage des erreurs pour la sécurité
error_reporting(E_ALL);
ini_set('display_errors', 0); // Désactivé en production
ini_set('log_errors', 1);     // Erreurs loggées dans les fichiers du serveur

// Création de la connexion PDO
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    die("Erreur de connexion à la base de données : " . $e->getMessage());
}
?>
