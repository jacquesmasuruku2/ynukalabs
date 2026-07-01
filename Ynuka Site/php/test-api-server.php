<?php
/**
 * Script de test API côté serveur
 * Exécutez ce fichier sur le serveur pour tester l'API sans problèmes CORS/SSL
 */

echo "=== Test API Côté Serveur ===\n\n";

// Test 1: Vérifier si les fichiers API existent
echo "[1/4] Vérification des fichiers API...\n";
$files = [
    'config.php' => __DIR__ . '/config.php',
    'api.php' => __DIR__ . '/api.php',
    'database.php' => __DIR__ . '/database.php'
];

foreach ($files as $name => $path) {
    if (file_exists($path)) {
        echo "  ✅ $name existe\n";
    } else {
        echo "  ❌ $name MANQUANT\n";
    }
}
echo "\n";

// Test 2: Tester la connexion à la base de données
echo "[2/4] Test connexion base de données...\n";
if (file_exists('config.php')) {
    require_once 'config.php';
    if ($pdo === null) {
        echo "  ❌ Connexion échouée: $dbConnectionError\n";
    } else {
        echo "  ✅ Connexion réussie à " . DB_NAME . "\n";
    }
} else {
    echo "  ⚠️  config.php manquant, impossible de tester\n";
}
echo "\n";

// Test 3: Vérifier les tables
echo "[3/4] Vérification des tables...\n";
if ($pdo !== null) {
    try {
        $result = $pdo->query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '" . DB_NAME . "' ORDER BY TABLE_NAME");
        $tables = $result->fetchAll(PDO::FETCH_ASSOC);
        echo "  Tables trouvées:\n";
        foreach ($tables as $table) {
            echo "    - " . $table['TABLE_NAME'] . "\n";
        }
        
        // Vérifier contact_messages spécifiquement
        $hasContactMessages = false;
        foreach ($tables as $table) {
            if ($table['TABLE_NAME'] === 'contact_messages') {
                $hasContactMessages = true;
                break;
            }
        }
        if ($hasContactMessages) {
            echo "  ✅ Table contact_messages existe\n";
        } else {
            echo "  ❌ Table contact_messages MANQUANTE\n";
        }
    } catch (Exception $e) {
        echo "  ❌ Erreur: " . $e->getMessage() . "\n";
    }
} else {
    echo "  ⚠️  Pas de connexion DB\n";
}
echo "\n";

// Test 4: Tester l'endpoint API localement
echo "[4/4] Test endpoint API (via include)...\n";
if (file_exists('api.php')) {
    // Simuler une requête POST
    $_GET['action'] = 'ping';
    $_SERVER['REQUEST_METHOD'] = 'GET';
    
    echo "  Test de l'action 'ping'...\n";
    
    // Capturer la sortie
    ob_start();
    try {
        include 'api.php';
        $output = ob_get_clean();
        echo "  ✅ API exécutée avec succès\n";
        echo "  Réponse: " . substr($output, 0, 200) . "...\n";
    } catch (Exception $e) {
        ob_end_clean();
        echo "  ❌ Erreur API: " . $e->getMessage() . "\n";
    }
} else {
    echo "  ❌ api.php manquant\n";
}

echo "\n=== Résumé ===\n";
echo "Si tous les tests sont ✅, l'API fonctionne localement.\n";
echo "Le problème 'Failed to fetch' depuis le navigateur est probablement:\n";
echo "1. L'API n'est pas déployée sur le serveur distant\n";
echo "2. Problème CORS (headers manquants)\n";
echo "3. Problème SSL/TLS\n";
echo "\n";
echo "Solution: Uploadez les fichiers PHP sur le serveur via FTP/DirectAdmin\n";
?>
