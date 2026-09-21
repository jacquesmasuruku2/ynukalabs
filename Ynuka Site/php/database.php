<?php
require_once 'config.php';

/**
 * Classe Database pour gérer les opérations CRUD
 */
class Database {
    private $pdo;
    private $lastError = null;

    public function __construct() {
        global $pdo;
        $this->pdo = $pdo;
    }

    /**
     * Insérer des données dans la base
     * @param string $table Nom de la table
     * @param array $data Données à insérer (clé => valeur)
     * @return bool|string ID de l'insertion ou false en cas d'erreur
     */
    public function insert($table, $data) {
        try {
            // Si aucun id fourni, générer un UUID v4 pour les tables qui l'attendent
            if (!isset($data['id'])) {
                $data['id'] = $this->generateUUID();
            }

            $columns = implode(', ', array_keys($data));
            $placeholders = implode(', ', array_fill(0, count($data), '?'));
            
            $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(array_values($data));

            // Si un id a été fourni (ou généré), le retourner — utile pour les PK CHAR(36).
            if (!empty($data['id'])) {
                return $data['id'];
            }

            // Sinon, retourner le lastInsertId (pour les tables AUTO_INCREMENT).
            $lastId = $this->pdo->lastInsertId();
            return $lastId !== false ? $lastId : null;
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            error_log("Erreur d'insertion : " . $e->getMessage());
            return false;
        }
    }

    /**
     * Génère un UUID v4 conforme RFC 4122
     * @return string
     */
    private function generateUUID() {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40); // set version to 0100
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80); // set bits 6-7 to 10
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * Lire des données de la base
     * @param string $table Nom de la table
     * @param array $conditions Conditions WHERE (clé => valeur)
     * @param string $orderBy Clause ORDER BY
     * @param int $limit Nombre maximum de résultats
     * @return array|false Résultats ou false en cas d'erreur
     */
    public function select($table, $conditions = [], $orderBy = '', $limit = 0) {
        try {
            $sql = "SELECT * FROM $table";
            $params = [];

            if (!empty($conditions)) {
                $whereClauses = [];
                foreach ($conditions as $column => $value) {
                    $whereClauses[] = "$column = ?";
                    $params[] = $value;
                }
                $sql .= " WHERE " . implode(' AND ', $whereClauses);
            }

            if (!empty($orderBy)) {
                $sql .= " ORDER BY $orderBy";
            }

            if ($limit > 0) {
                $sql .= " LIMIT $limit";
            }

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            error_log("Erreur de sélection : " . $e->getMessage());
            return false;
        }
    }

    /**
     * Mettre à jour des données
     * @param string $table Nom de la table
     * @param array $data Données à mettre à jour
     * @param array $conditions Conditions WHERE
     * @return bool Succès ou échec
     */
    public function update($table, $data, $conditions) {
        try {
            $setClauses = [];
            $params = [];

            foreach ($data as $column => $value) {
                $setClauses[] = "$column = ?";
                $params[] = $value;
            }

            $whereClauses = [];
            foreach ($conditions as $column => $value) {
                $whereClauses[] = "$column = ?";
                $params[] = $value;
            }

            $sql = "UPDATE $table SET " . implode(', ', $setClauses) . " WHERE " . implode(' AND ', $whereClauses);
            
            $stmt = $this->pdo->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            error_log("Erreur de mise à jour : " . $e->getMessage());
            return false;
        }
    }

    /**
     * Supprimer des données
     * @param string $table Nom de la table
     * @param array $conditions Conditions WHERE
     * @return bool Succès ou échec
     */
    public function delete($table, $conditions) {
        try {
            $whereClauses = [];
            $params = [];

            foreach ($conditions as $column => $value) {
                $whereClauses[] = "$column = ?";
                $params[] = $value;
            }

            $sql = "DELETE FROM $table WHERE " . implode(' AND ', $whereClauses);
            
            $stmt = $this->pdo->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            error_log("Erreur de suppression : " . $e->getMessage());
            return false;
        }
    }

    /**
     * Exécuter une requête SQL personnalisée
     * @param string $sql Requête SQL
     * @param array $params Paramètres
     * @return array|false Résultats ou false en cas d'erreur
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            $this->lastError = $e->getMessage();
            error_log("Erreur de requête : " . $e->getMessage());
            return false;
        }
    }

    /**
     * Retourne le dernier message d'erreur PDO enregistré.
     * @return string|null
     */
    public function getLastError() {
        return $this->lastError;
    }
}
?>
