<?php
/**
 * Version de débogage du fichier Panel Admin
 * Commente les fonctionnalités complexes une par une pour identifier l'erreur 500
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// ============ SESSION (OAuth state — avant toute sortie) ============
$ynukaHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || ((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
    || ((int) ($_SERVER['SERVER_PORT'] ?? 0) === 443);

ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.cookie_domain', '.ynukalabs.com');
ini_set('session.cookie_path', '/');
ini_set('session.cookie_secure', $ynukaHttps ? '1' : '0');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');

if (session_status() === PHP_SESSION_NONE) {
    session_name('YNUKA_ADMIN');
    session_start();
}

// ============ CONFIGURATION ============
define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');
define('JWT_SECRET', 'MXsiCkSR5QexkLqRj5z6l6iF3QW6xWwPO4cXe0GX5gE=');

// CORS: Configuration par environnement
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
$allowedOrigins = ['https://ynukalabs.com', 'https://www.ynukalabs.com', 'https://admin.ynukalabs.com'];
if (in_array($origin, $allowedOrigins, true)) {
    define('ALLOWED_ORIGIN', $origin);
} else {
    define('ALLOWED_ORIGIN', getenv('ALLOWED_ORIGIN') ?: $origin);
}

// ---- Google OAuth2 (set these to enable the "Sign in with Google" button) ----
define('GOOGLE_CLIENT_ID',     getenv('GOOGLE_CLIENT_ID')     ?: '1039734035041-3ob85lpfheoonvv43759desitdr7rhgc.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: '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');
define('GOOGLE_REDIRECT_URI',  getenv('GOOGLE_REDIRECT_URI')  ?: 'https://admin.ynukalabs.com/api/api.php?action=google_callback');
define('ALLOW_REGISTRATION',   filter_var(getenv('ALLOW_REGISTRATION') ?: 'false', FILTER_VALIDATE_BOOLEAN));
define('GOOGLE_OPEN_ACCESS',   filter_var(getenv('GOOGLE_OPEN_ACCESS') ?: 'true', FILTER_VALIDATE_BOOLEAN));
define('PANEL_URL',            getenv('PANEL_URL')            ?: 'https://admin.ynukalabs.com');
define('ALLOWED_GOOGLE_EMAILS', getenv('ALLOWED_GOOGLE_EMAILS') ?: '');

// Security notification email settings
define('SECURITY_NOTIFICATION_ENABLED', filter_var(getenv('SECURITY_NOTIFICATION_ENABLED') ?: 'true', FILTER_VALIDATE_BOOLEAN));
define('SECURITY_NOTIFICATION_FROM', getenv('SECURITY_NOTIFICATION_FROM') ?: 'noreply@ynukalabs.com');
define('SECURITY_NOTIFICATION_FROM_NAME', getenv('SECURITY_NOTIFICATION_FROM_NAME') ?: 'Ynuka Labs Security');

$ALLOWED_TABLES = [
    'users', 'user_roles', 'blog_posts', 'blog_comments',
    'contact_messages', 'donations', 'events', 'event_registrations',
    'gallery_images', 'gallery_events', 'newsletter_subscribers', 'projects',
    'resource_items', 'resource_sections', 'team_members', 'opportunities',
    'opportunity_applications', 'opportunity_motivation_forms',
];

// ============ CORS ============
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ============ HELPERS ============
function json_out($data, int $code = 200) { http_response_code($code); echo json_encode($data); exit; }
function err(string $msg, int $code = 400, array $extra = []) { json_out(['error' => $msg] + $extra, $code); }

function panel_login_redirect(string $fragment): void {
    header('Location: ' . rtrim(PANEL_URL, '/') . '/login#' . ltrim($fragment, '#'));
    exit;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER, DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
    }
    return $pdo;
}

function b64url(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function b64url_decode(string $s): string {
    return base64_decode(strtr($s, '-_', '+/') . str_repeat('=', (4 - strlen($s) % 4) % 4));
}
function jwt_encode(array $payload): string {
    $h = b64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $b = b64url(json_encode($payload));
    $s = b64url(hash_hmac('sha256', "$h.$b", JWT_SECRET, true));
    return "$h.$b.$s";
}
function jwt_decode(string $token): ?array {
    $p = explode('.', $token);
    if (count($p) !== 3) return null;
    [$h, $b, $s] = $p;
    if (!hash_equals(b64url(hash_hmac('sha256', "$h.$b", JWT_SECRET, true)), $s)) return null;
    $payload = json_decode(b64url_decode($b), true);
    if (!is_array($payload) || (isset($payload['exp']) && $payload['exp'] < time())) return null;
    return $payload;
}

// ============ EMAIL FUNCTIONS ============
function sendNewsletterWelcomeEmail(string $name, string $email): bool {
    $to = $email;
    $subject = "Merci {$name} de vous être inscrit à la newsletter Ynuka Labs";
    
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
                <h1>🎉 Bienvenue chez Ynuka Labs !</h1>
            </div>
            <div class='content'>
                <h2>Merci {$name} de vous être inscrit à notre newsletter</h2>
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

    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: Ynuka Labs <contact@ynukalabs.com>',
        'Reply-To: contact@ynukalabs.com',
        'X-Mailer: PHP/' . phpversion()
    ];

    return mail($to, $subject, $message, implode("\r\n", $headers));
}

function sendContactConfirmationEmail(string $name, string $email, string $subject): bool {
    $to = $email;
    $emailSubject = "Merci {$name} de nous avoir contactés - Ynuka Labs";
    
    $message = "
    <html lang=\"fr\">
<head>
  <meta charset=\"UTF-8\">
  <title>Confirmation de réception - Ynuka Labs</title>
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  <style>
    :root {
      --primary: #ffb800;
      --secondary: #004080;
      --light: #f9f9f9;
      --dark: #111;
    }

    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      background: var(--light);
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
    }

    .header {
      background: linear-gradient(135deg, var(--primary) 0%, #ff9500 100%);
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }

    .header h1 {
      color: var(--dark);
      margin: 0;
      font-size: 26px;
    }

    .content {
      background: #fff;
      padding: 25px;
      border-radius: 0 0 10px 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }

    .content h2 {
      color: var(--secondary);
      margin-top: 0;
      font-size: 20px;
    }

    .subject-box {
      background: var(--light);
      padding: 15px;
      border-left: 4px solid var(--primary);
      margin: 20px 0;
      border-radius: 4px;
    }

    .button {
      display: inline-block;
      background: var(--primary);
      color: var(--dark);
      padding: 12px 25px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin-top: 20px;
      transition: background 0.3s ease;
    }

    .button:hover {
      background: #ff9500;
    }

    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 14px;
    }

    @media (max-width: 480px) {
      .container {
        padding: 10px;
      }
      .header h1 {
        font-size: 22px;
      }
      .content h2 {
        font-size: 18px;
      }
      .button {
        width: 100%;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class=\"container\">
    <div class=\"header\">
      <h1>✅ Message reçu !</h1>
    </div>
    <div class=\"content\">
      <h2>Bonjour {$name},</h2>
      <p>Merci beaucoup de nous avoir contactés ! Nous apprécions votre intérêt pour Ynuka Labs.</p>
      
      <div class=\"subject-box\">
        <strong>Votre sujet :</strong><br>
        {$subject}
      </div>
      
      <p>Nous avons bien reçu votre message et un membre de notre équipe vous répondra dans les plus brefs délais.</p>
      
      <p>Pendant ce temps, n'hésitez pas à :</p>
      <ul>
        <li>📚 <strong>Explorer nos ressources</strong> pour en savoir plus sur nos projets</li>
        <li>📅 <strong><a href=\"https://www.ynukalabs.com/events\" style=\"color: var(--secondary);\">Consulter nos événements</a></strong> à venir</li>
        <li>💼 <strong><a href=\"https://www.ynukalabs.com/opportunities\" style=\"color: var(--secondary);\">Découvrir nos opportunités</a></strong> si vous cherchez à collaborer</li>
      </ul>
      
      <p style=\"margin-top: 30px;\">
        <strong>L'équipe Ynuka Labs</strong><br>
        <em>DR Congo</em>
      </p>
      <div style=\"text-align: center; margin-top: 20px;\">
        <a href=\"https://ynukalabs.com\" class=\"button\">Visiter notre site</a>
      </div>
    </div>
    <div class=\"footer\">
      <p>© " . date('Y') . " Ynuka Labs. Tous droits réservés.</p>
      <p>Cet email a été envoyé automatiquement suite à votre demande de contact, veuillez ne pas y répondre</p>
    </div>
  </div>
</body>
</html>
";

    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: Ynuka Labs <contact@ynukalabs.com>',
        'Reply-To: contact@ynukalabs.com',
        'X-Mailer: PHP/' . phpversion()
    ];

    return mail($to, $emailSubject, $message, implode("\r\n", $headers));
}

// ============ MAIN ROUTER ============
$action   = $_GET['action']   ?? '';
$resource = $_GET['resource'] ?? '';
$id       = $_GET['id']       ?? null;
$body     = json_decode(file_get_contents('php://input'), true) ?: [];

// Handle Strapi-like format: { data: {...} }
if (!empty($body['data']) && is_array($body['data'])) {
    $body = $body['data'];
}

try {
    switch ($action) {

        // ---- DIAGNOSTIC (no auth) ----
        case 'ping': {
            $out = [
                'ok' => true,
                'php_version' => PHP_VERSION,
                'time' => date('c'),
                'config' => [
                    'db_host' => DB_HOST,
                    'db_name' => DB_NAME,
                    'db_user_set' => DB_USER !== 'YOUR_DB_USER',
                    'jwt_secret_set' => JWT_SECRET !== 'CHANGE_ME_TO_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARS',
                    'google_oauth_set' => GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
                        && GOOGLE_CLIENT_SECRET !== 'YOUR_GOOGLE_CLIENT_SECRET',
                    'google_redirect_uri' => GOOGLE_REDIRECT_URI,
                    'allow_registration' => ALLOW_REGISTRATION,
                    'google_open_access' => GOOGLE_OPEN_ACCESS,
                ],
                'tables_found' => [],
                'tables_expected' => $ALLOWED_TABLES,
            ];
            try {
                $tables = array_map(fn($r) => array_values($r)[0],
                    db()->query("SHOW TABLES")->fetchAll());
                $out['db'] = 'ok';
                $out['tables_found'] = $tables;
                $out['tables_missing'] = array_values(array_diff($ALLOWED_TABLES, $tables));
            } catch (Throwable $e) {
                $out['db'] = 'error';
                $out['db_error'] = $e->getMessage();
            }
            json_out($out);
        }

        // ---- NEWSLETTER SUBSCRIPTION (public, no auth) ----
        case 'subscribe_newsletter': {
            $name = trim($body['name'] ?? '');
            $email = trim($body['email'] ?? '');

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                err('Invalid email address', 400);
            }

            $stmt = db()->prepare("SELECT id FROM newsletter_subscribers WHERE email = ?");
            $stmt->execute([$email]);
            
            if ($stmt->fetch()) {
                err('Email already subscribed', 409);
            }

            $stmt = db()->prepare("INSERT INTO newsletter_subscribers (name, email, active, subscribed_at) VALUES (?, ?, 1, NOW())");
            $stmt->execute([$name, $email]);

            $emailSent = sendNewsletterWelcomeEmail($name, $email);

            if ($emailSent) {
                json_out(['success' => true, 'message' => 'Subscription successful']);
            } else {
                json_out(['success' => true, 'message' => 'Subscription successful (email delivery pending)']);
            }
        }

        // ---- CONTACT FORM SUBMISSION (public, no auth) ----
        case 'submit_contact_form': {
            $name = trim($body['name'] ?? '');
            $email = trim($body['email'] ?? '');
            $phone = trim($body['phone'] ?? '');
            $subject = trim($body['subject'] ?? '');
            $message = trim($body['message'] ?? '');

            if (empty($name) || empty($email) || empty($subject) || empty($message)) {
                err('Missing required fields', 400);
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                err('Invalid email address', 400);
            }

            $stmt = db()->prepare("INSERT INTO contact_messages (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$name, $email, $phone, $subject, $message]);

            $emailSent = sendContactConfirmationEmail($name, $email, $subject);

            if ($emailSent) {
                json_out(['success' => true, 'message' => 'Message sent successfully']);
            } else {
                json_out(['success' => true, 'message' => 'Message sent successfully (email delivery pending)']);
            }
        }

        default:
            err('Unknown action. Try ?action=ping');
    }
} catch (Throwable $e) {
    err($e->getMessage(), 500);
}
?>
