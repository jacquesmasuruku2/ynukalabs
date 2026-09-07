<?php
/**
 * Ynuka Labs — Unified REST API
 * Used by both Admin Panel and Public Website
 * 
 * Deployment: Upload to /php/api.php
 * Database: ynukalab_database_website
 */

// ============ HEADERS ============
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ============ CONFIG ============
require_once 'config.php';
if (file_exists('google-oauth.php')) {
    require_once 'google-oauth.php';
}

// ============ CHECK DATABASE CONNECTION ============
// Si la connexion échoue, retourner une erreur JSON appropriée
if ($pdo === null) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(503);
    echo json_encode([
        'error' => 'Database connection failed',
        'details' => $dbConnectionError ?? 'Unknown error'
    ]);
    exit;
}

// ============ HELPER FUNCTIONS ============
function json_response($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function error($message, $code = 400) {
    json_response(['error' => $message], $code);
}

function jwt_secret() {
    return 'CHANGE_ME_TO_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARS';
}

function encode_jwt($payload) {
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $body = base64_encode(json_encode($payload));
    $signature = hash_hmac('sha256', "$header.$body", jwt_secret(), true);
    $signature = base64_encode($signature);
    return "$header.$body.$signature";
}

function decode_jwt($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    
    $payload = json_decode(base64_decode($parts[1]), true);
    if (!is_array($payload)) return null;
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) return null;
    
    return $payload;
}

function get_auth_user() {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.+)/', $header, $matches)) return null;
    return decode_jwt($matches[1]);
}

// ============ ALLOWED ADMIN EMAILS (WHITELIST) ============
// Only these emails can authenticate via Google OAuth to the admin panel
$allowed_admin_emails = [
    'jacquesmasuruku2@gmail.com',
    'balumeboaz@gmail.com',
    'martinmusagara@gmail.com',
    'mwatsimulamoolivier@gmail.com',
];

function is_email_allowed($email) {
    global $allowed_admin_emails;
    return in_array(strtolower(trim($email)), array_map('strtolower', $allowed_admin_emails), true);
}

// ============ DATABASE TABLES ============
$allowed_tables = [
    'users', 'user_roles', 'blog_posts', 'blog_comments',
    'contact_messages', 'donations', 'events', 'event_registrations',
    'gallery_images', 'gallery_events', 'newsletter_subscribers', 'projects',
    'resource_items', 'resource_sections', 'team_members', 'admin_users',
];

// ============ ROUTES ============
$action = $_GET['action'] ?? '';
$resource = $_GET['resource'] ?? '';
$id = $_GET['id'] ?? null;
$page = intval($_GET['page'] ?? 1);
$limit = intval($_GET['limit'] ?? 25);
$search = $_GET['search'] ?? '';

$body = json_decode(file_get_contents('php://input'), true) ?? [];

// Handle legacy format: { table: "...", data: {...} }
if (!empty($body['table']) && empty($resource)) {
    $resource = $body['table'];
    if (!empty($body['data']) && is_array($body['data'])) {
        $body = $body['data'];
    }
}

