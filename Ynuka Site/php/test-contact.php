<?php
/**
 * Test script for contact form API
 * This simulates what the React contact form sends to the API
 */

echo "=== Testing Contact Form API ===\n\n";

$apiUrl = "https://ynukalabs.com/php/api.php";

// Test data matching the contact form
$testData = [
    'name' => 'Test User',
    'email' => 'test@example.com',
    'subject' => 'Test Subject',
    'message' => 'This is a test message from the contact form.'
];

echo "Sending test data to API:\n";
echo "URL: $apiUrl\n";
echo "Data: " . json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";

// Initialize cURL
$ch = curl_init($apiUrl . "?action=create&resource=contact_messages");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Status Code: $httpCode\n";
if ($error) {
    echo "cURL Error: $error\n";
}
echo "\nResponse:\n";
echo $response . "\n";

if ($httpCode === 201 || $httpCode === 200) {
    echo "\n✅ SUCCESS: Contact form API is working!\n";
} else {
    echo "\n❌ FAILED: Contact form API returned error\n";
}
?>
