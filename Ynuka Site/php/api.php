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

// ============ DATABASE TABLES ============
$allowed_tables = [
    'users', 'user_roles', 'blog_posts', 'blog_comments',
    'contact_messages', 'donations', 'events', 'event_registrations',
    'gallery_blocks', 'gallery_images', 'newsletter_subscribers', 'projects',
    'resource_items', 'team_members', 'admin_users',
];

function table_exists_pdo(PDO $pdo, string $dbName, string $table): bool {
    $stmt = $pdo->prepare(
        'SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1'
    );
    $stmt->execute([$dbName, $table]);
    return (bool) $stmt->fetchColumn();
}

function table_columns_pdo(PDO $pdo, string $table): array {
    $stmt = $pdo->query("SHOW COLUMNS FROM `$table`");
    return array_map(fn($r) => $r['Field'], $stmt->fetchAll(PDO::FETCH_ASSOC));
}

function ensure_gallery_blocks_schema(PDO $pdo): void {
    if (!table_exists_pdo($pdo, DB_NAME, 'gallery_blocks')) {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `gallery_blocks` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `title` VARCHAR(255) NOT NULL,
            `subtitle` VARCHAR(255) NULL,
            `description` TEXT NULL,
            `drive_url` VARCHAR(512) NULL,
            `position` INT NOT NULL DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    }
    if (table_exists_pdo($pdo, DB_NAME, 'gallery_images')) {
        $cols = table_columns_pdo($pdo, 'gallery_images');
        if (!in_array('block_id', $cols, true)) {
            $pdo->exec('ALTER TABLE `gallery_images` ADD COLUMN `block_id` INT NULL');
            try {
                $pdo->exec('ALTER TABLE `gallery_images` ADD INDEX `idx_gallery_images_block_id` (`block_id`)');
            } catch (Exception $e) {
                // index may already exist
            }
        }
        if (in_array('event_id', $cols, true)) {
            try {
                $pdo->exec('ALTER TABLE `gallery_images` MODIFY COLUMN `event_id` VARCHAR(64) NULL');
            } catch (Exception $e) {
                // best effort
            }
        }
    }
}

// ============ ROUTES ============
$action = $_GET['action'] ?? '';
$resource = $_GET['resource'] ?? '';
$id = $_GET['id'] ?? null;
$page = intval($_GET['page'] ?? 1);
$limit = intval($_GET['limit'] ?? 25);
$search = $_GET['search'] ?? '';

$body = json_decode(file_get_contents('php://input'), true) ?? [];

