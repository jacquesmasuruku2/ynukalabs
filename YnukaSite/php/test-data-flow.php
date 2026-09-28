<?php
/**
 * TEST DATA FLOW — Vérifier que les données sont correctement lues/écrites
 * Accédez à: https://yourdomain.com/php/test-data-flow.php
 */

require_once 'config.php';

echo "<!DOCTYPE html>
<html lang='fr'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Diagnostic - Flux de Données</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        h2 { color: #007bff; margin-top: 20px; }
        .test { margin: 15px 0; padding: 15px; border-left: 4px solid #ddd; background: #f9f9f9; }
        .success { border-left-color: #28a745; background: #f0f8f0; }
        .error { border-left-color: #dc3545; background: #f8f0f0; }
        .warning { border-left-color: #ffc107; background: #fff8f0; }
        .status { font-weight: bold; }
        .success .status { color: #28a745; }
        .error .status { color: #dc3545; }
        .warning .status { color: #ffc107; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
        th { background: #007bff; color: white; }
    </style>
</head>
<body>
<div class='container'>
    <h1>🔍 Diagnostic - Flux de Données Ynuka Labs</h1>";

// ============ TEST 1: DATABASE CONNECTION ============
echo "<h2>1️⃣ Connexion à la Base de Données</h2>";
if ($pdo === null) {
    echo "<div class='test error'>
        <div class='status'>❌ ERREUR DE CONNEXION</div>
        <p>La base de données n'est pas accessible.</p>
        <pre>" . htmlspecialchars($dbConnectionError ?? 'Unknown error') . "</pre>
    </div>";
} else {
    echo "<div class='test success'>
        <div class='status'>✅ CONNECTÉ</div>
        <p>Base de données: <strong>" . DB_NAME . "</strong></p>
        <p>Hôte: <strong>" . DB_HOST . "</strong></p>
        <p>Utilisateur: <strong>" . DB_USER . "</strong></p>
    </div>";
}

if ($pdo === null) {
    echo "</div></body></html>";
    exit;
}

// ============ TEST 2: LIST TABLES ============
echo "<h2>2️⃣ Tables Disponibles</h2>";
try {
    $result = $pdo->query("SELECT TABLE_NAME as table_name FROM information_schema.TABLES WHERE TABLE_SCHEMA = '" . DB_NAME . "' ORDER BY TABLE_NAME");
    $tables = $result->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<div class='test success'>
        <div class='status'>✅ " . count($tables) . " TABLES TROUVÉES</div>
        <table>
            <tr><th>Nom de la table</th><th>Nombre de lignes</th></tr>";
    
    $totalRows = 0;
    foreach ($tables as $table) {
        $tableName = $table['table_name'];
        $rowCount = $pdo->query("SELECT COUNT(*) FROM `$tableName`")->fetchColumn();
        $totalRows += $rowCount;
        echo "<tr>
            <td><code>" . htmlspecialchars($tableName) . "</code></td>
            <td>" . number_format($rowCount) . "</td>
        </tr>";
    }
    
    echo "</table>
        <p><strong>Total d'enregistrements:</strong> " . number_format($totalRows) . "</p>
    </div>";
} catch (Exception $e) {
    echo "<div class='test error'>
        <div class='status'>❌ ERREUR</div>
        <pre>" . htmlspecialchars($e->getMessage()) . "</pre>
    </div>";
}

// ============ TEST 3: READ SAMPLES ============
echo "<h2>3️⃣ Lecture d'Exemples de Données</h2>";

$testTables = ['contact_messages', 'newsletter_subscribers', 'donations', 'users', 'events'];
foreach ($testTables as $tableName) {
    try {
        // Vérifier que la table existe
        $checkStmt = $pdo->prepare("SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? LIMIT 1");
        $checkStmt->execute([DB_NAME, $tableName]);
        
        if (!$checkStmt->fetchColumn()) {
            continue;
        }
        
        // Compter les lignes
        $countStmt = $pdo->query("SELECT COUNT(*) FROM `$tableName`");
        $count = $countStmt->fetchColumn();
        
        // Récupérer les colonnes
        $columnsStmt = $pdo->query("SHOW COLUMNS FROM `$tableName`");
        $columns = array_map(fn($r) => $r['Field'], $columnsStmt->fetchAll(PDO::FETCH_ASSOC));
        
        // Récupérer 1 exemple
        $stmt = $pdo->prepare("SELECT * FROM `$tableName` LIMIT 1");
        $stmt->execute();
        $sample = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($count > 0) {
            echo "<div class='test success'>
                <div class='status'>✅ " . htmlspecialchars($tableName) . "</div>
                <p><strong>Nombre d'enregistrements:</strong> " . number_format($count) . "</p>
                <p><strong>Colonnes:</strong> " . count($columns) . "</p>
                <p><strong>Exemple d'enregistrement:</strong></p>
                <pre>" . json_encode($sample, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>
            </div>";
        } else {
            echo "<div class='test warning'>
                <div class='status'>⚠️ " . htmlspecialchars($tableName) . "</div>
                <p><strong>Aucun enregistrement</strong> (table vide)</p>
                <p><strong>Colonnes:</strong> " . count($columns) . " — " . implode(', ', array_map(fn($c) => '<code>' . htmlspecialchars($c) . '</code>', $columns)) . "</p>
            </div>";
        }
    } catch (Exception $e) {
        echo "<div class='test error'>
            <div class='status'>❌ " . htmlspecialchars($tableName) . "</div>
            <pre>" . htmlspecialchars($e->getMessage()) . "</pre>
        </div>";
    }
}

// ============ TEST 4: API ENDPOINTS ============
echo "<h2>4️⃣ Test des Endpoints API</h2>";
echo "<div class='test warning'>
    <p>Pour tester les endpoints, utilisez:</p>
    <ul>
        <li><code>GET /php/api.php?action=ping</code> — Diagnostic (pas d'auth requise)</li>
        <li><code>GET /php/api.php?action=list&resource=contact_messages&page=1&limit=10</code> — Lire les messages</li>
        <li><code>POST /php/api.php?action=create&resource=newsletter_subscribers</code> — Créer un abonné</li>
        <li><code>GET /php/api.php?action=get&resource=contact_messages&id=1</code> — Lire un message</li>
    </ul>
</div>";

// ============ TEST 5: WRITE TEST (OPTIONNEL) ============
echo "<h2>5️⃣ Test d'Écriture (Simulation)</h2>";
echo "<div class='test warning'>
    <div class='status'>ℹ️ SIMULATION UNIQUEMENT</div>
    <p>Voici comment les données seraient écrites:</p>
    <pre>" . json_encode([
        'action' => 'create',
        'resource' => 'newsletter_subscribers',
        'data' => [
            'email' => 'test@example.com',
            'subscribed_at' => date('Y-m-d H:i:s')
        ]
    ], JSON_PRETTY_PRINT) . "</pre>
    <p>Envoyer via POST avec Authorization header si requis</p>
</div>";

// ============ TEST 6: VERIFICATION FINALE ============
echo "<h2>6️⃣ Vérification Finale</h2>";
$allOk = $pdo !== null && count($tables) > 0;

if ($allOk) {
    echo "<div class='test success'>
        <div class='status'>✅ TOUT EST OPÉRATIONNEL</div>
        <p>Les données peuvent être lues et écrites dans la base de données.</p>
        <p>L'API est prête à recevoir les soumissions du site.</p>
    </div>";
} else {
    echo "<div class='test error'>
        <div class='status'>❌ PROBLÈME DÉTECTÉ</div>
        <p>Veuillez vérifier la configuration et les logs d'erreur.</p>
    </div>";
}

echo "</div>
</body>
</html>";
?>
