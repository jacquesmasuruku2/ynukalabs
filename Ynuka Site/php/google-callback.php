<?php
/**
 * Google OAuth Callback Handler
 * 
 * This file handles the callback from Google OAuth.
 * After user authorizes, Google redirects here with an authorization code.
 * We exchange the code for tokens and redirect back to the frontend with the JWT in the hash.
 */

require_once 'config.php';
require_once 'google-oauth.php';

header('Content-Type: application/json; charset=utf-8');

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    // Check for authorization code
    if (!isset($_GET['code'])) {
        if (isset($_GET['error'])) {
            $error = urlencode($_GET['error'] . ': ' . ($_GET['error_description'] ?? 'Unknown error'));
            header("Location: /login#error=$error");
            exit;
        }
        throw new Exception('Missing authorization code from Google');
    }
    
    // Verify state for CSRF protection
    session_start();
    if (!isset($_GET['state']) || $_GET['state'] !== ($_SESSION['oauth_state'] ?? '')) {
        throw new Exception('Invalid state parameter - CSRF check failed');
    }
    
    // Exchange authorization code for tokens
    $tokens = exchange_google_code_for_token($_GET['code']);
    
    if (!isset($tokens['id_token'])) {
        throw new Exception('No ID token returned from Google');
    }
    
    // Get user info from ID token
    $googleUser = get_google_user_info($tokens['id_token']);
    
    if (!$googleUser) {
        throw new Exception('Failed to extract user info from Google token');
    }
    
    $email = strtolower(trim($googleUser['email']));
    
    // Load allowed emails list
    require_once 'api.php'; // This will define is_email_allowed()
    
    // Check if email is in whitelist
    if (!is_email_allowed($email)) {
        $error = urlencode('Email not authorized for admin access: ' . $email);
        header("Location: /login#error=$error");
        exit;
    }
    
    // TODO: Generate JWT and redirect with token in hash
    // For now, redirect with success message
    $message = urlencode('Google authentication successful. Processing...');
    header("Location: /login#success=$message");
    exit;
    
} catch (Exception $e) {
    error_log("Google OAuth Callback Error: " . $e->getMessage());
    $error = urlencode('Authentication failed: ' . $e->getMessage());
    header("Location: /login#error=$error");
    exit;
}
