<?php
/**
 * Test script to verify API accessibility
 * Upload this file to the same directory as api.php on the server
 * Access via: https://admin.ynukalabs.com/api/test-api.php
 */

header('Content-Type: text/plain; charset=utf-8');

echo "=== Test d'accessibilité de l'API ===\n\n";

$apiUrl = 'https://admin.ynukalabs.com/api/api.php';

// Test 1: Ping
echo "Test 1: Ping\n";
$pingResult = @file_get_contents($apiUrl . '?action=ping');
if ($pingResult === false) {
    echo "❌ ÉCHEC: Impossible de contacter l'API\n";
    echo "Vérifiez que le fichier api.php existe sur le serveur\n";
} else {
    echo "✅ SUCCÈS: API accessible\n";
    echo "Réponse: " . substr($pingResult, 0, 200) . "...\n\n";
}

// Test 2: Newsletter action
echo "Test 2: Action subscribe_newsletter\n";
$newsletterData = json_encode(['name' => 'Test', 'email' => 'test@example.com']);
$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $newsletterData
    ]
]);
$newsletterResult = @file_get_contents($apiUrl . '?action=subscribe_newsletter', false, $context);
if ($newsletterResult === false) {
    echo "❌ ÉCHEC: Action subscribe_newsletter non disponible\n";
} else {
    echo "✅ SUCCÈS: Action subscribe_newsletter disponible\n";
    echo "Réponse: " . substr($newsletterResult, 0, 200) . "...\n\n";
}

// Test 3: Contact form action
echo "Test 3: Action submit_contact_form\n";
$contactData = json_encode([
    'name' => 'Test User',
    'email' => 'test@example.com',
    'subject' => 'Test Subject',
    'message' => 'Test message'
]);
$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $contactData
    ]
]);
$contactResult = @file_get_contents($apiUrl . '?action=submit_contact_form', false, $context);
if ($contactResult === false) {
    echo "❌ ÉCHEC: Action submit_contact_form non disponible\n";
} else {
    echo "✅ SUCCÈS: Action submit_contact_form disponible\n";
    echo "Réponse: " . substr($contactResult, 0, 200) . "...\n\n";
}

echo "=== Instructions ===\n";
echo "Si les tests échouent:\n";
echo "1. Vérifiez que le fichier api.php modifié est déployé sur le serveur\n";
echo "2. Chemin du fichier local: c:\\Projets Apps\\Site-Ynukalabs\\Panel Admin\\php-api\\api.php\n";
echo "3. Chemin du serveur: /domains/admin.ynukalabs.com/public_html/api/api.php\n";
echo "4. Déployez le fichier modifié via FTP/cPanel/SSH\n";
?>