try {
    // PING (diagnostic, no auth)
    if ($action === 'ping') {
        $tables = [];
        $result = $pdo->query("SELECT TABLE_NAME as table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA = '" . DB_NAME . "'");
        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
            $tables[] = $row['table_name'];
        }
        json_response([
            'status' => 'ok',
            'database' => DB_NAME,
            'tables' => $tables,
            'timestamp' => date('c')
        ]);
    }

    // GOOGLE AUTH URL (initiate Google OAuth flow)
    if ($action === 'google_auth_url') {
        try {
            $authUrl = get_google_auth_url();
            json_response(['url' => $authUrl]);
        } catch (Exception $e) {
            error('Failed to generate Google auth URL: ' . $e->getMessage(), 500);
        }
    }

    // GOOGLE CALLBACK - Handle redirect from Google OAuth
    // Google redirects here with code and state as query parameters
    if ($action === 'google_callback') {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $state = $_GET['state'] ?? null;
        $code = $_GET['code'] ?? null;
        $errorParam = $_GET['error'] ?? null;

        if ($errorParam) {
            $errorDescription = $_GET['error_description'] ?? 'Unknown error';
            header('Location: /login#error=' . urlencode("Google OAuth: $errorParam - $errorDescription"));
            exit;
        }

        if (!$state || !$code) {
            header('Location: /login#error=' . urlencode('Missing OAuth state or code'));
            exit;
        }

        $sessionState = $_SESSION['oauth_state'] ?? null;
        $stateTime = $_SESSION['oauth_state_time'] ?? 0;

        if (!$sessionState || $state !== $sessionState) {
            header('Location: /login#error=' . urlencode('Invalid OAuth state'));
            exit;
        }

        if (time() - $stateTime > 600) {
            header('Location: /login#error=' . urlencode('OAuth state expired'));
            exit;
        }

        unset($_SESSION['oauth_state'], $_SESSION['oauth_state_time']);

        try {
            $tokenData = exchange_google_code_for_token($code);
            $googleUser = verify_google_id_token($tokenData['id_token']);

            if (!$googleUser) {
                throw new Exception('Invalid or expired Google token');
            }

            $email = strtolower(trim($googleUser['email']));
            if (!is_email_allowed($email)) {
                header('Location: /login#error=' . urlencode('Email not authorized for admin access'));
                exit;
            }

            $stmt = $pdo->prepare('SELECT id, name, email FROM admin_users WHERE email = ?');
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                if ($googleUser['name'] !== $user['name']) {
                    $stmt = $pdo->prepare('UPDATE admin_users SET name = ? WHERE email = ?');
                    $stmt->execute([$googleUser['name'], $email]);
                }
            } else {
                $stmt = $pdo->prepare('INSERT INTO admin_users (email, name, password_hash, created_at) VALUES (?, ?, ?, NOW())');
                $stmt->execute([$email, $googleUser['name'], password_hash('oauth_' . time(), PASSWORD_BCRYPT)]);
                $user = [
                    'id' => $pdo->lastInsertId(),
                    'email' => $email,
                    'name' => $googleUser['name']
                ];
            }

            $token = encode_jwt([
                'user_id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'exp' => time() + 86400 * 7
            ]);

            header('Location: /login#token=' . urlencode($token));
            exit;
        } catch (Exception $e) {
            header('Location: /login#error=' . urlencode('Authentication failed: ' . $e->getMessage()));
            exit;
        }
    }

    // GOOGLE OAUTH VERIFY (validate Google ID token and create/update user)
    // Frontend sends the ID token received from Google Sign-In
    // This validates the token and returns a JWT for your backend
    if ($action === 'google_oauth_verify') {
        if (!isset($body['id_token'])) {
            error('Missing id_token from Google', 400);
        }
        
        try {
            // Verify the Google ID token
            $googleUser = verify_google_id_token($body['id_token']);
            
            if (!$googleUser) {
                error('Invalid or expired Google token', 401);
            }
            
            $email = strtolower(trim($googleUser['email']));
            
            // Validate email is in whitelist
            if (!is_email_allowed($email)) {
                error('Email not authorized for admin access', 403);
            }
            
            // Check if user already exists
            $stmt = $pdo->prepare('SELECT id, name, email FROM admin_users WHERE email = ?');
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                // Update existing user's name if provided and different
                if ($googleUser['name'] !== $user['name']) {
                    $stmt = $pdo->prepare('UPDATE admin_users SET name = ? WHERE email = ?');
                    $stmt->execute([$googleUser['name'], $email]);
                }
            } else {
                // Create new admin user with OAuth (no password needed)
                $stmt = $pdo->prepare('INSERT INTO admin_users (email, name, password_hash, created_at) VALUES (?, ?, ?, NOW())');
                // Generate a placeholder hash for OAuth users (they don't use password)
                $stmt->execute([$email, $googleUser['name'], password_hash('oauth_' . time(), PASSWORD_BCRYPT)]);
                $user = [
                    'id' => $pdo->lastInsertId(),
                    'email' => $email,
                    'name' => $googleUser['name']
                ];
            }
            
            // Generate JWT token with 7 days expiration
            $token = encode_jwt([
                'user_id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'exp' => time() + 86400 * 7  // 7 days
            ]);
            
            json_response([
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name']
                ]
            ]);
        } catch (Exception $e) {
            error('Failed to process Google authentication: ' . $e->getMessage(), 500);
        }
    }

    // GOOGLE OAUTH LOGIN (simple variant - accepts pre-validated email and name)
    // Use this if you have another service pre-validating the email
    if ($action === 'google_oauth_login') {
        if (!isset($body['email']) || !isset($body['name'])) {
            error('Missing email or name from Google', 400);
        }
        
        $email = strtolower(trim($body['email']));
        
        // Validate email is in whitelist
        if (!is_email_allowed($email)) {
            error('Email not authorized for admin access', 403);
        }
        
        try {
            // Check if user already exists
            $stmt = $pdo->prepare('SELECT id, name, email FROM admin_users WHERE email = ?');
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                // Update existing user's name if provided
                if ($body['name'] !== $user['name']) {
                    $stmt = $pdo->prepare('UPDATE admin_users SET name = ? WHERE email = ?');
                    $stmt->execute([$body['name'], $email]);
                }
            } else {
                // Create new admin user with OAuth (no password needed)
                $stmt = $pdo->prepare('INSERT INTO admin_users (email, name, password_hash, created_at) VALUES (?, ?, ?, NOW())');
                // Generate a placeholder hash for OAuth users (they don't use password)
                $stmt->execute([$email, $body['name'], password_hash('oauth_' . time(), PASSWORD_BCRYPT)]);
                $user = [
                    'id' => $pdo->lastInsertId(),
                    'email' => $email,
                    'name' => $body['name']
                ];
            }
        } catch (Exception $e) {
            error('Failed to process Google authentication: ' . $e->getMessage(), 500);
        }
        
        // Generate JWT token with 7 days expiration
        $token = encode_jwt([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'exp' => time() + 86400 * 7  // 7 days
        ]);
        
        json_response([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name']
            ]
        ]);
    }

    // LOGIN (create JWT token)
    if ($action === 'login') {
        if (!isset($body['email']) || !isset($body['password'])) {
            error('Missing email or password', 400);
        }
        
        $stmt = $pdo->prepare('SELECT id, name, email, password_hash FROM admin_users WHERE email = ?');
        $stmt->execute([$body['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || !password_verify($body['password'], $user['password_hash'])) {
            error('Invalid credentials', 401);
        }
        
        $token = encode_jwt([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'exp' => time() + 86400 * 7  // 7 days
        ]);
        
        json_response([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name']
            ]
        ]);
    }

    // ME (get current user)
    if ($action === 'me') {
        $user = get_auth_user();
        if (!$user) error('Unauthorized', 401);
        json_response(['user' => $user]);
    }

    // LIST (get all rows with pagination & search)
    if ($action === 'list') {
        if (!$resource || !in_array($resource, $allowed_tables)) {
            error('Invalid resource', 400);
        }

        $offset = ($page - 1) * $limit;

        // Build WHERE clause for search
        $whereClause = '';
        $params = [];

        if (!empty($search)) {
            // Parse search terms like "published=true" or "title=something"
            $searchTerms = explode(' ', trim($search));
            $conditions = [];

            foreach ($searchTerms as $term) {
                if (strpos($term, '=') !== false) {
                    list($field, $value) = explode('=', $term, 2);
                    $field = trim($field);
                    $value = trim($value);

                    // Validate field exists in table
                    $columnsStmt = $pdo->query("SHOW COLUMNS FROM `$resource`");
                    $columns = array_map(fn($r) => $r['Field'], $columnsStmt->fetchAll(PDO::FETCH_ASSOC));

                    if (in_array($field, $columns)) {
                        // Handle boolean values
                        if (strtolower($value) === 'true') {
                            $conditions[] = "`$field` = 1";
                        } elseif (strtolower($value) === 'false') {
                            $conditions[] = "`$field` = 0";
                        } else {
                            $conditions[] = "`$field` = ?";
                            $params[] = $value;
                        }
                    }
                }
            }

            if (!empty($conditions)) {
                $whereClause = 'WHERE ' . implode(' AND ', $conditions);
            }
        }

        // Count total
        $countQuery = "SELECT COUNT(*) FROM `$resource` $whereClause";
        $countStmt = $pdo->prepare($countQuery);
        $countStmt->execute($params);
        $total = $countStmt->fetchColumn();

        // Get rows
        $query = "SELECT * FROM `$resource` $whereClause LIMIT $limit OFFSET $offset";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get columns
        $columnsStmt = $pdo->query("SHOW COLUMNS FROM `$resource`");
        $columns = array_map(fn($r) => $r['Field'], $columnsStmt->fetchAll(PDO::FETCH_ASSOC));

        // Wrap in Strapi-like format
        json_response([
            'data' => $rows,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'pageSize' => $limit
            ]
        ]);
    }

    // GET (single row by id)
    if ($action === 'get') {
        if (!$resource || !$id || !in_array($resource, $allowed_tables)) {
            error('Invalid resource or id', 400);
        }

        // Find primary key
        $pkStmt = $pdo->query("SHOW KEYS FROM `$resource` WHERE Key_name = 'PRIMARY'");
        $pkRow = $pkStmt->fetch(PDO::FETCH_ASSOC);
        $pk = $pkRow ? $pkRow['Column_name'] : 'id';
        
        $stmt = $pdo->prepare("SELECT * FROM `$resource` WHERE `$pk` = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$row) error('Not found', 404);
        
        // Get columns
        $columnsStmt = $pdo->query("SHOW COLUMNS FROM `$resource`");
        $columns = array_map(fn($r) => $r['Field'], $columnsStmt->fetchAll(PDO::FETCH_ASSOC));
        
        json_response([
            'row' => $row,
            'columns' => $columns
        ]);
    }

    // CREATE (insert new row) - requires auth for sensitive tables
    if ($action === 'create' || $action === 'insert') {
        // Check authentication for non-public tables
        $publicTables = ['newsletter_subscribers', 'contact_messages', 'event_registrations', 'donations', 'blog_comments'];
        $user = get_auth_user();
        
        if (!in_array($resource, $publicTables) && !$user) {
            error('Unauthorized', 401);
        }
        
        if (!$resource || !in_array($resource, $allowed_tables)) {
            error('Invalid resource', 400);
        }
        
        if (empty($body)) error('No data provided', 400);
        
        try {
            // Add timestamp if table supports it
            $columnsStmt = $pdo->query("SHOW COLUMNS FROM `$resource`");
            $columns = array_map(fn($r) => $r['Field'], $columnsStmt->fetchAll(PDO::FETCH_ASSOC));
            
            // Auto-add created_at timestamp
            if (in_array('created_at', $columns) && !isset($body['created_at'])) {
                $body['created_at'] = date('Y-m-d H:i:s');
            }
            
            // Auto-add updated_at timestamp
            if (in_array('updated_at', $columns) && !isset($body['updated_at'])) {
                $body['updated_at'] = date('Y-m-d H:i:s');
            }
            
            $columnsList = implode(', ', array_map(fn($c) => "`$c`", array_keys($body)));
            $placeholders = array_fill(0, count($body), '?');
            $placeholdersList = implode(', ', $placeholders);
            
            $stmt = $pdo->prepare("INSERT INTO `$resource` ($columnsList) VALUES ($placeholdersList)");
            $result = $stmt->execute(array_values($body));
            
            if (!$result) {
                error('Failed to insert data: ' . $stmt->errorInfo()[2], 400);
            }
            
            $insertId = $pdo->lastInsertId();
            
            // Return Strapi-like response format
            json_response([
                'data' => array_merge($body, ['id' => $insertId ?: null]),
                'success' => true,
                'id' => $insertId ?: null,
                'message' => 'Created successfully'
            ], 201);
        } catch (Exception $e) {
            error('Error creating record: ' . $e->getMessage(), 400);
        }
    }

    // UPDATE (modify row) - requires auth
    if ($action === 'update') {
        $user = get_auth_user();
        if (!$user) error('Unauthorized', 401);
        
        if (!$resource || !$id || !in_array($resource, $allowed_tables)) {
            error('Invalid resource or id', 400);
        }
        
        if (empty($body)) error('No data provided', 400);
        
        try {
            // Find primary key
            $pkStmt = $pdo->query("SHOW KEYS FROM `$resource` WHERE Key_name = 'PRIMARY'");
            $pkRow = $pkStmt->fetch(PDO::FETCH_ASSOC);
            $pk = $pkRow ? $pkRow['Column_name'] : 'id';
            
            // Auto-add updated_at timestamp
            $columnsStmt = $pdo->query("SHOW COLUMNS FROM `$resource`");
            $columns = array_map(fn($r) => $r['Field'], $columnsStmt->fetchAll(PDO::FETCH_ASSOC));
            if (in_array('updated_at', $columns)) {
                $body['updated_at'] = date('Y-m-d H:i:s');
            }
            
            $setClause = implode(', ', array_map(fn($c) => "`$c` = ?", array_keys($body)));
            $values = array_values($body);
            $values[] = $id;  // for WHERE clause
            
            $stmt = $pdo->prepare("UPDATE `$resource` SET $setClause WHERE `$pk` = ?");
            $result = $stmt->execute($values);
            
            if (!$result) {
                error('Failed to update data: ' . $stmt->errorInfo()[2], 400);
            }
            
            json_response([
                'ok' => true,
                'message' => 'Updated successfully'
            ]);
        } catch (Exception $e) {
            error('Error updating record: ' . $e->getMessage(), 400);
        }
    }

    // DELETE (remove row) - requires auth
    if ($action === 'delete') {
        $user = get_auth_user();
        if (!$user) error('Unauthorized', 401);
        
        if (!$resource || !$id || !in_array($resource, $allowed_tables)) {
            error('Invalid resource or id', 400);
        }
        
        try {
            // Find primary key
            $pkStmt = $pdo->query("SHOW KEYS FROM `$resource` WHERE Key_name = 'PRIMARY'");
            $pkRow = $pkStmt->fetch(PDO::FETCH_ASSOC);
            $pk = $pkRow ? $pkRow['Column_name'] : 'id';
            
            $stmt = $pdo->prepare("DELETE FROM `$resource` WHERE `$pk` = ?");
            $result = $stmt->execute([$id]);
            
            if (!$result) {
                error('Failed to delete data: ' . $stmt->errorInfo()[2], 400);
            }
            
            json_response([
                'ok' => true,
                'message' => 'Deleted successfully'
            ]);
        } catch (Exception $e) {
            error('Error deleting record: ' . $e->getMessage(), 400);
        }
    }

    // UPLOAD IMAGE (requires auth)
    if ($action === 'upload_image') {
        $user = get_auth_user();
        if (!$user) error('Unauthorized', 401);
        
        if (!isset($_FILES['file'])) {
            error('No file provided', 400);
        }
        
        $file = $_FILES['file'];
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        $max_size = 10 * 1024 * 1024; // 10MB
        
        // Validate file
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $error_messages = [
                UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
                UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
                UPLOAD_ERR_PARTIAL => 'File upload was incomplete',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                UPLOAD_ERR_CANT_WRITE => 'Cannot write to disk',
                UPLOAD_ERR_EXTENSION => 'File upload stopped by extension',
            ];
            error('Upload error: ' . ($error_messages[$file['error']] ?? 'Unknown error'), 400);
        }
        
        if ($file['size'] > $max_size) {
            error('File too large (max 10MB)', 413);
        }
        
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mime_type, $allowed_types)) {
            error('Invalid file type. Only images allowed', 415);
        }
        
        try {
            // Create uploads directory if it doesn't exist
            $uploads_dir = dirname(__DIR__) . '/uploads';
            if (!is_dir($uploads_dir)) {
                mkdir($uploads_dir, 0755, true);
            }
            
            // Generate unique filename
            $filename = 'img_' . bin2hex(random_bytes(8)) . '_' . time() . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
            $filepath = $uploads_dir . '/' . $filename;
            
            // Move file
            if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                error('Failed to save file', 500);
            }
            
            // Set proper permissions
            chmod($filepath, 0644);
            
            json_response([
                'ok' => true,
                'url' => '/uploads/' . $filename,
                'filename' => $filename,
                'message' => 'Image uploaded successfully'
            ]);
        } catch (Exception $e) {
            error('Upload error: ' . $e->getMessage(), 500);
        }
    }

    error('Unknown action: ' . $action, 400);

} catch (PDOException $e) {
    error_log("PDO Error: " . $e->getMessage());
    error('Database error: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    error_log("General Error: " . $e->getMessage());
    error('Server error: ' . $e->getMessage(), 500);
}
