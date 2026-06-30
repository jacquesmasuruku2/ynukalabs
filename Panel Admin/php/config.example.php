<?php
// Configuration de la base de données MySQL
// Copiez ce fichier en config.php et remplacez les valeurs par vos identifiants réels
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
define('DB_CHARSET', 'utf8mb4');

// Configuration de l'affichage des erreurs
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

$pdo = null;
$dbConnectionErrors = [];
$dbConnectionError = null;

// Tentative de connexion principale
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
        break;
    } catch (PDOException $e) {
        $dbConnectionErrors[] = "($hostAttempt) " . $e->getMessage();
        error_log("Erreur de connexion à la base de données ($hostAttempt) : " . $e->getMessage());
    }
}

if ($pdo === null && !empty($dbConnectionErrors)) {
    $dbConnectionError = implode(' | ', $dbConnectionErrors);
}

// Configuration Brevo
define('BREVO_API_KEY', 'your_brevo_api_key_here');

function getDBConnection() {
    global $pdo;
    if ($pdo === null) {
        die('Erreur : La connexion initiale à la base de données a échoué.');
    }
    return $pdo;
}

function checkAdminSession() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        header('Location: /admin');
        exit();
    }
}
?>
