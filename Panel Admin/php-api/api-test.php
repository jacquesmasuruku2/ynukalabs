<?php
/**
 * Version de test simplifiée pour identifier l'erreur 500
 * Uploader ce fichier sur le serveur à la place de api.php temporairement
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');

try {
    // Test 1: PHP fonctionne
    echo json_encode(['status' => 'php_working', 'php_version' => PHP_VERSION]);
    
} catch (Throwable $e) {
    echo json_encode(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
}
?>
