<?php
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

/**
 * Ynuka Labs — Admin API (single-file PHP backend)
 *
 * DEPLOYMENT (Interserver shared hosting):
 *   1. Edit the DB_* + JWT_SECRET constants below
 *   2. Upload this file to public_html/api.php (or a subfolder)
 *   3. Open https://yourdomain.com/api.php?action=ping in a browser
 *      → must return JSON with "db": "ok" and the list of tables
 *   4. Run setup.sql once in phpMyAdmin to create admin_users
 *   5. Set the API URL in the panel login screen
 */

// ============ CONFIGURATION ============
define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');
define('JWT_SECRET', 'MXsiCkSR5QexkLqRj5z6l6iF3QW6xWwPO4cXe0GX5gE=');

// CORS: Configuration par environnement
// En développement: '*' pour tester les appels cross-origin
// En production: restreindre à votre domaine principal
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
// Autoriser le site public et l'admin panel
$allowedOrigins = ['https://ynukalabs.com', 'https://www.ynukalabs.com', 'https://admin.ynukalabs.com'];
if (in_array($origin, $allowedOrigins, true)) {
    define('ALLOWED_ORIGIN', $origin);
} else {
    define('ALLOWED_ORIGIN', getenv('ALLOWED_ORIGIN') ?: $origin);
}

// ---- Google OAuth2 (set these to enable the "Sign in with Google" button) ----
// 1) Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID (Web application)
// 2) Authorized redirect URI = exactly the value of GOOGLE_REDIRECT_URI below
//    (must match where api.php is deployed, e.g. .../api/api.php?action=google_callback)
// 3) After login, the API redirects the browser back to PANEL_URL/login#token=...
define('GOOGLE_CLIENT_ID',     getenv('GOOGLE_CLIENT_ID')     ?: '1039734035041-3ob85lpfheoonvv43759desitdr7rhgc.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: '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');
define('GOOGLE_REDIRECT_URI',  getenv('GOOGLE_REDIRECT_URI')  ?: 'https://admin.ynukalabs.com/api/api.php?action=google_callback');
// ALLOW_REGISTRATION=true → inscription par formulaire ouverte à tous (même si des admins existent).
define('ALLOW_REGISTRATION',   filter_var(getenv('ALLOW_REGISTRATION') ?: 'false', FILTER_VALIDATE_BOOLEAN));
// GOOGLE_OPEN_ACCESS=true (défaut) → tout compte Google vérifié peut se connecter et est créé automatiquement.
// Mettre à false pour n'autoriser que les emails dans admin_allowed_emails (ou ALLOWED_GOOGLE_EMAILS).
define('GOOGLE_OPEN_ACCESS',   filter_var(getenv('GOOGLE_OPEN_ACCESS') ?: 'true', FILTER_VALIDATE_BOOLEAN));
define('PANEL_URL',            getenv('PANEL_URL')            ?: 'https://admin.ynukalabs.com');

// Liste optionnelle (virgules) en complément de la table admin_allowed_emails. Utiliser * pour tout autoriser.
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

/** Redirection vers le panel React (/login + fragment hash). */
function panel_login_redirect(string $fragment): void {
    header('Location: ' . rtrim(PANEL_URL, '/') . '/login#' . ltrim($fragment, '#'));
    exit;
}

/** Envoie un email de notification de sécurité lors de la connexion. */
function send_security_notification(string $email, string $method = 'unknown'): void {
    if (!SECURITY_NOTIFICATION_ENABLED) return;
    
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    $time = date('Y-m-d H:i:s');
    
    // Détecter le navigateur/OS
    $browser = 'Unknown';
    if (preg_match('/Chrome/i', $userAgent)) $browser = 'Chrome';
    elseif (preg_match('/Firefox/i', $userAgent)) $browser = 'Firefox';
    elseif (preg_match('/Safari/i', $userAgent)) $browser = 'Safari';
    elseif (preg_match('/Edge/i', $userAgent)) $browser = 'Edge';
    
    $os = 'Unknown';
    if (preg_match('/Windows/i', $userAgent)) $os = 'Windows';
    elseif (preg_match('/Mac/i', $userAgent)) $os = 'MacOS';
    elseif (preg_match('/Linux/i', $userAgent)) $os = 'Linux';
    elseif (preg_match('/Android/i', $userAgent)) $os = 'Android';
    elseif (preg_match('/iOS/i', $userAgent)) $os = 'iOS';
    
    $subject = 'Security Alert: New login to Ynuka Labs Admin Panel';
    
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a2e; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; }
            .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>Security Alert</h2>
            </div>
            <div class='content'>
                <p>Hello,</p>
                <p>We detected a new login to your Ynuka Labs Admin Panel account.</p>
                
                <div class='info'>
                    <strong>Login Details:</strong><br>
                    Email: {$email}<br>
                    Method: {$method}<br>
                    Time: {$time} UTC<br>
                    IP Address: {$ip}<br>
                    Browser: {$browser}<br>
                    Operating System: {$os}
                </div>
                
                <div class='warning'>
                    <strong> Security Notice:</strong><br>
                    If this was you, you can safely ignore this email.<br>
                    If you did not initiate this login, please change your password immediately and contact support.
                </div>
                
                <p>Best regards,<br>Ynuka Labs Security Team</p>
            </div>
            <div class='footer'>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . SECURITY_NOTIFICATION_FROM_NAME . ' <' . SECURITY_NOTIFICATION_FROM . '>',
        'Reply-To: ' . SECURITY_NOTIFICATION_FROM,
        'X-Mailer: PHP/' . phpversion()
    ];
    
    // Log pour débogage
    error_log("Security notification attempt: email=$email, method=$method, ip=$ip");
    $result = mail($email, $subject, $message, implode("\r\n", $headers));
    error_log("Security notification result: " . ($result ? 'SUCCESS' : 'FAILED'));
}

/**
 * Send welcome email to newsletter subscriber
 */
function sendNewsletterWelcomeEmail(string $name, string $email): bool {
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

    // Headers
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: Ynuka Labs <contact@ynukalabs.com>',
        'Reply-To: contact@ynukalabs.com',
        'X-Mailer: PHP/' . phpversion()
    ];

    // Send email
    return mail($to, $subject, $message, implode("\r\n", $headers));
}

/**
 * Send confirmation email to contact form submitter
 */
