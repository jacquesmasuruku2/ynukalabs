<?php
/**
 * Ynuka Labs — Admin API
 * Single-file PHP backend for the admin panel.
 *
 * DEPLOYMENT (Interserver shared hosting):
 *   1. Copy this file to your hosting (e.g. public_html/api.php)
 *   2. Edit the DB_* constants below with your Interserver MySQL credentials
 *   3. Run the SQL in `setup.sql` once to create the admin_users table
 *   4. In the admin panel login page, set API URL to https://yourdomain.com/api.php
 *
 * SECURITY:
 *   - JWT-like signed tokens (HMAC-SHA256) stored in localStorage on the client.
 *   - Whitelisted table names — no SQL injection on table identifiers.
 *   - Prepared statements for all values.
 *   - CORS open for simplicity; restrict ALLOWED_ORIGIN below to your panel URL.
 */

// ============ CONFIGURATION ============
define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'YOUR_DB_USER');
define('DB_PASS', 'YOUR_DB_PASSWORD');
define('JWT_SECRET', 'CHANGE_ME_TO_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARS');
define('ALLOWED_ORIGIN', '*'); // e.g. 'https://admin.ynukalabs.com'

// Tables exposed by the API (whitelist — never allow arbitrary names)
$ALLOWED_TABLES = [
    'users', 'user_roles', 'blog_posts', 'blog_comments',
    'contact_messages', 'donations', 'events', 'event_registrations',
    'gallery_images', 'newsletter_subscribers', 'projects',
    'resource_items', 'team_members',
];

// ============ CORS + HEADERS ============
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ============ HELPERS ============
function json_out($data, int $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}
function err(string $msg, int $code = 400) { json_out(['error' => $msg], $code); }

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER, DB_PASS,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
            );
        } catch (Throwable $e) { err('DB connection failed: ' . $e->getMessage(), 500); }
    }
    return $pdo;
}

function b64url(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function b64url_decode(string $s): string {
    return base64_decode(strtr($s, '-_', '+/') . str_repeat('=', (4 - strlen($s) % 4) % 4));
}

function jwt_encode(array $payload): string {
    $header = b64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $body   = b64url(json_encode($payload));
    $sig    = b64url(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    return "$header.$body.$sig";
}
function jwt_decode(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$h, $b, $s] = $parts;
    $expected = b64url(hash_hmac('sha256', "$h.$b", JWT_SECRET, true));
    if (!hash_equals($expected, $s)) return null;
    $payload = json_decode(b64url_decode($b), true);
    if (!is_array($payload)) return null;
    if (isset($payload['exp']) && $payload['exp'] < time()) return null;
    return $payload;
}

function current_user(): ?array {
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.*)/', $h, $m)) return null;
    return jwt_decode(trim($m[1]));
}
function require_auth(): array {
    $u = current_user();
    if (!$u) err('Unauthorized', 401);
    return $u;
}

function table_columns(string $table): array {
    $stmt = db()->query("SHOW COLUMNS FROM `$table`");
    return array_map(fn($r) => $r['Field'], $stmt->fetchAll());
}
function pk_of(string $table): string {
    $stmt = db()->query("SHOW KEYS FROM `$table` WHERE Key_name = 'PRIMARY'");
    $row = $stmt->fetch();
    return $row ? $row['Column_name'] : 'id';
}

// ============ ROUTER ============
$action   = $_GET['action']   ?? '';
$resource = $_GET['resource'] ?? '';
$id       = $_GET['id']       ?? null;
$body     = json_decode(file_get_contents('php://input'), true) ?: [];

if ($action !== 'login' && $action !== 'me' && !in_array($resource, $ALLOWED_TABLES, true) && $action !== '') {
    if ($resource !== '') err('Unknown resource', 400);
}

