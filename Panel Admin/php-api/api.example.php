<?php
// ============ CONFIGURATION DU FUSEAU HORAIRE ============
// Configuration du fuseau horaire pour Goma/Lubumbashi (GMT+2)
date_default_timezone_set('Africa/Lubumbashi');

// ============ SESSION (OAuth state — avant toute sortie) ============
$ynukaHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || ((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
    || ((int) ($_SERVER['SERVER_PORT'] ?? 0) === 443);

ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.cookie_domain', '.ynukalabs.com');
ini_set('session.cookie_path', '/');
ini_set('session.cookie_secure', $ynukaHttps ? '1' : '0');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');

if (session_status() === PHP_SESSION_NONE) {
    session_name('YNUKA_ADMIN');
    session_start();
}

/**
 * Ynuka Labs — Admin API (single-file PHP backend)
 *
 * DEPLOYMENT:
 *   1. Copiez ce fichier en api.php
 *   2. Remplacez les constantes DB_* et JWT_SECRET ci-dessous
 *   3. Uploadez le fichier sur votre serveur
 */

// ============ CONFIGURATION BASE DE DONNÉES ============
// IMPORTANT: Remplacez ces valeurs par vos identifiants réels
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
define('DB_CHARSET', 'utf8mb4');

// ============ CONFIGURATION JWT ============
// IMPORTANT: Générez une clé secrète forte et unique (min 32 caractères)
define('JWT_SECRET', 'your_jwt_secret_key_minimum_32_characters_long');

// ============ CONFIGURATION CORS ============
define('ALLOWED_ORIGIN', 'https://ynukalabs.com'); // En production
// define('ALLOWED_ORIGIN', '*'); // Pour développement uniquement

// ============ CONFIGURATION GOOGLE OAUTH ============
define('GOOGLE_CLIENT_ID', 'your_google_client_id');
define('GOOGLE_CLIENT_SECRET', 'your_google_client_secret');
define('GOOGLE_REDIRECT_URI', 'https://ynukalabs.com/php-api/api.php');

// Le reste du code API reste identique...
