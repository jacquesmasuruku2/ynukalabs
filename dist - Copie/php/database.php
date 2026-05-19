<?php
require_once 'config.php';

/**
 * Classe Database pour gérer les opérations CRUD
 */
class Database {
    private $pdo;

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
            $columns = implode(', ', array_keys($data));
            $placeholders = implode(', ', array_fill(0, count($data), '?'));
            
            $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(array_values($data));
            
            return $this->pdo->lastInsertId();
        } catch (PDOException $e) {
            error_log("Erreur d'insertion : " . $e->getMessage());
            return false;
        }
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
            error_log("Erreur de requête : " . $e->getMessage());
            return false;
        }
    }
}
?>
