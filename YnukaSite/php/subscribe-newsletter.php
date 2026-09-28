<?php
/**
 * Newsletter Subscription with Automatic Email
 * 
 * This script handles newsletter subscription and sends a welcome email
 * to the subscriber with personalized content.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit();
}

// Database configuration
$db_host = 'localhost';
$db_name = 'ynukalabs_db';
$db_user = 'ynukalabs_user';
$db_pass = 'your_password'; // Replace with actual password

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM newsletter_subscribers WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email already subscribed']);
        exit();
    }

    // Insert new subscriber
    $stmt = $pdo->prepare("INSERT INTO newsletter_subscribers (name, email, active, subscribed_at) VALUES (?, ?, 1, NOW())");
    $stmt->execute([$name, $email]);

    // Send welcome email
    $emailSent = sendWelcomeEmail($name, $email);

    if ($emailSent) {
        echo json_encode(['success' => true, 'message' => 'Subscription successful']);
    } else {
        // Subscription succeeded but email failed - still return success
        echo json_encode(['success' => true, 'message' => 'Subscription successful (email delivery pending)']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

/**
 * Send welcome email to newsletter subscriber
 */
function sendWelcomeEmail($name, $email) {
    $to = $email;
    $subject = "Merci {$name} de vous être inscrit à la newsletter Ynuka Labs";
    
    // Email body
    $message = "
    <html>
    <head>
        <title>Bienvenue chez Ynuka Labs</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ffb800 0%, #ff9500 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: #111; margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .content h2 { color: #ffb800; margin-top: 0; }
            .content ul { padding-left: 20px; }
            .content li { margin-bottom: 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: #ffb800; color: #111; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>Bienvenue chez Ynuka Labs !</h1>
            </div>
            <div class='content'>
                <h2>Merci {$name} de vous être inscrit(e) à notre newsletter</h2>
                <p>Vous recevrez désormais :</p>
                <ul>
                    <li>📅 <strong>Programmes de nos événements</strong></li>
                    <li>💼 <strong>Publication des opportunités</strong></li>
                    <li>🌱 <strong>Les mises à jour de l'écosystème Ynuka Labs</strong></li>
                    <li>📚 <strong>Et bien d'autres infos essentielles</strong></li>
                </ul>
                <p>Nous sommes ravis de vous compter parmi nos abonnés et nous nous engageons à vous fournir un contenu de qualité.</p>
                <p>À très bientôt !</p>
                <p style='margin-top: 30px;'>
                    <strong>L'équipe Ynuka Labs</strong><br>
                    <em>DR Congo</em>
                </p>
                <div style='text-align: center; margin-top: 20px;'>
                    <a href='https://ynukalabs.com' class='button'>Revenir sur le site</a>
                </div>
            </div>
            <div class='footer'>
                <p>© " . date('Y') . " Ynuka Labs. Tous droits réservés.</p>
                <p>Si vous ne souhaitez plus recevoir ces emails, vous pouvez vous désabonner à tout moment.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    // Headers
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Ynuka Labs <contact@ynukalabs.com>\r\n";
    $headers .= "Reply-To: contact@ynukalabs.com\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Send email
    return mail($to, $subject, $message, $headers);
}
?>