function sendContactConfirmationEmail(string $name, string $email, string $subject): bool {
    $to = $email;
    $emailSubject = "Merci {$name} de nous avoir contactés - Ynuka Labs";
    
    // Email body
    $message = "
    <html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Confirmation de réception - Ynuka Labs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --primary: #ffb800;
      --secondary: #004080; /* bleu Ynuka Labs */
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

    /* Responsivité */
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
  <div class="container">
    <div class="header">
      <h1>✅ Message reçu !</h1>
    </div>
    <div class="content">
      <h2>Bonjour {$name},</h2>
      <p>Merci beaucoup de nous avoir contactés ! Nous apprécions votre intérêt pour Ynuka Labs.</p>
      
      <div class="subject-box">
        <strong>Votre sujet :</strong><br>
        {$subject}
      </div>
      
      <p>Nous avons bien reçu votre message et un membre de notre équipe vous répondra dans les plus brefs délais.</p>
      
      <p>Pendant ce temps, n'hésitez pas à :</p>
      <ul>
        <li>📚 <strong>Explorer nos ressources</strong> pour en savoir plus sur nos projets</li>
        <li>📅 <strong><a href="https://www.ynukalabs.com/events" style="color: var(--secondary);">Consulter nos événements</a></strong> à venir</li>
        <li>💼 <strong><a href="https://www.ynukalabs.com/opportunities" style="color: var(--secondary);">Découvrir nos opportunités</a></strong> si vous cherchez à collaborer</li>
      </ul>
      
      <p style="margin-top: 30px;">
        <strong>L'équipe Ynuka Labs</strong><br>
        <em>DR Congo</em>
      </p>
      <div style="text-align: center; margin-top: 20px;">
        <a href="https://ynukalabs.com" class="button">Visiter notre site</a>
      </div>
    </div>
    <div class="footer">
      <p>© " . date('Y') . " Ynuka Labs. Tous droits réservés.</p>
      <p>Cet email a été envoyé automatiquement suite à votre demande de contact, veuillez ne pas y répondre</p>
    </div>
  </div>
</body>
</html>
";

    // Headers
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: Ynuka Labs <contact@ynukalabs.com>',
        'Reply-To: contact@ynukalabs.com',
        'X-Mailer: PHP/' . phpversion()
    ];

    // Send email
    return mail($to, $emailSubject, $message, implode("\r\n", $headers));
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
function current_user(): ?array {
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if (!preg_match('/Bearer\s+(.*)/', $h, $m)) return null;
    return jwt_decode(trim($m[1]));
}
function require_auth(): array { $u = current_user(); if (!$u) err('Unauthorized', 401); return $u; }

function table_columns(string $t): array {
    return array_map(fn($r) => $r['Field'], db()->query("SHOW COLUMNS FROM `$t`")->fetchAll());
}
function pk_of(string $t): string {
    $r = db()->query("SHOW KEYS FROM `$t` WHERE Key_name = 'PRIMARY'")->fetch();
    return $r ? $r['Column_name'] : 'id';
}

function table_exists(string $t): bool {
    try {
        $s = db()->prepare("SELECT 1 FROM information_schema.tables WHERE table_schema = ? AND table_name = ? LIMIT 1");
        $s->execute([DB_NAME, $t]);
        return (bool) $s->fetchColumn();
    } catch (Throwable $e) { return false; }
}

function normalize_email(string $email): string {
    return strtolower(trim($email));
}

// ============ GOOGLE OAUTH HELPERS ============
/**
 * Verify Google ID token (simplified version for compatibility)
 */
function verify_google_id_token(string $id_token): ?array {
    $parts = explode('.', $id_token);
    if (count($parts) !== 3) return null;

    list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;
    $payload = json_decode(base64_decode(strtr($payloadEncoded, '-_', '+/')), true);

    if (!$payload) return null;
    if (!isset($payload['email']) || !isset($payload['aud'])) return null;
    if ($payload['aud'] !== GOOGLE_CLIENT_ID) return null;
    if (isset($payload['exp']) && $payload['exp'] < time()) return null;
    if (!($payload['email_verified'] ?? false)) return null;

    return [
        'email' => strtolower(trim($payload['email'])),
        'name' => $payload['name'] ?? $payload['email'],
        'picture' => $payload['picture'] ?? null,
        'email_verified' => $payload['email_verified'] ?? false,
    ];
}

/**
 * Check if email is allowed (for public site compatibility)
 */