try {
    // PING (diagnostic, no auth)
    if ($action === 'ping') {
        $tables = [];
        $result = $pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema = '" . DB_NAME . "'");
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

    // GALLERY PUBLIC (blocs + images, sans auth)
    if ($action === 'gallery_public') {
        ensure_gallery_blocks_schema($pdo);
        if (!table_exists_pdo($pdo, DB_NAME, 'gallery_blocks')) {
            json_response(['blocks' => []]);
        }
        $blocks = $pdo->query(
            'SELECT id, title, subtitle, description, drive_url, position, created_at
             FROM gallery_blocks ORDER BY position ASC, created_at DESC'
        )->fetchAll(PDO::FETCH_ASSOC);
        $imgCols = table_exists_pdo($pdo, DB_NAME, 'gallery_images')
            ? table_columns_pdo($pdo, 'gallery_images') : [];
        $hasBlockId = in_array('block_id', $imgCols, true);
        foreach ($blocks as &$block) {
            $block['images'] = [];
            if ($hasBlockId) {
                $stmt = $pdo->prepare(
                    'SELECT id, image_url, alt, position FROM gallery_images
                     WHERE block_id = ? ORDER BY position ASC, created_at ASC LIMIT 6'
                );
                $stmt->execute([$block['id']]);
                $block['images'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        }
        unset($block);
        json_response(['blocks' => $blocks]);
    }

    // LIST (get all rows with pagination & search)
    if ($action === 'list') {
        if (!$resource || !in_array($resource, $allowed_tables)) {
            error('Invalid resource', 400);
        }

        $offset = ($page - 1) * $limit;
        
        // Count total
        $countStmt = $pdo->query("SELECT COUNT(*) FROM `$resource`");
        $total = $countStmt->fetchColumn();
        
        // Get rows
        $query = "SELECT * FROM `$resource` LIMIT $limit OFFSET $offset";
        $stmt = $pdo->query($query);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get columns
        $columnsStmt = $pdo->query("SHOW COLUMNS FROM `$resource`");
        $columns = array_map(fn($r) => $r['Field'], $columnsStmt->fetchAll(PDO::FETCH_ASSOC));
        
        json_response([
            'rows' => $rows,
            'total' => $total,
            'columns' => $columns,
            'page' => $page,
            'limit' => $limit
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

    // CREATE (insert new row) - requires auth
    if ($action === 'create') {
        $user = get_auth_user();
        if (!$user) error('Unauthorized', 401);
        
        if (!$resource || !in_array($resource, $allowed_tables)) {
            error('Invalid resource', 400);
        }
        
        if (empty($body)) error('No data provided', 400);
        
        $columns = array_keys($body);
        $placeholders = array_fill(0, count($body), '?');
        $columnsList = implode(', ', array_map(fn($c) => "`$c`", $columns));
        $placeholdersList = implode(', ', $placeholders);
        
        $stmt = $pdo->prepare("INSERT INTO `$resource` ($columnsList) VALUES ($placeholdersList)");
        $stmt->execute(array_values($body));
        
        $insertId = $pdo->lastInsertId();
        
        json_response([
            'id' => $insertId,
            'message' => 'Created successfully'
        ], 201);
    }

    // UPDATE (modify row) - requires auth
    if ($action === 'update') {
        $user = get_auth_user();
        if (!$user) error('Unauthorized', 401);
        
        if (!$resource || !$id || !in_array($resource, $allowed_tables)) {
            error('Invalid resource or id', 400);
        }
        
        if (empty($body)) error('No data provided', 400);
        
        // Find primary key
        $pkStmt = $pdo->query("SHOW KEYS FROM `$resource` WHERE Key_name = 'PRIMARY'");
        $pkRow = $pkStmt->fetch(PDO::FETCH_ASSOC);
        $pk = $pkRow ? $pkRow['Column_name'] : 'id';
        
        $setClause = implode(', ', array_map(fn($c) => "`$c` = ?", array_keys($body)));
        $values = array_values($body);
        $values[] = $id;  // for WHERE clause
        
        $stmt = $pdo->prepare("UPDATE `$resource` SET $setClause WHERE `$pk` = ?");
        $stmt->execute($values);
        
        json_response([
            'ok' => true,
            'message' => 'Updated successfully'
        ]);
    }

    // DELETE (remove row) - requires auth
    if ($action === 'delete') {
        $user = get_auth_user();
        if (!$user) error('Unauthorized', 401);
        
        if (!$resource || !$id || !in_array($resource, $allowed_tables)) {
            error('Invalid resource or id', 400);
        }
        
        // Find primary key
        $pkStmt = $pdo->query("SHOW KEYS FROM `$resource` WHERE Key_name = 'PRIMARY'");
        $pkRow = $pkStmt->fetch(PDO::FETCH_ASSOC);
        $pk = $pkRow ? $pkRow['Column_name'] : 'id';
        
        $stmt = $pdo->prepare("DELETE FROM `$resource` WHERE `$pk` = ?");
        $stmt->execute([$id]);
        
        json_response([
            'ok' => true,
            'message' => 'Deleted successfully'
        ]);
    }

    error('Unknown action', 400);

} catch (Exception $e) {
    error('Server error: ' . $e->getMessage(), 500);
}
