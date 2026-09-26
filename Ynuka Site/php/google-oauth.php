<?php
/**
 * Ynuka Labs - Google OAuth 2.0 Configuration & Handlers
 * 
 * Ce fichier gère l'authentification Google OAuth 2.0 pour le panel administrateur
 * 
 * Configuration Google Cloud:
 * - Projet: ynukalabs-497722
 * - Client ID: 1039734035041-3ob85lpfheoonvv43759desitdr7rhgc.apps.googleusercontent.com
 * - Redirect URIs configurées:
 *   - https://admin.ynukalabs.com/api/api.php?action=google_callback
 *   - https://ynukalabs-497722.firebaseapp.com/__/auth/handler
 * 
 * Documentation: https://developers.google.com/identity/protocols/oauth2
 */

// ============ CONFIGURATION GOOGLE OAUTH ============
// Le client ID est public; le secret reste uniquement dans l'environnement serveur.
define('GOOGLE_CLIENT_ID', getenv('GOOGLE_CLIENT_ID') ?: '1039734035041-3ob85lpfheoonvv43759desitdr7rhgc.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: '');
define('GOOGLE_PROJECT_ID', getenv('GOOGLE_PROJECT_ID') ?: 'ynukalabs-497722');

// Redirect URI - doit correspondre à celui configuré dans Google Console
define('GOOGLE_REDIRECT_URI', getenv('GOOGLE_REDIRECT_URI') ?: 'https://admin.ynukalabs.com/api/api.php?action=google_callback');

// Public Google Client Library pour vérifier les ID tokens
// À installer via Composer: composer require google/auth
define('GOOGLE_CERTS_URL', 'https://www.googleapis.com/oauth2/v1/certs');


// ============ FONCTIONS D'AIDE ============

/**
 * Génère l'URL d'authentification Google OAuth
 * @return string URL d'authentification Google
 */
function get_google_auth_url() {
    $state = bin2hex(random_bytes(16));
    
    // Stockage sécurisé du state pour éviter les attaques CSRF
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION['oauth_state'] = $state;
    $_SESSION['oauth_state_time'] = time();
    
    $params = [
        'client_id' => GOOGLE_CLIENT_ID,
        'redirect_uri' => GOOGLE_REDIRECT_URI,
        'response_type' => 'code',
        'scope' => 'openid email profile',
        'state' => $state,
        'access_type' => 'online',
        'prompt' => 'select_account',  // Permet de choisir le compte Google
    ];
    
    return 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
}

/**
 * Échange un code d'autorisation Google contre un token d'accès
 * @param string $code Code d'autorisation de Google
 * @return array Token d'accès et informations
 */
function exchange_google_code_for_token($code) {
    if (GOOGLE_CLIENT_SECRET === '') {
        throw new Exception('Google OAuth server secret is not configured');
    }

    $params = [
        'client_id' => GOOGLE_CLIENT_ID,
        'client_secret' => GOOGLE_CLIENT_SECRET,
        'redirect_uri' => GOOGLE_REDIRECT_URI,
        'grant_type' => 'authorization_code',
        'code' => $code,
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('Erreur lors de l\'échange du code: ' . ($curlError ?: 'HTTP ' . $httpCode));
    }
    
    $data = json_decode($response, true);
    if (!$data || !isset($data['id_token'])) {
        throw new Exception('Réponse invalide de Google OAuth');
    }
    
    return $data;
}

/**
 * Vérifie et décode un ID Token Google
 * @param string $id_token ID Token de Google
 * @return array Informations utilisateur extraites du token
 */
function verify_google_id_token($id_token) {
    // Décomposer le JWT en 3 parties
    $parts = explode('.', $id_token);
    if (count($parts) !== 3) {
        throw new Exception('Format de token invalide');
    }
    
    list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;
    
    // Décoder le payload (2e partie)
    $payload = json_decode(
        base64_decode(strtr($payloadEncoded, '-_', '+/')),
        true
    );
    
    if (!$payload) {
        throw new Exception('Impossible de décoder le payload du token');
    }
    
    // Vérifier les champs obligatoires
    if (!isset($payload['email']) || !isset($payload['aud'])) {
        throw new Exception('Token invalide: champs requis manquants');
    }
    
    // Vérifier que le token est destiné à notre application
    if ($payload['aud'] !== GOOGLE_CLIENT_ID) {
        throw new Exception('Token destiné à une autre application');
    }
    
    // Vérifier que le token n'a pas expiré
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        throw new Exception('Token expiré');
    }
    
    // Vérifier que l'e-mail est vérifié
    if (!($payload['email_verified'] ?? false)) {
        throw new Exception('E-mail non vérifié auprès de Google');
    }
    
    // Retourner les informations de l'utilisateur
    return [
        'email' => strtolower(trim($payload['email'])),
        'name' => $payload['name'] ?? $payload['email'],
        'picture' => $payload['picture'] ?? null,
        'email_verified' => $payload['email_verified'] ?? false,
        'sub' => $payload['sub'] ?? null,  // Google User ID unique
    ];
}

