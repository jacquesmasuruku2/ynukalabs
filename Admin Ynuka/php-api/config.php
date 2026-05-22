<?php
// Configuration Admin API
// Points vers la même base de données que le site public

define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');
define('DB_CHARSET', 'utf8mb4');

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

$pdo = null;
$dbConnectionError = null;

$hostsToTry = [DB_HOST, '127.0.0.1'];

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
            ]
        );
        break;
    } catch (PDOException $e) {
        error_log("DB Connection Error ($hostAttempt): " . $e->getMessage());
        $dbConnectionError = $e->getMessage();
    }
}

if (!$pdo) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $dbConnectionError]);
    exit;
}
