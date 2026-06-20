<?php
/**
 * Version de diagnostic progressive du fichier Panel Admin
 * Uploader ce fichier sur le serveur et tester étape par étape
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');

try {
    // ÉTAPE 1: Test basique
    echo json_encode(['step' => 1, 'status' => 'basic_php_ok']);
    
    // ÉTAPE 2: Test session
    $ynukaHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || ((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || ((int) ($_SERVER['SERVER_PORT'] ?? 0) === 443);
    
    echo json_encode(['step' => 2, 'status' => 'https_check_ok', 'https' => $ynukaHttps]);
    
    // ÉTAPE 3: Test configuration session
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_domain', '.ynukalabs.com');
    ini_set('session.cookie_path', '/');
    ini_set('session.cookie_secure', $ynukaHttps ? '1' : '0');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');
    
    echo json_encode(['step' => 3, 'status' => 'session_config_ok']);
    
    // ÉTAPE 4: Test session start
    if (session_status() === PHP_SESSION_NONE) {
        session_name('YNUKA_ADMIN');
        session_start();
    }
    
    echo json_encode(['step' => 4, 'status' => 'session_started_ok']);
    
    // ÉTAPE 5: Test définition constantes
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'ynukalab_database_website');
    define('DB_USER', 'ynukalab_admin-jacques');
    define('DB_PASS', 'Admin-Jacques.ynuka_db');
    define('JWT_SECRET', 'MXsiCkSR5QexkLqRj5z6l6iF3QW6xWwPO4cXe0GX5gE=');
    
    echo json_encode(['step' => 5, 'status' => 'constants_defined_ok']);
    
    // ÉTAPE 6: Test connexion DB
    try {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER, DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
        echo json_encode(['step' => 6, 'status' => 'db_connection_ok']);
    } catch (PDOException $e) {
        echo json_encode(['step' => 6, 'status' => 'db_connection_failed', 'error' => $e->getMessage()]);
        exit;
    }
    
    // ÉTAPE 7: Test CORS headers
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    echo json_encode(['step' => 7, 'status' => 'cors_headers_ok']);
    
    // ÉTAPE 8: Test lecture action
    $action = $_GET['action'] ?? 'ping';
    echo json_encode(['step' => 8, 'status' => 'action_read_ok', 'action' => $action]);
    
    // ÉTAPE 9: Test ping
    if ($action === 'ping') {
        echo json_encode([
            'step' => 9, 
            'status' => 'ping_ok',
            'all_steps_passed' => true,
            'php_version' => PHP_VERSION
        ]);
    }
    
} catch (Throwable $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>
