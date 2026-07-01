<?php
/**
 * Endpoint pour uploader les CVs des candidats
 * Chemin: /php/upload-cv.php
 */

// CORS: Autoriser le site public et l'admin panel
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
$allowedOrigins = ['https://ynukalabs.com', 'https://www.ynukalabs.com', 'https://admin.ynukalabs.com'];
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Configuration
$UPLOAD_DIR = __DIR__ . '/../uploads/cvs/';
$ALLOWED_MIME = 'application/pdf';
$MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
$BASE_URL = 'https://admin.ynukalabs.com/uploads/cvs/';

// Create uploads directory if it doesn't exist
if (!is_dir($UPLOAD_DIR)) {
    mkdir($UPLOAD_DIR, 0755, true);
}

// Check if file is uploaded
if (!isset($_FILES['cv_file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit();
}

$file = $_FILES['cv_file'];

// Validate file
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Upload failed: ' . $file['error']]);
    exit();
}

// Check MIME type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if ($mime !== $ALLOWED_MIME) {
    http_response_code(400);
    echo json_encode(['error' => 'Only PDF files are allowed']);
    exit();
}

// Check file size
if ($file['size'] > $MAX_FILE_SIZE) {
    http_response_code(400);
    echo json_encode(['error' => 'File size exceeds 5 MB limit']);
    exit();
}

// Generate unique filename
$timestamp = time();
$random = bin2hex(random_bytes(8));
$original_name = pathinfo($file['name'], PATHINFO_FILENAME);
$filename = $timestamp . '_' . $random . '_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $original_name) . '.pdf';
$filepath = $UPLOAD_DIR . $filename;

// Move file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
    exit();
}

// Return success with file URL
$file_url = $BASE_URL . $filename;
http_response_code(200);
echo json_encode([
    'success' => true,
    'file_url' => $file_url,
    'filename' => $filename
]);
?>
