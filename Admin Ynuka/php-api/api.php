<?php
/**
 * Ynuka Labs — Admin API (single-file PHP backend)
 * Merged version: Preserves existing config + adds OAuth2, auto-provisioning, improved JWT
 *
 * DEPLOYMENT (Interserver shared hosting):
 *   1. Edit the DB_* + JWT_SECRET constants in config.php
 *   2. Upload this file to public_html/api.php (or a subfolder)
 *   3. Open https://yourdomain.com/api.php?action=ping in a browser
 *      → must return JSON with "db": "ok" and the list of tables
 *   4. Run setup.sql once in phpMyAdmin to create admin_users
 *   5. (Optional) Configure Google OAuth2 in environment variables or config.php
 */

// ============ CONFIG & DATABASE ============
require_once 'config.php';

// Google OAuth2 — read from environment with fallback to definitions
define('GOOGLE_CLIENT_ID',     getenv('GOOGLE_CLIENT_ID')     ?: (defined('GOOGLE_CLIENT_ID') ? GOOGLE_CLIENT_ID : 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'));
define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: (defined('GOOGLE_CLIENT_SECRET') ? GOOGLE_CLIENT_SECRET : 'YOUR_GOOGLE_CLIENT_SECRET'));
define('GOOGLE_REDIRECT_URI',  getenv('GOOGLE_REDIRECT_URI')  ?: (defined('GOOGLE_REDIRECT_URI') ? GOOGLE_REDIRECT_URI : 'https://admin.ynukalabs.com/api.php?action=google_callback'));
define('PANEL_URL',            getenv('PANEL_URL')            ?: (defined('PANEL_URL') ? PANEL_URL : 'https://admin.ynukalabs.com'));
define('ALLOWED_GOOGLE_EMAILS', getenv('ALLOWED_GOOGLE_EMAILS') ?: (defined('ALLOWED_GOOGLE_EMAILS') ? ALLOWED_GOOGLE_EMAILS : ''));

// JWT Secret — read from environment with fallback
if (!defined('JWT_SECRET')) {
    define('JWT_SECRET', getenv('JWT_SECRET') ?: 'CHANGE_ME_TO_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARS');
}

// CORS
define('ALLOWED_ORIGIN', getenv('ALLOWED_ORIGIN') ?: (defined('ALLOWED_ORIGIN') ? ALLOWED_ORIGIN : '*'));

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
    global $pdo;
    return $pdo;
}

// Base64url encoding (RFC 4648 Section 5) for JWT
function b64url(string $s): string { 
    return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); 
}

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

}

function require_auth(): array { 
    $u = current_user(); 
    if (!$u) err('Unauthorized', 401); 
    return $u; 
}

function table_columns(string $t): array {
    return array_map(fn($r) => $r['Field'], db()->query("SHOW COLUMNS FROM `$t`")->fetchAll());
}

function pk_of(string $t): string {
    $r = db()->query("SHOW KEYS FROM `$t` WHERE Key_name = 'PRIMARY'")->fetch();
    return $r ? $r['Column_name'] : 'id';
}

function table_exists(string $t): bool {
    try {
        $s = db()->prepare("SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1");
        $s->execute([DB_NAME, $t]);
        return (bool) $s->fetchColumn();
    } catch (Throwable $e) { 
        return false; 
    }
}

/**
 * Best-effort: ensure there is a row in `users` for this email, and a row in
 * `user_roles` with the given role. Adapts to whatever columns exist on those
 * tables (id/uuid, name/full_name/display_name, avatar_url/photo_url, etc.).
 * Errors are swallowed so a Google login never fails because of optional tables.
 */
