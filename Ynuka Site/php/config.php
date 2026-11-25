<?php
// Configuration de la base de données MySQL.
// AUCUN secret ne doit être écrit dans ce fichier (il est versionné dans Git).
// Les identifiants sont lus depuis config.local.php (non versionné, à créer sur le
// serveur à partir de config.local.example.php) ou depuis les variables d'environnement.

if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
}

function ynuka_cfg($name, $default = null) {
    if (defined($name)) return constant($name);
    $env = getenv($name);
    return ($env !== false && $env !== '') ? $env : $default;
}

if (!defined('DB_HOST')) define('DB_HOST', ynuka_cfg('DB_HOST', 'localhost'));
if (!defined('DB_NAME')) define('DB_NAME', ynuka_cfg('DB_NAME', ''));
if (!defined('DB_USER')) define('DB_USER', ynuka_cfg('DB_USER', ''));
if (!defined('DB_PASS')) define('DB_PASS', ynuka_cfg('DB_PASS', ''));
if (!defined('DB_CHARSET')) define('DB_CHARSET', 'utf8mb4');

// Production : on n'affiche jamais les erreurs PHP au visiteur (elles sont seulement journalisées).
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

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
