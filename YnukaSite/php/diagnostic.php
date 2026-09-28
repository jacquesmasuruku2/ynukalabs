<?php
/**
 * Ynuka Labs — API Diagnostic Tool
 * Checks database connection, tables, and API functionality
 */

echo "=== Ynuka Labs API Diagnostic ===\n\n";

// Check config.php
if (!file_exists('config.php')) {
    die("ERROR: config.php not found\n");
}

require_once 'config.php';

// Check database connection
echo "[1/5] Testing database connection...\n";
if ($pdo === null) {
    echo "❌ FAILED: Database connection error\n";
    echo "Error: " . $dbConnectionError . "\n\n";
} else {
    echo "✅ SUCCESS: Connected to database\n";
    echo "Database: " . DB_NAME . "\n\n";
}

// List all tables
echo "[2/5] Checking database tables...\n";
if ($pdo !== null) {
    $result = $pdo->query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '" . DB_NAME . "' ORDER BY TABLE_NAME");
    $tables = $result->fetchAll(PDO::FETCH_ASSOC);
    
    $expectedTables = [
        'admin_users', 'users', 'user_roles', 'blog_posts', 'blog_comments',
        'contact_messages', 'donations', 'events', 'event_registrations',
        'gallery_images', 'newsletter_subscribers', 'projects',
        'resource_items', 'team_members'
    ];
    
    $missingTables = [];
    $foundTables = array_map(fn($t) => $t['TABLE_NAME'], $tables);
    
    foreach ($expectedTables as $table) {
        if (in_array($table, $foundTables)) {
            echo "  ✅ $table\n";
        } else {
            echo "  ❌ $table (MISSING)\n";
            $missingTables[] = $table;
        }
    }
    
    if (!empty($missingTables)) {
        echo "\n⚠️  Missing tables: " . implode(', ', $missingTables) . "\n";
        echo "   Execute tables-complete.sql to create missing tables\n";
    } else {
        echo "\n✅ All required tables exist\n";
    }
    echo "\n";
}

// Check table structure
echo "[3/5] Checking critical table structures...\n";
$criticalTables = [
    'newsletter_subscribers' => ['email', 'name', 'active', 'subscribed_at'],
    'contact_messages' => ['name', 'email', 'message', 'created_at'],
    'event_registrations' => ['event_id', 'full_name', 'email']
];

foreach ($criticalTables as $table => $requiredColumns) {
    if ($pdo !== null && in_array($table, $foundTables)) {
        $stmt = $pdo->query("SHOW COLUMNS FROM `$table`");
        $columns = array_map(fn($r) => $r['Field'], $stmt->fetchAll(PDO::FETCH_ASSOC));
        
        $missingCols = array_diff($requiredColumns, $columns);
        if (empty($missingCols)) {
            echo "  ✅ $table structure OK\n";
        } else {
            echo "  ⚠️  $table missing columns: " . implode(', ', $missingCols) . "\n";
        }
    }
}
echo "\n";

// Test API endpoints
echo "[4/5] Testing API endpoints...\n";
$testUrl = "http://" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "/php/api.php";

// Test PING
echo "  Testing PING endpoint...\n";
$response = @file_get_contents($testUrl . "?action=ping");
if ($response) {
    $data = json_decode($response, true);
    if (isset($data['status']) && $data['status'] === 'ok') {
        echo "    ✅ PING successful\n";
    } else {
        echo "    ⚠️  PING returned unexpected response\n";
    }
} else {
    echo "    ❌ PING failed (file_get_contents issue)\n";
}
echo "\n";

// Provide diagnostic summary
echo "[5/5] Diagnostic Summary\n";
echo "========================\n";

if ($pdo !== null) {
    echo "✅ Database is connected\n";
    echo "✅ API should be functional\n";
    echo "\nNext steps:\n";
    echo "1. If tables are missing, run: mysql -u " . DB_USER . " -p " . DB_NAME . " < tables-complete.sql\n";
    echo "2. Test the API with: curl 'http://localhost/php/api.php?action=ping'\n";
    echo "3. Check browser console for frontend errors\n";
} else {
    echo "❌ Database connection failed\n";
    echo "\nPlease check:\n";
    echo "1. Database credentials in config.php\n";
    echo "2. MySQL server is running\n";
    echo "3. Database 'ynukalab_database_website' exists\n";
}

echo "\nDiagnostic completed at " . date('Y-m-d H:i:s') . "\n";
?>
