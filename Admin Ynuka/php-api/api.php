<?php
/**
 * Ynuka Labs — Admin API (single-file PHP backend)
 *
 * DEPLOYMENT (Interserver shared hosting):
 *   1. Edit the DB_* + JWT_SECRET constants below
 *   2. Upload this file to public_html/api.php (or a subfolder)
 *   3. Open https://ynukalabs.com/api.php?action=ping in a browser
 *      → must return JSON with "db": "ok" and the list of tables
 *   4. Run setup.sql once in phpMyAdmin to create admin_users
 *   5. Set the API URL in the panel login screen
 */

// ============ CONFIGURATION ============
define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');
define('DB_CHARSET', 'utf8mb4');
define('JWT_SECRET', 'CHANGE_ME_TO_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARS');
define('ALLOWED_ORIGIN', '*'); // for production, set to panel URL

$ALLOWED_TABLES = [
    'users', 'user_roles', 'blog_posts', 'blog_comments',
    'contact_messages', 'donations', 'events', 'event_registrations',
    'gallery_images', 'newsletter_subscribers', 'projects',
    'resource_items', 'team_members',
];

// ============ CORS ============
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ============ HELPERS ============
function json_out($data, int $code = 200) { http_response_code($code); echo json_encode($data); exit; }
function err(string $msg, int $code = 400, array $extra = []) { json_out(['error' => $msg] + $extra, $code); }

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER, DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
    }
    return $pdo;
}

function b64url(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function b64url_decode(string $s): string {
    return base64_decode(strtr($s, '-_', '+/') . str_repeat('=', (4 - strlen($s) % 4) % 4));
}
function jwt_encode(array $payload): string {
    $h = b64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $b = b64url(json_encode($payload));
    $s = b64url(hash_hmac('sha256', "$h.$b", JWT_SECRET, true));
    return "$h.$b.$s";
}
function jwt_decode(string $token): ?array {
    $p = explode('.', $token);
    if (count($p) !== 3) return null;
    [$h, $b, $s] = $p;
    if (!hash_equals(b64url(hash_hmac('sha256', "$h.$b", JWT_SECRET, true)), $s)) return null;
    $payload = json_decode(b64url_decode($b), true);
    if (!is_array($payload) || (isset($payload['exp']) && $payload['exp'] < time())) return null;
    return $payload;
}
function current_user(): ?array {
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if (!preg_match('/Bearer\s+(.*)/', $h, $m)) return null;
    return jwt_decode(trim($m[1]));
}
function require_auth(): array { $u = current_user(); if (!$u) err('Unauthorized', 401); return $u; }

function table_columns(string $t): array {
    return array_map(fn($r) => $r['Field'], db()->query("SHOW COLUMNS FROM `$t`")->fetchAll());
}
function pk_of(string $t): string {
    $r = db()->query("SHOW KEYS FROM `$t` WHERE Key_name = 'PRIMARY'")->fetch();
    return $r ? $r['Column_name'] : 'id';
}

// ============ ROUTER ============
$action   = $_GET['action']   ?? '';
$resource = $_GET['resource'] ?? '';
$id       = $_GET['id']       ?? null;
$body     = json_decode(file_get_contents('php://input'), true) ?: [];

try {
    switch ($action) {

        // ---- DIAGNOSTIC (no auth) ----
        case 'ping': {
            $out = [
                'ok' => true,
                'php_version' => PHP_VERSION,
                'time' => date('c'),
                'config' => [
                    'db_host' => DB_HOST,
                    'db_name' => DB_NAME,
                    'db_user_set' => DB_USER !== 'YOUR_DB_USER',
                    'jwt_secret_set' => JWT_SECRET !== 'CHANGE_ME_TO_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARS',
                ],
            ];
            try {
                $tables = array_map(fn($r) => array_values($r)[0],
                    db()->query("SHOW TABLES")->fetchAll());
                $out['db'] = 'ok';
                $out['tables_found'] = $tables;
                $out['tables_expected'] = $ALLOWED_TABLES;
                $out['tables_missing'] = array_values(array_diff($ALLOWED_TABLES, $tables));
                $out['admin_users_table'] = in_array('admin_users', $tables, true);
                if ($out['admin_users_table']) {
                    $out['admin_users_count'] = (int) db()->query("SELECT COUNT(*) FROM admin_users")->fetchColumn();
                }
            } catch (Throwable $e) {
                $out['db'] = 'error';
                $out['db_error'] = $e->getMessage();
            }
            json_out($out);
        }

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
            if (isset($data['password']) && in_array('password_hash', $cols, true)) {
                $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
                unset($data['password']);
            }
            if (!$data) err('No data');
            $fields = array_keys($data);
            $place  = implode(',', array_fill(0, count($fields), '?'));
            $stmt = db()->prepare("INSERT INTO `$resource` (`" . implode('`,`', $fields) . "`) VALUES ($place)");
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
            $stmt = db()->prepare("UPDATE `$resource` SET $set WHERE `$pk` = ?");
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
            err('Unknown action. Try ?action=ping');
    }
} catch (Throwable $e) {
    err($e->getMessage(), 500);
}