function provision_app_user(string $email, string $name, string $picture, string $role = 'admin'): void {
    try {
        if (!table_exists('users')) return;
        $cols = table_columns('users');
        $pk   = pk_of('users');

        // Look up existing user by email.
        $userId = null;
        if (in_array('email', $cols, true)) {
            $s = db()->prepare("SELECT `$pk` FROM `users` WHERE email = ? LIMIT 1");
            $s->execute([$email]);
            $userId = $s->fetchColumn() ?: null;
        }

        if (!$userId) {
            // Build an INSERT using only columns that actually exist.
            $row = [];
            if (in_array('email', $cols, true))        $row['email'] = $email;
            foreach (['name', 'full_name', 'display_name', 'username'] as $c) {
                if (in_array($c, $cols, true)) { $row[$c] = $name ?: $email; break; }
            }
            foreach (['avatar_url', 'photo_url', 'picture', 'image_url'] as $c) {
                if (in_array($c, $cols, true)) { $row[$c] = $picture; break; }
            }
            if (in_array('provider', $cols, true))     $row['provider'] = 'google';
            if (in_array('is_active', $cols, true))    $row['is_active'] = 1;
            if (in_array('email_verified', $cols, true)) $row['email_verified'] = 1;

            // Generate a UUID if the PK looks like a uuid column with no default.
            if ($pk !== 'id' || (in_array('uuid', $cols, true) && !in_array('id', $cols, true))) {
                $row[$pk] = bin2hex(random_bytes(16));
            }

            if (!$row) return;
            $fields = array_keys($row);
            $place  = implode(',', array_fill(0, count($fields), '?'));
            $ins = db()->prepare("INSERT INTO `users` (`" . implode('`,`', $fields) . "`) VALUES ($place)");
            $ins->execute(array_values($row));
            $userId = isset($row[$pk]) ? $row[$pk] : db()->lastInsertId();
        }

        // Now ensure the role row exists in user_roles.
        if ($userId && table_exists('user_roles')) {
            $rcols = table_columns('user_roles');
            $uidCol = null;
            foreach (['user_id', 'userId', 'uid'] as $c) {
                if (in_array($c, $rcols, true)) { $uidCol = $c; break; }
            }
            $roleCol = in_array('role', $rcols, true) ? 'role'
                : (in_array('name', $rcols, true) ? 'name' : null);
            if ($uidCol && $roleCol) {
                $chk = db()->prepare("SELECT 1 FROM `user_roles` WHERE `$uidCol` = ? AND `$roleCol` = ? LIMIT 1");
                $chk->execute([$userId, $role]);
                if (!$chk->fetchColumn()) {
                    $rrow = [$uidCol => $userId, $roleCol => $role];
                    $rpk = pk_of('user_roles');
                    if ($rpk !== 'id' && !in_array($rpk, array_keys($rrow), true)) {
                        $rrow[$rpk] = bin2hex(random_bytes(16));
                    }
                    $fields = array_keys($rrow);
                    $place  = implode(',', array_fill(0, count($fields), '?'));
                    $ins = db()->prepare("INSERT INTO `user_roles` (`" . implode('`,`', $fields) . "`) VALUES ($place)");
                    $ins->execute(array_values($rrow));
                }
            }
        }
    } catch (Throwable $e) {
        // Best-effort: never block login because of provisioning.
        error_log('provision_app_user: ' . $e->getMessage());
    }
}

