<?php
// ============ CONFIGURATION ============
// Utiliser la même configuration que l'API existante
define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');

// CORS: Configuration par environnement
define('ALLOWED_ORIGIN', getenv('ALLOWED_ORIGIN') ?: 'https://ynukalabs.com');

// ============ CORS ============
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
        $hostsToTry = [DB_HOST];
        if (DB_HOST === 'localhost') {
            $hostsToTry[] = '127.0.0.1';
        }

        foreach ($hostsToTry as $hostAttempt) {
            try {
                $pdo = new PDO(
                    'mysql:host=' . $hostAttempt . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                    DB_USER, DB_PASS,
                    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]
                );
                break;
            } catch (PDOException $e) {
                error_log("Erreur de connexion à la base de données ($hostAttempt) : " . $e->getMessage());
                if ($hostAttempt === end($hostsToTry)) {
                    throw $e;
                }
            }
        }
    }
    return $pdo;
}

function table_exists(string $t): bool {
    try {
        $s = db()->prepare("SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1");
        $s->execute([DB_NAME, $t]);
        return (bool) $s->fetchColumn();
    } catch (Throwable $e) { return false; }
}

// ============ ROUTER ============
$action = $_GET['action'] ?? '';
$body = json_decode(file_get_contents('php://input'), true) ?: [];