/**
 * Obtient les informations utilisateur à partir d'un token d'accès Google
 * @param string $access_token Token d'accès OAuth
 * @return array Informations utilisateur
 */
function get_google_user_from_token($access_token) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://www.googleapis.com/oauth2/v2/userinfo');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $access_token,
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('Impossible de récupérer les informations utilisateur');
    }
    
    $data = json_decode($response, true);
    if (!$data || !isset($data['email'])) {
        throw new Exception('Données utilisateur invalides');
    }
    
    return [
        'email' => strtolower(trim($data['email'])),
        'name' => $data['name'] ?? $data['email'],
        'picture' => $data['picture'] ?? null,
        'email_verified' => $data['verified_email'] ?? false,
    ];
}

/**
 * Traite le callback Google OAuth
 * Appelé par Google après que l'utilisateur se soit connecté
 * @return array Résultat du traitement [
 *   'success' => bool,
 *   'redirectTo' => string|null (chemin de redirection),
 *   'oauthError' => string|null (message d'erreur)
 * ]
 */
function handle_google_oauth_callback() {
    // Vérifier le state pour éviter les attaques CSRF
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    $state = $_GET['state'] ?? null;
    $code = $_GET['code'] ?? null;
    $error = $_GET['error'] ?? null;
    
    // Gestion des erreurs de Google
    if ($error) {
        $errorDescription = $_GET['error_description'] ?? 'Erreur inconnue';
        return [
            'success' => false,
            'redirectTo' => null,
            'oauthError' => "Google: $error - $errorDescription"
        ];
    }
    
    // Vérifier le state
    $sessionState = $_SESSION['oauth_state'] ?? null;
    if (!$state || $state !== $sessionState) {
        return [
            'success' => false,
            'redirectTo' => null,
            'oauthError' => 'State invalide: attaque CSRF détectée'
        ];
    }
    
    // Vérifier que le state n'est pas trop ancien (< 10 minutes)
    $stateTime = $_SESSION['oauth_state_time'] ?? 0;
    if (time() - $stateTime > 600) {
        return [
            'success' => false,
            'redirectTo' => null,
            'oauthError' => 'State expiré: veuillez réessayer'
        ];
    }
    
    // Nettoyer le state
    unset($_SESSION['oauth_state']);
    unset($_SESSION['oauth_state_time']);
    
    try {
        // Pas de code fourni par Google
        if (!$code) {
            throw new Exception('Aucun code d\'autorisation fourni par Google');
        }
        
        // Échanger le code contre un token
        $tokenData = exchange_google_code_for_token($code);
        
        // Vérifier et décoder le ID token
        $googleUser = verify_google_id_token($tokenData['id_token']);
        
        return [
            'success' => true,
            'user' => $googleUser,
            'tokenData' => $tokenData,
            'oauthError' => null
        ];
    } catch (Exception $e) {
        error_log('Google OAuth Error: ' . $e->getMessage());
        return [
            'success' => false,
            'redirectTo' => null,
            'oauthError' => 'Erreur d\'authentification: ' . $e->getMessage()
        ];
    }
}

?>