// ============ ROUTER ============
$ALLOWED_TABLES = [
    'users', 'user_roles', 'blog_posts', 'blog_comments',
    'contact_messages', 'donations', 'events', 'event_registrations',
    'gallery_images', 'newsletter_subscribers', 'projects',
    'resource_items', 'team_members',
];

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
                    'google_oauth_set' => GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
                        && GOOGLE_CLIENT_SECRET !== 'YOUR_GOOGLE_CLIENT_SECRET',
                    'google_redirect_uri' => GOOGLE_REDIRECT_URI,
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

        // ---- AUTHENTICATION ----
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

        // ---- GOOGLE OAUTH2 ----
        // Step 1: panel calls this to get the URL to redirect the browser to.
        case 'google_auth_url': {
            if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
                err('Google OAuth not configured on the server', 500);
            }
            $state = bin2hex(random_bytes(16));
            $params = http_build_query([
                'client_id'     => GOOGLE_CLIENT_ID,
                'redirect_uri'  => GOOGLE_REDIRECT_URI,
                'response_type' => 'code',
                'scope'         => 'openid email profile',
                'access_type'   => 'online',
                'prompt'        => 'select_account',
                'state'         => $state,
            ]);
            json_out(['url' => 'https://accounts.google.com/o/oauth2/v2/auth?' . $params, 'state' => $state]);
        }

        // Step 2: Google redirects the browser here with ?code=...
        // We exchange the code, look up the admin, then 302 back to the panel
        // with #token=... in the URL hash so the frontend can store it.
        case 'google_callback': {
            $code = $_GET['code'] ?? '';
            if (!$code) { header('Location: ' . PANEL_URL . '/login#error=missing_code'); exit; }

            $ch = curl_init('https://oauth2.googleapis.com/token');
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POSTFIELDS => http_build_query([
                    'code'          => $code,
                    'client_id'     => GOOGLE_CLIENT_ID,
                    'client_secret' => GOOGLE_CLIENT_SECRET,
                    'redirect_uri'  => GOOGLE_REDIRECT_URI,
                    'grant_type'    => 'authorization_code',
                ]),
                CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
            ]);
            $tokenResp = curl_exec($ch);
            $tokenHttp = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($tokenHttp !== 200) { header('Location: ' . PANEL_URL . '/login#error=token_exchange_failed'); exit; }
            $tokenData = json_decode($tokenResp, true) ?: [];
            $accessToken = $tokenData['access_token'] ?? '';
            if (!$accessToken) { header('Location: ' . PANEL_URL . '/login#error=no_access_token'); exit; }

            $ch = curl_init('https://www.googleapis.com/oauth2/v3/userinfo');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $accessToken],
            ]);
            $profile = json_decode(curl_exec($ch), true) ?: [];
            curl_close($ch);

            $googleId = $profile['sub']            ?? '';
            $email    = strtolower($profile['email'] ?? '');
            $name     = $profile['name']           ?? '';
            $picture  = $profile['picture']        ?? '';
            $verified = $profile['email_verified'] ?? false;
            if (!$googleId || !$email || !$verified) {
                header('Location: ' . PANEL_URL . '/login#error=invalid_profile'); exit;
            }

            // 1) Find the admin row by google_id or email.
            $stmt = db()->prepare('SELECT id, email, name, avatar_url FROM admin_users WHERE google_id = ? OR email = ? LIMIT 1');
            $stmt->execute([$googleId, $email]);
            $u = $stmt->fetch();

            // 2) If no admin row, auto-provision (only if email is allowlisted).
            if (!$u) {
                $allow = array_filter(array_map('trim', explode(',', strtolower(ALLOWED_GOOGLE_EMAILS))));
                $isAllowed = in_array('*', $allow, true) || in_array($email, $allow, true);
                if (!$isAllowed) {
                    header('Location: ' . PANEL_URL . '/login#error=not_authorized'); exit;
                }
                $cols = table_columns('admin_users');
                $row = ['email' => $email];
                if (in_array('name', $cols, true))          $row['name'] = $name ?: $email;
                if (in_array('avatar_url', $cols, true))    $row['avatar_url'] = $picture;
                if (in_array('google_id', $cols, true))     $row['google_id'] = $googleId;
                if (in_array('password_hash', $cols, true)) $row['password_hash'] = null; // Google-only account
                $fields = array_keys($row);
                $place  = implode(',', array_fill(0, count($fields), '?'));
                $ins = db()->prepare("INSERT INTO admin_users (`" . implode('`,`', $fields) . "`) VALUES ($place)");
                $ins->execute(array_values($row));
                $newId = (int) db()->lastInsertId();
                $u = ['id' => $newId, 'email' => $email, 'name' => $row['name'] ?? $name, 'avatar_url' => $picture];

                // 3) Also provision the matching row in `users` + `user_roles` (best-effort).
                provision_app_user($email, $name, $picture, 'admin');
            } else {
                // Existing admin: refresh google_id + avatar.
                $upd = db()->prepare('UPDATE admin_users SET google_id = ?, avatar_url = COALESCE(NULLIF(?, ""), avatar_url) WHERE id = ?');
                $upd->execute([$googleId, $picture, $u['id']]);
                // Make sure they also have a row in users + the admin role.
                provision_app_user($email, $name, $picture, 'admin');
            }

            $token = jwt_encode([
                'sub'     => $u['id'],
                'email'   => $u['email'],
                'name'    => $u['name'] ?: $name,
                'picture' => $picture ?: ($u['avatar_url'] ?? ''),
                'iat' => time(), 'exp' => time() + 60 * 60 * 24 * 7,
            ]);
            header('Location: ' . PANEL_URL . '/login#token=' . urlencode($token));
            exit;
        }

        // ---- USER ENDPOINTS ----
        case 'me': {
            $u = require_auth();
            json_out(['user' => $u]);
        }

        // ---- CRUD ENDPOINTS ----
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
