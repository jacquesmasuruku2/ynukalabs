<?php
// Script de test pour vérifier l'API activities.php
// À exécuter sur le serveur: https://admin.ynukalabs.com/api/test_activities.php

header('Content-Type: text/html; charset=utf-8');

function getStatusIcon($success) {
    return $success ? '✅' : '❌';
}

function getStatusClass($success) {
    return $success ? 'success' : 'error';
}

function formatBytes($bytes) {
    if ($bytes >= 1048576) {
        return number_format($bytes / 1048576, 2) . ' MB';
    } elseif ($bytes >= 1024) {
        return number_format($bytes / 1024, 2) . ' KB';
    }
    return $bytes . ' octets';
}

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test API Activities - Ynuka Labs</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            color: white;
            margin-bottom: 2rem;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            padding: 2rem;
            margin-bottom: 1.5rem;
        }

        .test-section {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #e5e7eb;
        }

        .test-section:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .test-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .test-number {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.875rem;
        }

        .result {
            background: #f9fafb;
            border-radius: 8px;
            padding: 1rem;
            margin-top: 0.75rem;
        }

        .result-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 0;
            border-bottom: 1px solid #e5e7eb;
        }

        .result-item:last-child {
            border-bottom: none;
        }

        .result-label {
            font-weight: 500;
            color: #6b7280;
            min-width: 150px;
        }

        .result-value {
            color: #1f2937;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.875rem;
        }

        .success {
            color: #10b981;
        }

        .error {
            color: #ef4444;
        }

        .warning {
            color: #f59e0b;
        }

        .json-output {
            background: #1f2937;
            color: #e5e7eb;
            padding: 1rem;
            border-radius: 8px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.875rem;
            overflow-x: auto;
            margin-top: 0.75rem;
        }

        .table-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 0.75rem;
        }

        .table-column {
            background: #f3f4f6;
            padding: 0.75rem;
            border-radius: 6px;
            font-size: 0.875rem;
        }

        .table-column strong {
            display: block;
            color: #1f2937;
            margin-bottom: 0.25rem;
        }

        .table-column span {
            color: #6b7280;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }

        .activities-list {
            margin-top: 0.75rem;
        }

        .activity-item {
            background: #f9fafb;
            border-left: 4px solid #667eea;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            border-radius: 0 6px 6px 0;
        }

        .activity-item:last-child {
            margin-bottom: 0;
        }

        .activity-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.25rem;
        }

        .activity-type {
            background: #667eea;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .activity-user {
            font-weight: 600;
            color: #1f2937;
        }

        .activity-message {
            color: #6b7280;
            font-size: 0.875rem;
        }

        .activity-time {
            color: #9ca3af;
            font-size: 0.75rem;
            margin-top: 0.25rem;
        }

        .summary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1.5rem;
            border-radius: 12px;
            margin-top: 1.5rem;
        }

        .summary h3 {
            font-size: 1.25rem;
            margin-bottom: 1rem;
        }

        .summary-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }

        .stat-item {
            text-align: center;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 700;
        }

        .stat-label {
            font-size: 0.875rem;
            opacity: 0.9;
        }

        .refresh-btn {
            background: white;
            color: #667eea;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
            transition: all 0.2s;
        }

        .refresh-btn:hover {
            background: #f3f4f6;
            transform: translateY(-2px);
        }

        @media (max-width: 640px) {
            body {
                padding: 1rem;
            }

            .header h1 {
                font-size: 1.75rem;
            }

            .card {
                padding: 1.5rem;
            }

            .result-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.25rem;
            }

            .result-label {
                min-width: auto;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Test API Activities</h1>
            <p>Diagnostic du système de notifications - Ynuka Labs</p>
        </div>

        <div class="card">
            <?php
            $testsPassed = 0;
            $testsFailed = 0;

            // Test 1: Vérifier si le fichier activities.php existe
            $activitiesFile = __DIR__ . '/activities.php';
            $fileExists = file_exists($activitiesFile);
            $fileExists ? $testsPassed++ : $testsFailed++;
            ?>
            <div class="test-section">
                <div class="test-title">
                    <span class="test-number">1</span>
                    Vérification du fichier activities.php
                </div>
                <div class="result">
                    <div class="result-item">
                        <span class="result-label">Chemin:</span>
                        <span class="result-value"><?php echo htmlspecialchars($activitiesFile); ?></span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Existe:</span>
                        <span class="result-value <?php echo getStatusClass($fileExists); ?>">
                            <?php echo getStatusIcon($fileExists) . ' ' . ($fileExists ? 'OUI' : 'NON'); ?>
                        </span>
                    </div>
                    <?php if ($fileExists): ?>
                        <div class="result-item">
                            <span class="result-label">Taille:</span>
                            <span class="result-value"><?php echo formatBytes(filesize($activitiesFile)); ?></span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Modifié:</span>
                            <span class="result-value"><?php echo date('d/m/Y H:i:s', filemtime($activitiesFile)); ?></span>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <?php
            // Test 2: Tester l'endpoint ping
            $pingUrl = 'https://admin.ynukalabs.com/api/activities.php?action=ping';
            $ch = curl_init($pingUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            $pingSuccess = ($httpCode === 200 && !$error);
            $pingSuccess ? $testsPassed++ : $testsFailed++;
            ?>
            <div class="test-section">
                <div class="test-title">
                    <span class="test-number">2</span>
                    Test de l'endpoint ping
                </div>
                <div class="result">
                    <div class="result-item">
                        <span class="result-label">URL:</span>
                        <span class="result-value"><?php echo htmlspecialchars($pingUrl); ?></span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Code HTTP:</span>
                        <span class="result-value <?php echo getStatusClass($httpCode === 200); ?>">
                            <?php echo getStatusIcon($httpCode === 200) . ' ' . $httpCode; ?>
                        </span>
                    </div>
                    <?php if ($error): ?>
                        <div class="result-item">
                            <span class="result-label">Erreur cURL:</span>
                            <span class="result-value error"><?php echo htmlspecialchars($error); ?></span>
                        </div>
                    <?php endif; ?>
                    <?php if ($response): ?>
                        <div class="json-output"><?php echo htmlspecialchars($response); ?></div>
                    <?php endif; ?>
                </div>
            </div>

            <?php
            // Test 3: Tester la connexion à la base de données
            $dbConnected = false;
            $tableExists = false;
            $tableColumns = [];
            $activityCount = 0;
            $recentActivities = [];
            $dbError = '';

            try {
                define('DB_HOST', 'localhost');
                define('DB_NAME', 'ynukalab_database_website');
                define('DB_USER', 'ynukalab_admin-jacques');
                define('DB_PASS', 'Admin-Jacques.ynuka_db');

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
                        $dbConnected = true;
                        break;
                    } catch (PDOException $e) {
                        $dbError = $e->getMessage();
                    }
                }

                if ($dbConnected) {
                    // Test 4: Vérifier si la table admin_activities existe
                    $stmt = $pdo->query("SHOW TABLES LIKE 'admin_activities'");
                    $tableExists = $stmt->fetch() !== false;

                    if ($tableExists) {
                        // Vérifier la structure
                        $stmt = $pdo->query("DESCRIBE admin_activities");
                        $tableColumns = $stmt->fetchAll();

                        // Compter les enregistrements
                        $stmt = $pdo->query("SELECT COUNT(*) as count FROM admin_activities");
                        $activityCount = $stmt->fetch()['count'];

                        // Afficher les 5 derniers enregistrements
                        if ($activityCount > 0) {
                            $stmt = $pdo->query("SELECT * FROM admin_activities ORDER BY created_at DESC LIMIT 5");
                            $recentActivities = $stmt->fetchAll();
                        }
                    }
                }
            } catch (Exception $e) {
                $dbError = $e->getMessage();
            }

            $dbConnected ? $testsPassed++ : $testsFailed++;
            $tableExists ? $testsPassed++ : $testsFailed++;
            ?>

            <div class="test-section">
                <div class="test-title">
                    <span class="test-number">3</span>
                    Test de connexion à la base de données
                </div>
                <div class="result">
                    <div class="result-item">
                        <span class="result-label">Hôte:</span>
                        <span class="result-value"><?php echo DB_HOST; ?></span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Base de données:</span>
                        <span class="result-value"><?php echo DB_NAME; ?></span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Connexion:</span>
                        <span class="result-value <?php echo getStatusClass($dbConnected); ?>">
                            <?php echo getStatusIcon($dbConnected) . ' ' . ($dbConnected ? 'RÉUSSIE' : 'ÉCHOUÉE'); ?>
                        </span>
                    </div>
                    <?php if ($dbError): ?>
                        <div class="result-item">
                            <span class="result-label">Erreur:</span>
                            <span class="result-value error"><?php echo htmlspecialchars($dbError); ?></span>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <?php if ($dbConnected): ?>
                <div class="test-section">
                    <div class="test-title">
                        <span class="test-number">4</span>
                        Vérification de la table admin_activities
                    </div>
                    <div class="result">
                        <div class="result-item">
                            <span class="result-label">Table existe:</span>
                            <span class="result-value <?php echo getStatusClass($tableExists); ?>">
                                <?php echo getStatusIcon($tableExists) . ' ' . ($tableExists ? 'OUI' : 'NON'); ?>
                            </span>
                        </div>
                        <?php if ($tableExists): ?>
                            <div class="result-item">
                                <span class="result-label">Colonnes:</span>
                                <span class="result-value"><?php echo count($tableColumns); ?></span>
                            </div>
                            <div class="table-info">
                                <?php foreach ($tableColumns as $col): ?>
                                    <div class="table-column">
                                        <strong><?php echo htmlspecialchars($col['Field']); ?></strong>
                                        <span><?php echo htmlspecialchars($col['Type']); ?></span>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                            <div class="result-item" style="margin-top: 1rem;">
                                <span class="result-label">Enregistrements:</span>
                                <span class="result-value <?php echo $activityCount > 0 ? 'success' : 'warning'; ?>">
                                    <?php echo $activityCount; ?>
                                </span>
                            </div>
                            <?php if ($activityCount > 0): ?>
                                <div class="activities-list">
                                    <h4 style="margin-bottom: 0.5rem; color: #1f2937; font-weight: 600;">Dernières activités:</h4>
                                    <?php foreach ($recentActivities as $activity): ?>
                                        <div class="activity-item">
                                            <div class="activity-header">
                                                <span class="activity-type"><?php echo htmlspecialchars($activity['type']); ?></span>
                                                <span class="activity-user"><?php echo htmlspecialchars($activity['user']); ?></span>
                                            </div>
                                            <div class="activity-message"><?php echo htmlspecialchars($activity['message']); ?></div>
                                            <div class="activity-time"><?php echo date('d/m/Y H:i:s', strtotime($activity['created_at'])); ?></div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            <?php else: ?>
                                <div style="margin-top: 1rem; padding: 1rem; background: #fef3c7; border-radius: 6px; color: #92400e;">
                                    ⚠️ Aucune activité enregistrée. Les notifications apparaîtront lors des connexions/inscriptions.
                                </div>
                            <?php endif; ?>
                        <?php else: ?>
                            <div style="margin-top: 1rem; padding: 1rem; background: #fee2e2; border-radius: 6px; color: #991b1b;">
                                ❌ La table n'existe pas. Exécutez le script SQL: <code>api/create_activities_table.sql</code>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>

            <div class="summary">
                <h3>📊 Résumé</h3>
                <div class="summary-stats">
                    <div class="stat-item">
                        <div class="stat-value <?php echo getStatusClass(true); ?>"><?php echo $testsPassed; ?></div>
                        <div class="stat-label">Tests réussis</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value <?php echo getStatusClass($testsFailed === 0); ?>"><?php echo $testsFailed; ?></div>
                        <div class="stat-label">Tests échoués</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value"><?php echo $activityCount; ?></div>
                        <div class="stat-label">Activités</div>
                    </div>
                </div>
                <button class="refresh-btn" onclick="location.reload()">🔄 Rafraîchir le test</button>
            </div>
        </div>
    </div>
</body>
</html>
