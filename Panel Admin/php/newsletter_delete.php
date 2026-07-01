<?php
/**
 * Script pour supprimer une newsletter
 */
require_once __DIR__ . '/config.php';

session_start();

if (!isset($_GET['id'])) {
    header('Location: ./index.php');
    exit();
}

try {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("DELETE FROM newsletters WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    
    header('Location: ./index.php?success=deleted');
    exit();
    
} catch (PDOException $e) {
    error_log("Erreur de suppression: " . $e->getMessage());
    header('Location: ./index.php?error=delete_failed');
    exit();
}
?>
