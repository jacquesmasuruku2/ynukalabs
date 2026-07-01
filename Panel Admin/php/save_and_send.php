<?php
/**
 * Script backend pour enregistrer et envoyer les newsletters
 * Intègre l'API Brevo v3 pour l'envoi d'emails
 */
require_once __DIR__ . '/config.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ./index.php');
    exit();
}

$subject = trim($_POST['subject'] ?? '');
$content = $_POST['content'] ?? '';
$action = $_POST['action'] ?? 'draft';
$newsletterId = $_POST['newsletter_id'] ?? null;

if (empty($subject) || empty($content)) {
    header('Location: ./newsletter_form.php?error=missing_fields');
    exit();
}

try {
    $pdo = getDBConnection();
    
    if ($newsletterId) {
        // Mise à jour d'une newsletter existante
        if ($action === 'send') {
            $stmt = $pdo->prepare("UPDATE newsletters SET subject = ?, content = ?, status = 'sending' WHERE id = ?");
            $stmt->execute([$subject, $content, $newsletterId]);
        } else {
            $stmt = $pdo->prepare("UPDATE newsletters SET subject = ?, content = ?, status = 'draft' WHERE id = ?");
            $stmt->execute([$subject, $content, $newsletterId]);
            header('Location: ./index.php?success=draft');
            exit();
        }
    } else {
        // Création d'une nouvelle newsletter
        if ($action === 'send') {
            $stmt = $pdo->prepare("INSERT INTO newsletters (subject, content, status) VALUES (?, ?, 'sending')");
            $stmt->execute([$subject, $content]);
            $newsletterId = $pdo->lastInsertId();
        } else {
            $stmt = $pdo->prepare("INSERT INTO newsletters (subject, content, status) VALUES (?, ?, 'draft')");
            $stmt->execute([$subject, $content]);
            header('Location: ./index.php?success=draft');
            exit();
        }
    }
    
    // Si l'action est d'envoyer, procéder à l'envoi via Brevo
    if ($action === 'send') {
        // Récupérer tous les abonnés actifs
        $stmt = $pdo->prepare("SELECT * FROM newsletter_subscribers WHERE active = 1");
        $stmt->execute();
        $subscribers = $stmt->fetchAll();
        
        if (empty($subscribers)) {
            // Aucun abonné, mettre à jour le statut
            $stmt = $pdo->prepare("UPDATE newsletters SET status = 'sent', sent_at = NOW() WHERE id = ?");
            $stmt->execute([$newsletterId]);
            header('Location: ./index.php?success=sent&count=0');
            exit();
        }
        
        // Préparer le contenu HTML avec le lien de désabonnement
        $emailsSent = 0;
        $emailsFailed = 0;
        
        foreach ($subscribers as $subscriber) {
            $email = $subscriber['email'];
            $name = $subscriber['name'] ?? 'Abonné';
            
            // Créer le lien de désabonnement
            $unsubscribeLink = 'https://admin.ynukalabs.com/api/unsubscribe.php?email=' . urlencode($email);
            
            // Ajouter le footer avec le lien de désabonnement
            $finalContent = $content . '
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
                <p>Vous recevez cet email car vous êtes abonné à la newsletter Ynuka Labs.</p>
                <p><a href="' . $unsubscribeLink . '" style="color: #ffb800;">Se désabonner</a></p>
                <p>© ' . date('Y') . ' Ynuka Labs. Tous droits réservés.</p>
            </div>';
            
            // Envoyer via Brevo API
            try {
                sendBrevoEmail($email, $name, $subject, $finalContent);
                $emailsSent++;
            } catch (Exception $e) {
                error_log("Erreur d'envoi à $email: " . $e->getMessage());
                $emailsFailed++;
            }
        }
        
        // Mettre à jour le statut de la newsletter
        $stmt = $pdo->prepare("UPDATE newsletters SET status = 'sent', sent_at = NOW() WHERE id = ?");
        $stmt->execute([$newsletterId]);
        
        header('Location: ./index.php?success=sent&count=' . $emailsSent);
        exit();
    }
    
} catch (PDOException $e) {
    error_log("Erreur de base de données: " . $e->getMessage());
    header('Location: ./newsletter_form.php?error=db_error');
    exit();
} catch (Exception $e) {
    error_log("Erreur générale: " . $e->getMessage());
    header('Location: ./newsletter_form.php?error=general_error');
    exit();
}

/**
 * Fonction pour envoyer un email via l'API Brevo v3
 */
function sendBrevoEmail($toEmail, $toName, $subject, $htmlContent) {
    // Configuration de l'API Brevo
    $apiKey = BREVO_API_KEY;
    
    // Préparer les données de l'email
    $data = [
        'sender' => [
            'name' => 'Ynuka Labs',
            'email' => 'contact@ynukalabs.com'
        ],
        'to' => [
            [
                'email' => $toEmail,
                'name' => $toName
            ]
        ],
        'subject' => $subject,
        'htmlContent' => $htmlContent,
        'headers' => [
            'X-Mailin-custom' => 'custom_header_1:custom_value_1'
        ]
    ];
    
    // Initialiser cURL
    $ch = curl_init('https://api.brevo.com/v3/smtp/email');
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'api-key: ' . $apiKey
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 201 && $httpCode !== 200) {
        throw new Exception("Brevo API error: HTTP $httpCode - $response");
    }
    
    return true;
}
?>