try {
    switch ($action) {

        case 'login': {
            $email = trim($body['email'] ?? '');
            $pass  = $body['password'] ?? '';
            if (!$email || !$pass) err('Missing credentials');
            $stmt = db()->prepare('SELECT id, email, password_hash, name FROM admin_users WHERE email = ? LIMIT 1');
            $stmt->execute([$email]);
            $u = $stmt->fetch();
            if (!$u || !password_verify($pass, $u['password_hash'])) err('Invalid credentials', 401);
            $token = jwt_encode([
                'sub' => $u['id'], 'email' => $u['email'], 'name' => $u['name'],
                'iat' => time(), 'exp' => time() + 60 * 60 * 24 * 7,
            ]);
            json_out(['token' => $token, 'user' => ['id' => $u['id'], 'email' => $u['email'], 'name' => $u['name']]]);
        }

        case 'me': {
            $u = require_auth();
            json_out(['user' => $u]);
        }

        case 'list': {
            require_auth();
            if (!in_array($resource, $ALLOWED_TABLES, true)) err('Unknown resource');
            $cols  = table_columns($resource);
            $page  = max(1, (int)($_GET['page']  ?? 1));
            $limit = min(200, max(1, (int)($_GET['limit'] ?? 25)));
            $off   = ($page - 1) * $limit;
            $search = trim($_GET['search'] ?? '');

            $where = ''; $params = [];
            if ($search !== '') {
                $likeCols = array_filter($cols, fn($c) => !in_array($c, ['id', 'created_at', 'updated_at']));
                if ($likeCols) {
                    $parts = [];
                    foreach ($likeCols as $c) { $parts[] = "`$c` LIKE ?"; $params[] = '%' . $search . '%'; }
                    $where = ' WHERE ' . implode(' OR ', $parts);
                }
            }
            $totalStmt = db()->prepare("SELECT COUNT(*) c FROM `$resource`$where");
            $totalStmt->execute($params);
            $total = (int)$totalStmt->fetchColumn();

            $orderCol = in_array('created_at', $cols) ? 'created_at' : pk_of($resource);
            $stmt = db()->prepare("SELECT * FROM `$resource`$where ORDER BY `$orderCol` DESC LIMIT $limit OFFSET $off");
            $stmt->execute($params);
            json_out(['rows' => $stmt->fetchAll(), 'total' => $total, 'columns' => $cols]);
        }

        case 'get': {
            require_auth();
            if (!in_array($resource, $ALLOWED_TABLES, true)) err('Unknown resource');
            $pk = pk_of($resource);
            $stmt = db()->prepare("SELECT * FROM `$resource` WHERE `$pk` = ? LIMIT 1");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) err('Not found', 404);
            json_out(['row' => $row, 'columns' => table_columns($resource)]);
        }

        case 'create': {
            require_auth();
            if (!in_array($resource, $ALLOWED_TABLES, true)) err('Unknown resource');
            $cols = table_columns($resource);
            $pk = pk_of($resource);
            $data = array_intersect_key($body, array_flip($cols));
            unset($data[$pk]);
            // Hash password if creating an admin/user with plain "password"
            if (isset($data['password']) && in_array('password_hash', $cols, true)) {
                $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
                unset($data['password']);
            }
            if (!$data) err('No data');
            $fields = array_keys($data);
            $place  = implode(',', array_fill(0, count($fields), '?'));
            $sql = "INSERT INTO `$resource` (`" . implode('`,`', $fields) . "`) VALUES ($place)";
            $stmt = db()->prepare($sql);
            $stmt->execute(array_values($data));
            json_out(['id' => db()->lastInsertId()]);
        }

        case 'update': {
            require_auth();
            if (!in_array($resource, $ALLOWED_TABLES, true)) err('Unknown resource');
            $cols = table_columns($resource);
            $pk = pk_of($resource);
            $data = array_intersect_key($body, array_flip($cols));
            unset($data[$pk]);
            if (isset($data['password']) && in_array('password_hash', $cols, true)) {
                if ($data['password'] !== '') {
                    $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
                }
                unset($data['password']);
            }
            if (!$data) err('No data');
            $set = implode(',', array_map(fn($c) => "`$c` = ?", array_keys($data)));
            $sql = "UPDATE `$resource` SET $set WHERE `$pk` = ?";
            $stmt = db()->prepare($sql);
            $stmt->execute([...array_values($data), $id]);
            json_out(['ok' => true]);
        }

        case 'delete': {
            require_auth();
            if (!in_array($resource, $ALLOWED_TABLES, true)) err('Unknown resource');
            $pk = pk_of($resource);
            $stmt = db()->prepare("DELETE FROM `$resource` WHERE `$pk` = ?");
            $stmt->execute([$id]);
            json_out(['ok' => true]);
        }

        default:
            err('Unknown action');
    }
} catch (Throwable $e) {
    err($e->getMessage(), 500);
}
