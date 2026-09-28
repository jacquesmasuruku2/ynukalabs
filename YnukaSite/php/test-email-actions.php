<?php
/**
 * Test script to verify if email actions are available in api.php
 * 
 * Usage: Upload this file to the same directory as api.php and access it via browser
 * Example: https://admin.ynukalabs.com/api/test-email-actions.php
 */

header('Content-Type: application/json; charset=utf-8');

$apiUrl = 'https://admin.ynukalabs.com/api/api.php';

// Test 1: Check if API is accessible
echo "=== Test 1: API Accessibility ===\n";
$test1 = file_get_contents($apiUrl . '?action=ping');
echo "Ping response: " . $test1 . "\n\n";

// Test 2: Check if subscribe_newsletter action exists
echo "=== Test 2: Newsletter Subscription Action ===\n";
$test2Data = json_encode(['name' => 'Test User', 'email' => 'test@example.com']);
$test2Options = [
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $test2Data
    ]
];
$test2Context = stream_context_create($test2Options);
$test2 = @file_get_contents($apiUrl . '?action=subscribe_newsletter', false, $test2Context);
echo "Newsletter action response: " . $test2 . "\n\n";

// Test 3: Check if submit_contact_form action exists
echo "=== Test 3: Contact Form Action ===\n";
$test3Data = json_encode([
    'name' => 'Test User',
    'email' => 'test@example.com',
    'phone' => '+1234567890',
    'subject' => 'Test Subject',
    'message' => 'Test message'
]);
$test3Options = [
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $test3Data
    ]
];
$test3Context = stream_context_create($test3Options);
$test3 = @file_get_contents($apiUrl . '?action=submit_contact_form', false, $test3Context);
echo "Contact form action response: " . $test3 . "\n\n";

echo "=== Summary ===\n";
echo "If you see 'Unknown action' errors for subscribe_newsletter or submit_contact_form,\n";
echo "then the api.php file needs to be updated with the new handlers.\n";
echo "Please deploy the modified api.php file from: c:\\Projets Apps\\Site-Ynukalabs\\Ynuka Site\\php\\api.php\n";
?>
