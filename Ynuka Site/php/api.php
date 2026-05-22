<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

// Si la connexion à la base de données a échoué lors du require de config.php,
// renvoyer une erreur JSON claire au client au lieu d'un die() non-JSON.
if (isset($dbConnectionError) && $dbConnectionError) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection error: ' . $dbConnectionError]);
    exit;
}

require_once 'database.php';

// Gestion des requêtes OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db = new Database();
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'insert':
            // Insérer des données
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $table = $input['table'] ?? '';
                $data = $input['data'] ?? [];

                if (empty($table) || empty($data)) {
                    echo json_encode(['success' => false, 'message' => 'Table ou données manquantes']);
                    exit;
                }

                $result = $db->insert($table, $data);
                if ($result) {
                    echo json_encode(['success' => true, 'message' => 'Données insérées avec succès', 'id' => $result]);
                } else {
                    $detail = method_exists($db, 'getLastError') ? $db->getLastError() : null;
                    $message = 'Erreur lors de l\'insertion';
                    if ($detail) $message .= ': ' . $detail;
                    echo json_encode(['success' => false, 'message' => $message]);
                }
            }
            break;

        case 'select':
            // Lire des données
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $table = $_GET['table'] ?? '';
                $conditions = isset($_GET['conditions']) ? json_decode($_GET['conditions'], true) : [];
                $orderBy = $_GET['orderBy'] ?? '';
                $limit = intval($_GET['limit'] ?? 0);

                if (empty($table)) {
                    echo json_encode(['success' => false, 'message' => 'Table manquante']);
                    exit;
                }

                $result = $db->select($table, $conditions, $orderBy, $limit);
                if ($result !== false) {
                    echo json_encode(['success' => true, 'data' => $result]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Erreur lors de la sélection']);
                }
            }
            break;

        case 'update':
            // Mettre à jour des données
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $table = $input['table'] ?? '';
                $data = $input['data'] ?? [];
                $conditions = $input['conditions'] ?? [];

                if (empty($table) || empty($data) || empty($conditions)) {
                    echo json_encode(['success' => false, 'message' => 'Table, données ou conditions manquantes']);
                    exit;
                }

                $result = $db->update($table, $data, $conditions);
                if ($result) {
                    echo json_encode(['success' => true, 'message' => 'Données mises à jour avec succès']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour']);
                }
            }
            break;

        case 'delete':
            // Supprimer des données
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $table = $input['table'] ?? '';
                $conditions = $input['conditions'] ?? [];

                if (empty($table) || empty($conditions)) {
                    echo json_encode(['success' => false, 'message' => 'Table ou conditions manquantes']);
                    exit;
                }

                $result = $db->delete($table, $conditions);
                if ($result) {
                    echo json_encode(['success' => true, 'message' => 'Données supprimées avec succès']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Erreur lors de la suppression']);
                }
            }
            break;

        case 'custom':
            // Exécuter une requête personnalisée
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $sql = $input['sql'] ?? '';
                $params = $input['params'] ?? [];

                if (empty($sql)) {
                    echo json_encode(['success' => false, 'message' => 'Requête SQL manquante']);
                    exit;
                }

                $result = $db->query($sql, $params);
                if ($result !== false) {
                    echo json_encode(['success' => true, 'data' => $result]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'exécution de la requête']);
                }
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Action non reconnue']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