try {
    switch ($action) {
        // ---- DIAGNOSTIC ----
        case 'ping': {
            $out = [
                'ok' => true,
                'php_version' => PHP_VERSION,
                'time' => date('c'),
                'config' => [
                    'db_host' => DB_HOST,
                    'db_name' => DB_NAME,
                    'db_user_set' => DB_USER !== 'YOUR_DB_USER',
                ],
            ];
            try {
                if (table_exists('admin_activities')) {
                    $out['db'] = 'ok';
                    $out['activities_table'] = true;
                    $out['activities_count'] = (int) db()->query("SELECT COUNT(*) FROM admin_activities")->fetchColumn();
                } else {
                    $out['db'] = 'ok';
                    $out['activities_table'] = false;
                    $out['message'] = 'Table admin_activities not found. Run create_activities_table.sql';
                }
            } catch (Throwable $e) {
                $out['db'] = 'error';
                $out['db_error'] = $e->getMessage();
            }
            json_out($out);
        }

        // ---- RÉCUPÉRER LES ACTIVITÉS ----
        case 'list': {
            $filter = $_GET['filter'] ?? 'all';
            $limit = min(200, max(1, (int)($_GET['limit'] ?? 50)));
            $offset = max(0, (int)($_GET['offset'] ?? 0));

            if (!table_exists('admin_activities')) {
                err('Table admin_activities not found. Run create_activities_table.sql', 500);
            }

            $sql = "SELECT * FROM admin_activities";
            $params = [];

            if ($filter === 'unread') {
                $sql .= " WHERE `read` = FALSE";
            }

            $sql .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";

            $stmt = db()->prepare($sql);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $activities = $stmt->fetchAll();

            // Convertir les métadonnées JSON en tableau
            foreach ($activities as &$activity) {
                if (!empty($activity['metadata'])) {
                    $activity['metadata'] = json_decode($activity['metadata'], true);
                } else {
                    $activity['metadata'] = null;
                }
                $activity['timestamp'] = $activity['created_at'];
            }

            json_out(['data' => $activities]);
        }

        // ---- COMPTER LES NON LUES ----
        case 'unread-count': {
            if (!table_exists('admin_activities')) {
                json_out(['data' => ['count' => 0]]);
            }

            $stmt = db()->prepare("SELECT COUNT(*) as count FROM admin_activities WHERE `read` = FALSE");
            $stmt->execute();
            $result = $stmt->fetch();

            json_out(['data' => ['count' => (int)$result['count']]]);
        }

        // ---- CRÉER UNE ACTIVITÉ ----
        case 'create': {
            if (!isset($body['type']) || !isset($body['user']) || !isset($body['message'])) {
                err('Missing required fields: type, user, message');
            }

            $validTypes = ['login', 'register', 'message', 'notification', 'alert'];
            if (!in_array($body['type'], $validTypes)) {
                err('Invalid type. Must be one of: ' . implode(', ', $validTypes));
            }

            if (!table_exists('admin_activities')) {
                err('Table admin_activities not found. Run create_activities_table.sql', 500);
            }

            $sql = "INSERT INTO admin_activities (type, user, message, details, metadata, `read`)
                    VALUES (:type, :user, :message, :details, :metadata, FALSE)";

            $stmt = db()->prepare($sql);
            $stmt->bindValue(':type', $body['type']);
            $stmt->bindValue(':user', $body['user']);
            $stmt->bindValue(':message', $body['message']);
            $stmt->bindValue(':details', $body['details'] ?? null);
            $stmt->bindValue(':metadata', !empty($body['metadata']) ? json_encode($body['metadata']) : null);

            if ($stmt->execute()) {
                $id = (int) db()->lastInsertId();

                // Récupérer l'activité créée
                $stmt = db()->prepare("SELECT * FROM admin_activities WHERE id = :id");
                $stmt->bindValue(':id', $id);
                $stmt->execute();
                $activity = $stmt->fetch();

                if (!empty($activity['metadata'])) {
                    $activity['metadata'] = json_decode($activity['metadata'], true);
                } else {
                    $activity['metadata'] = null;
                }
                $activity['timestamp'] = $activity['created_at'];

                json_out(['data' => $activity]);
            } else {
                err('Failed to create activity', 500);
            }
        }

        // ---- MARQUER COMME LU ----
        case 'mark-read': {
            $id = (int)($_GET['id'] ?? $body['id'] ?? 0);
            if (!$id) err('Missing id');

            if (!table_exists('admin_activities')) {
                err('Table admin_activities not found', 500);
            }

            $stmt = db()->prepare("UPDATE admin_activities SET `read` = TRUE WHERE id = :id");
            $stmt->bindValue(':id', $id);

            if ($stmt->execute()) {
                json_out(['ok' => true, 'message' => 'Activity marked as read']);
            } else {
                err('Failed to mark activity as read', 500);
            }
        }

        // ---- MARQUER TOUTES COMME LUES ----
        case 'mark-all-read': {
            if (!table_exists('admin_activities')) {
                json_out(['ok' => true, 'message' => 'No activities table']);
            }

            $stmt = db()->prepare("UPDATE admin_activities SET `read` = TRUE WHERE `read` = FALSE");

            if ($stmt->execute()) {
                $affected = $stmt->rowCount();
                json_out(['ok' => true, 'message' => "Marked $affected activities as read"]);
            } else {
                err('Failed to mark all activities as read', 500);
            }
        }

        // ---- SUPPRIMER UNE ACTIVITÉ ----
        case 'delete': {
            $id = (int)($_GET['id'] ?? $body['id'] ?? 0);
            if (!$id) err('Missing id');

            if (!table_exists('admin_activities')) {
                err('Table admin_activities not found', 500);
            }

            $stmt = db()->prepare("DELETE FROM admin_activities WHERE id = :id");
            $stmt->bindValue(':id', $id);

            if ($stmt->execute()) {
                json_out(['ok' => true, 'message' => 'Activity deleted']);
            } else {
                err('Failed to delete activity', 500);
            }
        }

        // ---- SUPPRIMER TOUTES LES ACTIVITÉS ----
        case 'delete-all': {
            if (!table_exists('admin_activities')) {
                json_out(['ok' => true, 'message' => 'No activities table']);
            }

            $stmt = db()->prepare("DELETE FROM admin_activities");

            if ($stmt->execute()) {
                $affected = $stmt->rowCount();
                json_out(['ok' => true, 'message' => "Deleted $affected activities"]);
            } else {
                err('Failed to delete all activities', 500);
            }
        }

        default: {
            err('Unknown action. Valid actions: ping, list, unread-count, create, mark-read, mark-all-read, delete, delete-all', 404);
        }
    }
} catch (PDOException $e) {
    err('Database error: ' . $e->getMessage(), 500);
} catch (Throwable $e) {
    err('Server error: ' . $e->getMessage(), 500);
}