function is_email_allowed(string $email): bool {
    // If GOOGLE_OPEN_ACCESS is true, all verified Google emails are allowed
    if (GOOGLE_OPEN_ACCESS) return true;

    // Check against ALLOWED_GOOGLE_EMAILS
    $allowedList = array_filter(array_map('trim', explode(',', ALLOWED_GOOGLE_EMAILS)));
    if (in_array('*', $allowedList)) return true;
    if (in_array(strtolower($email), array_map('strtolower', $allowedList))) return true;

    // Check against admin_allowed_emails table if it exists
    if (table_exists('admin_allowed_emails')) {
        $stmt = db()->prepare('SELECT email FROM admin_allowed_emails WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) return true;
    }

    return false;
}

/** Crée la table des emails autorisés (inscription formulaire ou Google restreint). */
function ensure_admin_allowed_emails_table(): void {
    if (table_exists('admin_allowed_emails')) {
        return;
    }
    db()->exec("CREATE TABLE IF NOT EXISTS `admin_allowed_emails` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `email` VARCHAR(255) NOT NULL UNIQUE,
        `note` VARCHAR(255) NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

/** Emails supplémentaires via variable d'environnement (virgules, * = tous). */
function allowed_emails_from_env(): array {
    $raw = ALLOWED_GOOGLE_EMAILS;
    return array_values(array_filter(array_map('trim', explode(',', strtolower($raw)))));
}

/** Email présent dans admin_allowed_emails ou dans ALLOWED_GOOGLE_EMAILS (ou *). */
function is_email_on_allowlist(string $email): bool {
    $email = normalize_email($email);
    if ($email === '') {
        return false;
    }
    $env = allowed_emails_from_env();
    if (in_array('*', $env, true) || in_array($email, $env, true)) {
        return true;
    }
    try {
        ensure_admin_allowed_emails_table();
        $stmt = db()->prepare('SELECT 1 FROM admin_allowed_emails WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        return (bool) $stmt->fetchColumn();
    } catch (Throwable $e) {
        error_log('is_email_on_allowlist: ' . $e->getMessage());
        return false;
    }
}

/** Inscription par email/mot de passe : premier compte, ALLOW_REGISTRATION, ou allowlist. */
function can_register_email(string $email): bool {
    if (!table_exists('admin_users')) {
        return false;
    }
    $count = (int) db()->query('SELECT COUNT(*) FROM admin_users')->fetchColumn();
    if ($count === 0) {
        return true;
    }
    if (ALLOW_REGISTRATION) {
        return true;
    }
    return is_email_on_allowlist($email);
}

/** Première connexion Google : accès ouvert ou email sur allowlist. */
function can_google_auto_provision(string $email): bool {
    if (GOOGLE_OPEN_ACCESS) {
        return true;
    }
    return is_email_on_allowlist($email);
}

/** Insère ou met à jour un admin à partir du profil Google. */
function upsert_admin_from_google(string $googleId, string $email, string $name, string $picture): array {
    $cols = table_columns('admin_users');
    
    // Build WHERE clause based on what columns exist
    $whereConditions = ['email = ?'];
    $whereParams = [$email];
    if (in_array('google_id', $cols, true)) {
        $whereConditions[] = 'google_id = ?';
        $whereParams[] = $googleId;
    }
    $where = implode(' OR ', $whereConditions);
    
    $stmt = db()->prepare("SELECT id, email, name, avatar_url FROM admin_users WHERE $where LIMIT 1");
    $stmt->execute($whereParams);
    $u = $stmt->fetch();

    if (!$u) {
        // Insert new admin
        $row = ['email' => $email];
        if (in_array('name', $cols, true)) {
            $row['name'] = $name ?: $email;
        }
        if (in_array('avatar_url', $cols, true)) {
            $row['avatar_url'] = $picture;
        }
        if (in_array('google_id', $cols, true)) {
            $row['google_id'] = $googleId;
        }
        if (in_array('password_hash', $cols, true)) {
            $row['password_hash'] = null;
        }
        $fields = array_keys($row);
        $place = implode(',', array_fill(0, count($fields), '?'));
        $ins = db()->prepare('INSERT INTO admin_users (`' . implode('`,`', $fields) . '`) VALUES (' . $place . ')');
        $ins->execute(array_values($row));
        $newId = (int) db()->lastInsertId();
        $u = [
            'id' => $newId,
            'email' => $email,
            'name' => $row['name'] ?? $name,
            'avatar_url' => $picture,
        ];
    } else {
        // Update existing admin
        $updates = [];
        $updateParams = [];
        if (in_array('google_id', $cols, true) && !$u['google_id']) {
            $updates[] = 'google_id = ?';
            $updateParams[] = $googleId;
        }
        if (in_array('avatar_url', $cols, true) && $picture) {
            $updates[] = 'avatar_url = ?';
            $updateParams[] = $picture;
        }
        if ($updates) {
            $updateParams[] = $u['id'];
            $upd = db()->prepare('UPDATE admin_users SET ' . implode(', ', $updates) . ' WHERE id = ?');
            $upd->execute($updateParams);
        }
    }

    provision_app_user($email, $name, $picture, 'admin');
    return $u;
}

/**
 * Best-effort: ensure there is a row in `users` for this email, and a row in
 * `user_roles` with the given role. Adapts to whatever columns exist on those
 * tables (id/uuid, name/full_name/display_name, avatar_url/photo_url, etc.).
 * Errors are swallowed so a Google login never fails because of optional tables.
 */
function provision_app_user(string $email, string $name, string $picture, string $role = 'admin'): void {
    try {
        if (!table_exists('users')) return;
        $cols = table_columns('users');
        $pk   = pk_of('users');

        // Look up existing user by email.
        $userId = null;
        if (in_array('email', $cols, true)) {
            $s = db()->prepare("SELECT `$pk` FROM `users` WHERE email = ? LIMIT 1");
            $s->execute([$email]);
            $userId = $s->fetchColumn() ?: null;
        }

        if (!$userId) {
            // Build an INSERT using only columns that actually exist.
            $row = [];
            if (in_array('email', $cols, true))        $row['email'] = $email;
            foreach (['name', 'full_name', 'display_name', 'username'] as $c) {
                if (in_array($c, $cols, true)) { $row[$c] = $name ?: $email; break; }
            }
            foreach (['avatar_url', 'photo_url', 'picture', 'image_url'] as $c) {
                if (in_array($c, $cols, true)) { $row[$c] = $picture; break; }
            }
            if (in_array('provider', $cols, true))     $row['provider'] = 'google';
            if (in_array('is_active', $cols, true))    $row['is_active'] = 1;
            if (in_array('email_verified', $cols, true)) $row['email_verified'] = 1;

            // Generate a UUID if the PK looks like a uuid column with no default.
            if ($pk !== 'id' || (in_array('uuid', $cols, true) && !in_array('id', $cols, true))) {
                $row[$pk] = bin2hex(random_bytes(16));
            }

            if (!$row) return;
            $fields = array_keys($row);
            $place  = implode(',', array_fill(0, count($fields), '?'));
            $ins = db()->prepare("INSERT INTO `users` (`" . implode('`,`', $fields) . "`) VALUES ($place)");
            $ins->execute(array_values($row));
            $userId = isset($row[$pk]) ? $row[$pk] : db()->lastInsertId();
        }

        // Now ensure the role row exists in user_roles.
        if ($userId && table_exists('user_roles')) {
            $rcols = table_columns('user_roles');
            $uidCol = null;
            foreach (['user_id', 'userId', 'uid'] as $c) {
                if (in_array($c, $rcols, true)) { $uidCol = $c; break; }
            }
            $roleCol = in_array('role', $rcols, true) ? 'role'
                : (in_array('name', $rcols, true) ? 'name' : null);
            if ($uidCol && $roleCol) {
                $chk = db()->prepare("SELECT 1 FROM `user_roles` WHERE `$uidCol` = ? AND `$roleCol` = ? LIMIT 1");
                $chk->execute([$userId, $role]);
                if (!$chk->fetchColumn()) {
                    $rrow = [$uidCol => $userId, $roleCol => $role];
                    $rpk = pk_of('user_roles');
                    if ($rpk !== 'id' && !in_array($rpk, array_keys($rrow), true)) {
                        $rrow[$rpk] = bin2hex(random_bytes(16));
                    }
                    $fields = array_keys($rrow);
                    $place  = implode(',', array_fill(0, count($fields), '?'));
                    $ins = db()->prepare("INSERT INTO `user_roles` (`" . implode('`,`', $fields) . "`) VALUES ($place)");
                    $ins->execute(array_values($rrow));
                }
            }
        }
    } catch (Throwable $e) {
        // Best-effort: never block login because of provisioning.
        error_log('provision_app_user: ' . $e->getMessage());
    }
}

/**
 * Génère un slug unique pour une table donnée.
 * Si le slug existe déjà, ajoute un suffixe avec un numéro.
 */
function generate_unique_slug(string $table, string $slug, ?int $excludeId = null): string {
    if (!in_array('slug', table_columns($table), true)) {
        return $slug; // Table n'a pas de slug
    }
    
    $check = db()->prepare("SELECT 1 FROM `$table` WHERE slug = ?" . ($excludeId ? " AND id != ?" : "") . " LIMIT 1");
    $params = [$slug];
    if ($excludeId) $params[] = $excludeId;
    $check->execute($params);
    
    // Si le slug n'existe pas, le retourner tel quel
    if (!$check->fetchColumn()) {
        return $slug;
    }
    
    // Sinon, générer un slug unique avec un suffixe numérique
    $base = $slug;
    $counter = 1;
    while ($counter < 1000) {
        $newSlug = "$base-$counter";
        $check->execute(array_merge([$newSlug], $excludeId ? [$excludeId] : []));
        if (!$check->fetchColumn()) {
            return $newSlug;
        }
        $counter++;
    }
    
    // Fallback: utiliser un timestamp en dernier recours
    return "$base-" . time();
}



// ============ ROUTER ============
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
            ];
            try {
                ensure_admin_allowed_emails_table();
                if (table_exists('admin_allowed_emails')) {
                    $out['config']['allowed_emails_count'] = (int) db()->query(
                        'SELECT COUNT(*) FROM admin_allowed_emails'
                    )->fetchColumn();
                }
            } catch (Throwable $e) {
                // optional table
            }
            try {
                $tables = array_map(fn($r) => array_values($r)[0],
                    db()->query("SHOW TABLES")->fetchAll());
                $out['db'] = 'ok';
                $out['tables_found'] = $tables;
                $out['tables_expected'] = $ALLOWED_TABLES;
                $out['tables_missing'] = array_values(array_diff($ALLOWED_TABLES, $tables));
                $out['admin_users_table'] = in_array('admin_users', $tables, true);
                if ($out['admin_users_table']) {
                    $out['admin_users_count'] = (int) db()->query("SELECT COUNT(*) FROM admin_users")->fetchColumn();
                }
            } catch (Throwable $e) {
                $out['db'] = 'error';
                $out['db_error'] = $e->getMessage();
            }
            json_out($out);
        }

        case 'test_security_notification': {
            $email = trim($body['email'] ?? '');
            if (!$email) err('Email is required');
            
            $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
            $time = date('Y-m-d H:i:s');
            
            // Détecter le navigateur/OS
            $browser = 'Unknown';
            if (preg_match('/Chrome/i', $userAgent)) $browser = 'Chrome';
            elseif (preg_match('/Firefox/i', $userAgent)) $browser = 'Firefox';
            elseif (preg_match('/Safari/i', $userAgent)) $browser = 'Safari';
            elseif (preg_match('/Edge/i', $userAgent)) $browser = 'Edge';
            
            $os = 'Unknown';
            if (preg_match('/Windows/i', $userAgent)) $os = 'Windows';
            elseif (preg_match('/Mac/i', $userAgent)) $os = 'MacOS';
            elseif (preg_match('/Linux/i', $userAgent)) $os = 'Linux';
            elseif (preg_match('/Android/i', $userAgent)) $os = 'Android';
            elseif (preg_match('/iOS/i', $userAgent)) $os = 'iOS';
            
            $subject = 'Security Alert: New login to Ynuka Labs Admin Panel';
            
            $message = "
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #1a1a2e; color: white; padding: 20px; text-align: center; }
                    .content { background: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; }
                    .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 10px 0; }
                    .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h2>Security Alert</h2>
                    </div>
                    <div class='content'>
                        <p>Hello,</p>
                        <p>We detected a new login to your Ynuka Labs Admin Panel account.</p>
                        
                        <div class='info'>
                            <strong>Login Details:</strong><br>
                            Email: {$email}<br>
                            Method: TEST<br>
                            Time: {$time} UTC<br>
                            IP Address: {$ip}<br>
                            Browser: {$browser}<br>
                            Operating System: {$os}
                        </div>
                        
                        <div class='warning'>
                            <strong> Security Notice:</strong><br>
                            This is a test email. If you receive this, the email system is working correctly.
                        </div>
                        
                        <p>Best regards,<br>Ynuka Labs Security Team</p>
                    </div>
                    <div class='footer'>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            ";
            
            $headers = [
                'MIME-Version: 1.0',
                'Content-Type: text/html; charset=UTF-8',
                'From: ' . SECURITY_NOTIFICATION_FROM_NAME . ' <' . SECURITY_NOTIFICATION_FROM . '>',
                'Reply-To: ' . SECURITY_NOTIFICATION_FROM,
                'X-Mailer: PHP/' . phpversion()
            ];
            
            error_log("Test security notification attempt: email=$email, ip=$ip");
            $result = mail($email, $subject, $message, implode("\r\n", $headers));
            error_log("Test security notification result: " . ($result ? 'SUCCESS' : 'FAILED'));
            
            json_out([
                'success' => $result,
                'email' => $email,
                'message' => $result ? 'Email sent successfully' : 'Failed to send email',
                'php_mail_configured' => ini_get('sendmail_path') ? 'yes' : 'no',
                'smtp_configured' => ini_get('SMTP') ? ini_get('SMTP') : 'not configured'
            ]);
        }

        case 'login': {
            $email = trim($body['email'] ?? '');
            $pass  = $body['password'] ?? '';
            if (!$email || !$pass) err('Missing credentials');
            $stmt = db()->prepare('SELECT id, email, password_hash, name, avatar_url FROM admin_users WHERE email = ? LIMIT 1');
            $stmt->execute([$email]);
            $u = $stmt->fetch();
            if (!$u || !password_verify($pass, $u['password_hash'])) err('Invalid credentials', 401);
            
            // Send security notification
            send_security_notification($u['email'], 'Email/Password');
            
            $payload = [
                'sub' => $u['id'], 'email' => $u['email'], 'name' => $u['name'],
                'iat' => time(), 'exp' => time() + 60 * 60 * 24 * 7,
            ];
            if (!empty($u['avatar_url'])) {
                $payload['avatar_url'] = $u['avatar_url'];
            }
            $token = jwt_encode($payload);
            $response = ['id' => $u['id'], 'email' => $u['email'], 'name' => $u['name']];
            if (!empty($u['avatar_url'])) {
                $response['avatar_url'] = $u['avatar_url'];
            }
            json_out(['token' => $token, 'user' => $response]);
        }

        case 'register': {
            $email = normalize_email($body['email'] ?? '');
            $pass  = $body['password'] ?? '';
            $name  = trim($body['name'] ?? '');
            if (!$email || !$pass) err('Missing credentials');
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) err('Invalid email');
            if (strlen($pass) < 6) err('Password must be at least 6 characters');
            if (!table_exists('admin_users')) err('admin_users table missing — run setup.sql', 500);

            if (!can_register_email($email)) {
                err('Registration is closed. Contact an administrator or ask to be added to the allowlist.', 403);
            }

            $stmt = db()->prepare('SELECT id FROM admin_users WHERE email = ? LIMIT 1');
            $stmt->execute([$email]);
            if ($stmt->fetch()) err('User already registered', 409);

            $hash = password_hash($pass, PASSWORD_BCRYPT);
            $stmt = db()->prepare('INSERT INTO admin_users (email, password_hash, name) VALUES (?, ?, ?)');
            $stmt->execute([$email, $hash, $name !== '' ? $name : null]);
            $id = (int) db()->lastInsertId();
            $payload = [
                'sub' => $id, 'email' => $email, 'name' => $name,
                'iat' => time(), 'exp' => time() + 60 * 60 * 24 * 7,
            ];
            $token = jwt_encode($payload);
            $response = ['id' => $id, 'email' => $email, 'name' => $name];
            json_out(['token' => $token, 'user' => $response]);
        }

        // ---- GOOGLE OAUTH2 ----
        // Step 1: panel calls this to get the URL to redirect the browser to.
        case 'google_auth_url': {
            if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
                err('Google OAuth not configured on the server', 500);
            }
            $state = bin2hex(random_bytes(16));
            $_SESSION['oauth_state'] = $state;
            session_write_close();
            $params = http_build_query([
                'client_id'     => GOOGLE_CLIENT_ID,
                'redirect_uri'  => GOOGLE_REDIRECT_URI,
                'response_type' => 'code',
                'scope'         => 'openid email profile',
                'access_type'   => 'online',
                'prompt'        => 'select_account',
                'state'         => $state,
            ]);
            json_out(['url' => 'https://accounts.google.com/o/oauth2/v2/auth?' . $params, 'state' => $state]);
        }

        // Step 2: Google redirects the browser here with ?code=...
        // We exchange the code, look up the admin, then 302 back to the panel
        // with #token=... in the URL hash so the frontend can store it.
        case 'google_callback': {
            if (!empty($_GET['error'])) {
                $errCode = preg_replace('/[^a-z0-9_]/', '', strtolower($_GET['error'])) ?: 'access_denied';
                panel_login_redirect('error=' . $errCode);
            }

            $state = $_GET['state'] ?? '';
            $expected = $_SESSION['oauth_state'] ?? '';
            unset($_SESSION['oauth_state']);
            if (!$expected || !$state || !hash_equals($expected, $state)) {
                panel_login_redirect('error=invalid_state');
            }

            $code = $_GET['code'] ?? '';
            if (!$code) { panel_login_redirect('error=missing_code'); }

            $ch = curl_init('https://oauth2.googleapis.com/token');
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POSTFIELDS => http_build_query([
                    'code'          => $code,
                    'client_id'     => GOOGLE_CLIENT_ID,
                    'client_secret' => GOOGLE_CLIENT_SECRET,
                    'redirect_uri'  => GOOGLE_REDIRECT_URI,
                    'grant_type'    => 'authorization_code',
                ]),
                CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
            ]);
            $tokenResp = curl_exec($ch);
            $tokenHttp = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($tokenHttp !== 200) { panel_login_redirect('error=token_exchange_failed'); }
            $tokenData = json_decode($tokenResp, true) ?: [];
            $accessToken = $tokenData['access_token'] ?? '';
            if (!$accessToken) { panel_login_redirect('error=no_access_token'); }

            $ch = curl_init('https://www.googleapis.com/oauth2/v3/userinfo');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $accessToken],
            ]);
            $profile = json_decode(curl_exec($ch), true) ?: [];
            curl_close($ch);

            $googleId = $profile['sub']            ?? '';
            $email    = strtolower($profile['email'] ?? '');
            $name     = $profile['name']           ?? '';
            $picture  = $profile['picture']        ?? '';
            $verified = $profile['email_verified'] ?? false;
            if (!$googleId || !$email || !$verified) {
                panel_login_redirect('error=invalid_profile');
            }

            // Check if user exists - dynamic WHERE clause based on columns that exist
            $cols = table_columns('admin_users');
            $whereConditions = ['email = ?'];
            $whereParams = [$email];
            if (in_array('google_id', $cols, true)) {
                $whereConditions[] = 'google_id = ?';
                $whereParams[] = $googleId;
            }
            $where = implode(' OR ', $whereConditions);
            
            $stmt = db()->prepare("SELECT id FROM admin_users WHERE $where LIMIT 1");
            $stmt->execute($whereParams);
            if (!$stmt->fetch() && !can_google_auto_provision($email)) {
                panel_login_redirect('error=not_authorized');
            }
            $u = upsert_admin_from_google($googleId, $email, $name, $picture);

            // Send security notification
            send_security_notification($u['email'], 'Google OAuth');

            $payload = [
                'sub'     => $u['id'],
                'email'   => $u['email'],
                'name'    => $u['name'] ?: $name,
                'iat' => time(), 'exp' => time() + 60 * 60 * 24 * 7,
            ];
            if (!empty($u['avatar_url'])) {
                $payload['avatar_url'] = $u['avatar_url'];
            }
            $token = jwt_encode($payload);
            panel_login_redirect('token=' . urlencode($token));
        }



        case 'me': {
            $u = require_auth();
            json_out(['user' => $u]);
        }

        // ---- GOOGLE OAUTH VERIFY (for public site compatibility) ----
        case 'google_oauth_verify': {
            if (!isset($body['id_token'])) {
                err('Missing id_token from Google', 400);
            }

            try {
                $googleUser = verify_google_id_token($body['id_token']);
                if (!$googleUser) {
                    err('Invalid or expired Google token', 401);
                }

                $email = normalize_email($googleUser['email']);

                if (!is_email_allowed($email)) {
                    err('Email not authorized for admin access', 403);
                }

                $stmt = db()->prepare('SELECT id, name, email FROM admin_users WHERE email = ?');
                $stmt->execute([$email]);
                $user = $stmt->fetch();

                if ($user) {
                    if ($googleUser['name'] !== $user['name']) {
                        $stmt = db()->prepare('UPDATE admin_users SET name = ? WHERE email = ?');
                        $stmt->execute([$googleUser['name'], $email]);
                    }
                } else {
                    $stmt = db()->prepare('INSERT INTO admin_users (email, name, password_hash, created_at) VALUES (?, ?, ?, NOW())');
                    $stmt->execute([$email, $googleUser['name'], password_hash('oauth_' . time(), PASSWORD_BCRYPT)]);
                    $user = [
                        'id' => db()->lastInsertId(),
                        'email' => $email,
                        'name' => $googleUser['name']
                    ];
                }

                $token = jwt_encode([
                    'user_id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'exp' => time() + 86400 * 7
                ]);

                json_out([
                    'token' => $token,
                    'user' => [
                        'id' => $user['id'],
                        'email' => $user['email'],
                        'name' => $user['name']
                    ]
                ]);
            } catch (Exception $e) {
                err('Failed to process Google authentication: ' . $e->getMessage(), 500);
            }
        }

        // ---- GOOGLE OAUTH LOGIN (simple variant for public site compatibility) ----
        case 'google_oauth_login': {
            if (!isset($body['email']) || !isset($body['name'])) {
                err('Missing email or name from Google', 400);
            }

            $email = normalize_email($body['email']);

            if (!is_email_allowed($email)) {
                err('Email not authorized for admin access', 403);
            }

            try {
                $stmt = db()->prepare('SELECT id, name, email FROM admin_users WHERE email = ?');
                $stmt->execute([$email]);
                $user = $stmt->fetch();

                if ($user) {
                    if ($body['name'] !== $user['name']) {
                        $stmt = db()->prepare('UPDATE admin_users SET name = ? WHERE email = ?');
                        $stmt->execute([$body['name'], $email]);
                    }
                } else {
                    $stmt = db()->prepare('INSERT INTO admin_users (email, name, password_hash, created_at) VALUES (?, ?, ?, NOW())');
                    $stmt->execute([$email, $body['name'], password_hash('oauth_' . time(), PASSWORD_BCRYPT)]);
                    $user = [
                        'id' => db()->lastInsertId(),
                        'email' => $email,
                        'name' => $body['name']
                    ];
                }

                $token = jwt_encode([
                    'user_id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'exp' => time() + 86400 * 7
                ]);

                json_out([
                    'token' => $token,
                    'user' => [
                        'id' => $user['id'],
                        'email' => $user['email'],
                        'name' => $user['name']
                    ]
                ]);
            } catch (Exception $e) {
                err('Failed to process Google authentication: ' . $e->getMessage(), 500);
            }
        }

        // ---- Allowlist (emails autorisés à s'inscrire si ALLOW_REGISTRATION=false) ----
        case 'allowed_emails_list': {
            require_auth();
            ensure_admin_allowed_emails_table();
            $rows = db()->query('SELECT id, email, note, created_at FROM admin_allowed_emails ORDER BY email')->fetchAll();
            json_out(['rows' => $rows]);
        }

        case 'allowed_emails_add': {
            require_auth();
            $email = normalize_email($body['email'] ?? '');
            $note  = trim($body['note'] ?? '');
            if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                err('Invalid email');
            }
            ensure_admin_allowed_emails_table();
            $stmt = db()->prepare('INSERT INTO admin_allowed_emails (email, note) VALUES (?, ?) ON DUPLICATE KEY UPDATE note = VALUES(note)');
            $stmt->execute([$email, $note !== '' ? $note : null]);
            json_out(['ok' => true, 'email' => $email]);
        }

        case 'allowed_emails_remove': {
            require_auth();
            $email = normalize_email($body['email'] ?? $_GET['email'] ?? '');
            if (!$email) {
                err('Missing email');
            }
            ensure_admin_allowed_emails_table();
            $stmt = db()->prepare('DELETE FROM admin_allowed_emails WHERE email = ?');
            $stmt->execute([$email]);
            json_out(['ok' => true, 'deleted' => $stmt->rowCount()]);
        }

        case 'list': {
            // Public tables that don't require authentication
            $publicTables = ['events', 'team_members', 'projects', 'blog_posts', 'gallery_images', 'gallery_events', 'resource_items', 'resource_sections', 'contact_messages', 'newsletter_subscribers', 'blog_comments', 'event_registrations', 'opportunities'];
            if (!in_array($resource, $publicTables, true)) {
                require_auth();
            }
            if (!in_array($resource, $ALLOWED_TABLES, true)) err('Unknown resource');
            $cols  = table_columns($resource);
            $page  = max(1, (int)($_GET['page']  ?? 1));
            $limit = min(200, max(1, (int)($_GET['limit'] ?? 25)));
            $off   = ($page - 1) * $limit;
            $search = trim($_GET['search'] ?? '');
            $filter = trim($_GET['filter'] ?? '');
            $where = ''; $params = [];
            
            // Handle filter parameter (e.g., "event_id=3")
            if ($filter !== '') {
                $filterParts = explode('=', $filter, 2);
                if (count($filterParts) === 2) {
                    $filterCol = trim($filterParts[0]);
                    $filterVal = trim($filterParts[1]);
                    if (in_array($filterCol, $cols)) {
                        $where = ' WHERE `' . $filterCol . '` = ?';
                        $params[] = $filterVal;
                    }
                }
            }
            
            if ($search !== '') {
                $likeCols = array_filter($cols, fn($c) => !in_array($c, ['id', 'created_at', 'updated_at']));
                if ($likeCols) {
                    $parts = [];
                    foreach ($likeCols as $c) { $parts[] = "`$c` LIKE ?"; $params[] = '%' . $search . '%'; }
                    $where = ($where === '' ? ' WHERE ' : ' AND ') . implode(' OR ', $parts);
                }
            }
            $totalStmt = db()->prepare("SELECT COUNT(*) c FROM `$resource`$where");
            $totalStmt->execute($params);
            $total = (int)$totalStmt->fetchColumn();
            $orderCol = in_array('created_at', $cols) ? 'created_at' : pk_of($resource);
            $stmt = db()->prepare("SELECT * FROM `$resource`$where ORDER BY `$orderCol` DESC LIMIT $limit OFFSET $off");
            $stmt->execute($params);
            json_out(['rows' => $stmt->fetchAll(), 'total' => $total, 'columns' => $cols]);
        }

        case 'get': {
            // Public tables that don't require authentication
            $publicTables = ['events', 'team_members', 'projects', 'blog_posts', 'gallery_images', 'gallery_events', 'resource_items', 'resource_sections', 'opportunities'];
            if (!in_array($resource, $publicTables, true)) {
                require_auth();
            }
            if (!in_array($resource, $ALLOWED_TABLES, true)) err('Unknown resource');
            $pk = pk_of($resource);
            $stmt = db()->prepare("SELECT * FROM `$resource` WHERE `$pk` = ? LIMIT 1");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) err('Not found', 404);
            json_out(['row' => $row, 'columns' => table_columns($resource)]);
        }

        case 'create':
        case 'insert': {
            // Public tables that don't require authentication
            $publicTables = ['contact_messages', 'newsletter_subscribers', 'event_registrations', 'donations', 'blog_comments', 'opportunity_applications', 'opportunity_motivation_forms'];
            if (!in_array($resource, $publicTables, true)) {
                require_auth();
            }
            if (!in_array($resource, $ALLOWED_TABLES, true)) err('Unknown resource');
            $cols = table_columns($resource);
            $pk = pk_of($resource);
            
            // Merge body and GET parameters for compatibility
            $requestData = array_merge($body, $_GET);
            
            $data = array_intersect_key($requestData, array_flip($cols));
            unset($data[$pk]);
            unset($data['action']); // Remove action from data
            unset($data['resource']); // Remove resource from data
            
            if (isset($data['password']) && in_array('password_hash', $cols, true)) {
                $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
                unset($data['password']);
            }
            if (!$data) err('No data');
            
            // Check for duplicate email in event_registrations
            if ($resource === 'event_registrations' && isset($data['event_id']) && isset($data['email'])) {
                $checkStmt = db()->prepare("SELECT id FROM `event_registrations` WHERE `event_id` = ? AND `email` = ? LIMIT 1");
                $checkStmt->execute([$data['event_id'], $data['email']]);
                if ($checkStmt->fetch()) {
                    err('This email is already registered for this event', 409);
                }
            }
            
            // Check for duplicate application in opportunity_applications
            if ($resource === 'opportunity_applications' && isset($data['opportunity_id']) && isset($data['user_email'])) {
                $checkStmt = db()->prepare("SELECT id FROM `opportunity_applications` WHERE `opportunity_id` = ? AND `user_email` = ? LIMIT 1");
                $checkStmt->execute([$data['opportunity_id'], $data['user_email']]);
                if ($checkStmt->fetch()) {
                    err('You have already applied for this opportunity', 409);
                }
            }
            
            // Check for duplicate motivation form in opportunity_motivation_forms
            if ($resource === 'opportunity_motivation_forms' && isset($data['opportunity_id']) && isset($data['user_email'])) {
                $checkStmt = db()->prepare("SELECT id FROM `opportunity_motivation_forms` WHERE `opportunity_id` = ? AND `user_email` = ? LIMIT 1");
                $checkStmt->execute([$data['opportunity_id'], $data['user_email']]);
                if ($checkStmt->fetch()) {
                    err('You have already submitted a motivation form for this opportunity', 409);
                }
            }
            
            // Générer un slug unique si la table a un champ slug
            if (isset($data['slug']) && in_array('slug', $cols, true)) {
                $data['slug'] = generate_unique_slug($resource, $data['slug']);
            }
            
            $fields = array_keys($data);
            $place  = implode(',', array_fill(0, count($fields), '?'));
            $stmt = db()->prepare("INSERT INTO `$resource` (`" . implode('`,`', $fields) . "`) VALUES ($place)");
            $stmt->execute(array_values($data));
            $insertId = db()->lastInsertId();

            // Return Strapi-like response format for compatibility
            json_out([
                'data' => array_merge($data, ['id' => $insertId ?: null]),
                'success' => true,
                'id' => $insertId ?: null,
                'message' => 'Created successfully'
            ], 201);
        }

        case 'update': {
            require_auth();
            if (!in_array($resource, $ALLOWED_TABLES, true)) err('Unknown resource');
            $cols = table_columns($resource);
            $pk = pk_of($resource);
            $data = array_intersect_key($body, array_flip($cols));
            unset($data[$pk]);
            if (isset($data['password']) && in_array('password_hash', $cols, true)) {
                if ($data['password'] !== '') {
                    $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
                }
                unset($data['password']);
            }
            if (!$data) err('No data');
            
            // Générer un slug unique si la table a un champ slug et qu'on le modifie
            if (isset($data['slug']) && in_array('slug', $cols, true)) {
                $data['slug'] = generate_unique_slug($resource, $data['slug'], (int)$id);
            }
            
            $set = implode(',', array_map(fn($c) => "`$c` = ?", array_keys($data)));
            $stmt = db()->prepare("UPDATE `$resource` SET $set WHERE `$pk` = ?");
            $stmt->execute([...array_values($data), $id]);
            json_out(['ok' => true]);
        }

        case 'increment': {
            // Public endpoint for incrementing counters (views, likes)
            $allowedResources = ['blog_posts'];
            $allowedFields = ['views', 'likes'];
            
            if (!in_array($resource, $allowedResources, true)) err('Resource not allowed for increment');
            if (!in_array($resource, $ALLOWED_TABLES, true)) err('Unknown resource');
            
            $field = $body['field'] ?? null;
            if (!$field || !in_array($field, $allowedFields, true)) err('Invalid field for increment');
            
            $cols = table_columns($resource);
            if (!in_array($field, $cols, true)) err('Field does not exist in resource');
            
            $pk = pk_of($resource);
            if (!$id) err('ID is required');
            
            $stmt = db()->prepare("UPDATE `$resource` SET `$field` = `$field` + 1 WHERE `$pk` = ?");
            $stmt->execute([$id]);
            
            json_out(['ok' => true, 'incremented' => $field]);
        }

        case 'delete': {
            require_auth();
            if (!in_array($resource, $ALLOWED_TABLES, true)) err('Unknown resource');
            $pk = pk_of($resource);
            $stmt = db()->prepare("DELETE FROM `$resource` WHERE `$pk` = ?");
            $stmt->execute([$id]);
            json_out(['ok' => true]);
        }

        case 'upload_image': {
            require_auth();
            
            try {
                // Vérifier qu'un fichier a été envoyé
                if (!isset($_FILES['file'])) {
                    err('Aucun fichier fourni', 400);
                }
                
                $file = $_FILES['file'];
                
                // Vérifier les erreurs d'upload
                if ($file['error'] !== UPLOAD_ERR_OK) {
                    $uploadErrors = [
                        UPLOAD_ERR_INI_SIZE => 'Fichier trop volumineux (dépassement de upload_max_filesize)',
                        UPLOAD_ERR_FORM_SIZE => 'Fichier trop volumineux (dépassement de MAX_FILE_SIZE)',
                        UPLOAD_ERR_PARTIAL => 'Fichier partiellement uploadé',
                        UPLOAD_ERR_NO_FILE => 'Aucun fichier uploadé',
                        UPLOAD_ERR_NO_TMP_DIR => 'Répertoire temporaire manquant',
                        UPLOAD_ERR_CANT_WRITE => 'Impossible d\'écrire sur le disque',
                        UPLOAD_ERR_EXTENSION => 'Upload interrompu par extension PHP',
                    ];
                    $msg = $uploadErrors[$file['error']] ?? 'Erreur d\'upload inconnue';
                    err($msg, 400);
                }
                
                // Vérifier le type MIME (plusieurs méthodes de fallback)
                $mimeType = 'application/octet-stream';
                
                // Méthode 1: finfo si disponible
                if (function_exists('finfo_file')) {
                    $finfo = @finfo_open(FILEINFO_MIME_TYPE);
                    if ($finfo) {
                        $detectedType = finfo_file($finfo, $file['tmp_name']);
                        if ($detectedType) {
                            $mimeType = $detectedType;
                        }
                        finfo_close($finfo);
                    }
                }
                
                // Méthode 2: extension du fichier si finfo ne marche pas
                if ($mimeType === 'application/octet-stream') {
                    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                    $extMimes = [
                        'jpg' => 'image/jpeg',
                        'jpeg' => 'image/jpeg',
                        'png' => 'image/png',
                        'gif' => 'image/gif',
                        'webp' => 'image/webp',
                        'svg' => 'image/svg+xml',
                    ];
                    $mimeType = $extMimes[$ext] ?? 'application/octet-stream';
                }
                
                // Vérifier que c'est bien une image
                $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
                if (!in_array($mimeType, $allowedMimes, true)) {
                    err('Type de fichier non autorisé. Utilisez JPEG, PNG, GIF, WebP ou SVG (détecté: ' . $mimeType . ')', 400);
                }
                
                // Vérifier la taille (max 10 MB)
                $maxSize = 10 * 1024 * 1024;
                if ($file['size'] > $maxSize) {
                    err('Le fichier ne doit pas dépasser 10 MB', 400);
                }
                
                // Créer le répertoire d'upload s'il n'existe pas
                $uploadDir = __DIR__ . '/../uploads/gallery/';
                if (!is_dir($uploadDir)) {
                    if (!@mkdir($uploadDir, 0755, true)) {
                        err('Impossible de créer le répertoire d\'upload: ' . $uploadDir, 500);
                    }
                }
                
                // Vérifier que le répertoire est accessible en écriture
                if (!is_writable($uploadDir)) {
                    err('Le répertoire d\'upload n\'est pas accessible en écriture', 500);
                }
                
                // Générer un nom de fichier unique et sûr
                $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
                $filename = bin2hex(random_bytes(16)) . '.' . $ext;
                $filepath = $uploadDir . $filename;
                
                // Déplacer le fichier
                if (!@move_uploaded_file($file['tmp_name'], $filepath)) {
                    err('Erreur lors de la sauvegarde du fichier sur le serveur', 500);
                }
                
                // Définir les permissions correctes
                @chmod($filepath, 0644);
                
                // Retourner l'URL du fichier
                // Construire l'URL de base selon le serveur
                $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
                $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
                $basePath = dirname($_SERVER['SCRIPT_NAME']) ?? '/';
                
                $url = $protocol . $host . rtrim($basePath, '/') . '/../uploads/gallery/' . $filename;
                
                json_out(['ok' => true, 'url' => $url, 'filename' => $filename]);
            } catch (Throwable $e) {
                // Capturer toute erreur et retourner du JSON
                err('Erreur serveur: ' . $e->getMessage(), 500);
            }
        }

        // ---- NEWSLETTER SUBSCRIPTION (public, no auth) ----
        case 'subscribe_newsletter': {
            $name = trim($body['name'] ?? '');
            $email = trim($body['email'] ?? '');

            // Validate email
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                err('Invalid email address', 400);
            }

            // Check if email already exists
            $stmt = db()->prepare("SELECT id FROM newsletter_subscribers WHERE email = ?");
            $stmt->execute([$email]);
            
            if ($stmt->fetch()) {
                err('Email already subscribed', 409);
            }

            // Insert new subscriber
            $stmt = db()->prepare("INSERT INTO newsletter_subscribers (name, email, active, subscribed_at) VALUES (?, ?, 1, NOW())");
            $stmt->execute([$name, $email]);

            // Send welcome email
            $emailSent = sendNewsletterWelcomeEmail($name, $email);

            if ($emailSent) {
                json_out(['success' => true, 'message' => 'Subscription successful']);
            } else {
                // Subscription succeeded but email failed - still return success
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

            // Validate required fields
            if (empty($name) || empty($email) || empty($subject) || empty($message)) {
                err('Missing required fields', 400);
            }

            // Validate email
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                err('Invalid email address', 400);
            }

            // Insert contact message
            $stmt = db()->prepare("INSERT INTO contact_messages (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$name, $email, $phone, $subject, $message]);

            // Send confirmation email
            $emailSent = sendContactConfirmationEmail($name, $email, $subject);

            if ($emailSent) {
                json_out(['success' => true, 'message' => 'Message sent successfully']);
            } else {
                // Message saved but email failed - still return success
                json_out(['success' => true, 'message' => 'Message sent successfully (email delivery pending)']);
            }
        }

        // ---- NEWSLETTER SUBSCRIPTION (public, no auth) ----
        case 'subscribe_newsletter': {
            $name = trim($body['name'] ?? '');
            $email = trim($body['email'] ?? '');

            // Validate email
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                err('Invalid email address', 400);
            }

            // Check if email already exists
            $stmt = db()->prepare("SELECT id FROM newsletter_subscribers WHERE email = ?");
            $stmt->execute([$email]);
            
            if ($stmt->fetch()) {
                err('Email already subscribed', 409);
            }

            // Insert new subscriber
            $stmt = db()->prepare("INSERT INTO newsletter_subscribers (name, email, active, subscribed_at) VALUES (?, ?, 1, NOW())");
            $stmt->execute([$name, $email]);

            // Send welcome email
            $emailSent = sendNewsletterWelcomeEmail($name, $email);

            if ($emailSent) {
                json_out(['success' => true, 'message' => 'Subscription successful']);
            } else {
                // Subscription succeeded but email failed - still return success
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

            // Validate required fields
            if (empty($name) || empty($email) || empty($subject) || empty($message)) {
                err('Missing required fields', 400);
            }

            // Validate email
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                err('Invalid email address', 400);
            }

            // Insert contact message
            $stmt = db()->prepare("INSERT INTO contact_messages (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$name, $email, $phone, $subject, $message]);

            // Send confirmation email
            $emailSent = sendContactConfirmationEmail($name, $email, $subject);

            if ($emailSent) {
                json_out(['success' => true, 'message' => 'Message sent successfully']);
            } else {
                // Message saved but email failed - still return success
                json_out(['success' => true, 'message' => 'Message sent successfully (email delivery pending)']);
            }
        }

        default:
            err('Unknown action. Try ?action=ping');
    }
} catch (Throwable $e) {
    err($e->getMessage(), 500);
}
