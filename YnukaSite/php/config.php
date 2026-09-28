<?php
// Configuration de la base de données MySQL pour PRODUCTION
// Sur le serveur, la base de données est accessible via localhost

define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');
define('DB_CHARSET', 'utf8mb4');

// Configuration de l'affichage des erreurs
// En production, désactivez l'affichage des erreurs pour la sécurité
error_reporting(E_ALL);
// Pour débogage temporaire, activer l'affichage des erreurs.
// Remettre à 0 en production après correction.
ini_set('display_errors', 1);
ini_set('log_errors', 1);     // Erreurs loggées dans les fichiers du serveur

// Préparer une variable de retour d'erreur si la connexion échoue.
$pdo = null;
$dbConnectionErrors = [];
$dbConnectionError = null;

// Essayer la connexion avec l'hôte configuré, puis 127.0.0.1 si 'localhost' pose problème.
$hostsToTry = [DB_HOST];
if (DB_HOST === 'localhost') {
    $hostsToTry[] = '127.0.0.1';
}

foreach ($hostsToTry as $hostAttempt) {
    try {
        $dsn = "mysql:host=" . $hostAttempt . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $pdo = new PDO(
            $dsn,
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
        // Connexion réussie
        break;
    } catch (PDOException $e) {
        $dbConnectionErrors[] = "($hostAttempt) " . $e->getMessage();
        error_log("Erreur de connexion à la base de données ($hostAttempt) : " . $e->getMessage());
        // essayer l'hôte suivant si présent
    }
}

if ($pdo === null && !empty($dbConnectionErrors)) {
    $dbConnectionError = implode(' | ', $dbConnectionErrors);
}

// Si $pdo est null, on laisse $dbConnectionError renseigné pour que l'API puisse renvoyer du JSON.
?>
