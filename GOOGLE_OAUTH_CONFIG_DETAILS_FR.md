# Configuration Détaillée - Google OAuth Ynuka Labs

## 📁 Fichiers de configuration

### 1. `google-oauth.php`

**Chemin:** `Ynuka Site/php/google-oauth.php`

**Contenu de configuration:**

```php
<?php
// ============ CONFIGURATION GOOGLE OAUTH ============
// Credentials depuis Google Cloud Console
define('GOOGLE_CLIENT_ID', '1039734035041-3ob85lpfheoonvv43759desitdr7rhgc.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', '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');
define('GOOGLE_PROJECT_ID', 'ynukalabs-497722');

// Redirect URI - doit correspondre à celui configuré dans Google Console
define('GOOGLE_REDIRECT_URI', 'https://admin.ynukalabs.com/api/api.php?action=google_callback');
?>
```

**⚠️ IMPORTANT:**
- Ne pas modifier ces valeurs sauf si vous changez de projet Google
- Ces credentials doivent correspondre exactement à Google Cloud Console
- Le REDIRECT_URI doit être HTTPS en production

---

### 2. `api.php` - Liste blanche des emails

**Chemin:** `Ynuka Site/php/api.php`

**Localisation:** Lignes 92-98

```php
// ============ ALLOWED ADMIN EMAILS (WHITELIST) ============
// Only these emails can authenticate via Google OAuth to the admin panel
$allowed_admin_emails = [
    'jacquesmasuruku2@gmail.com',
    'balumeboaz@gmail.com',
    'martinmusagara@gmail.com',
    'mwatsimulamoolivier@gmail.com',
];
```

**Fonction qui utilise cette liste (ligne 101-104):**

```php
function is_email_allowed($email) {
    global $allowed_admin_emails;
    return in_array(strtolower(trim($email)), array_map('strtolower', $allowed_admin_emails), true);
}
```

**Actions qui utilisent cette fonction:**
- `google_oauth_verify` (ligne 139)
- `google_oauth_login` (ligne 180)

---

### 3. Frontend Configuration

**Chemin:** `Panel Admin/src/main-spa.tsx`

```tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = '1039734035041-3ob85lpfheoonvv43759desitdr7rhgc.apps.googleusercontent.com';

ReactDOM.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    {/* App ici */}
  </GoogleOAuthProvider>,
  document.getElementById('root')
);
```

**Client ID:** Doit correspondre à `GOOGLE_CLIENT_ID` dans `google-oauth.php`

---

### 4. Base de données

**Table required:** `admin_users`

```sql
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    picture_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index pour les recherches rapides
CREATE INDEX idx_email ON admin_users(email);
CREATE INDEX idx_google_id ON admin_users(google_id);
```

---

## 🔄 Actions API disponibles

### Action: `google_auth_url`

**Endpoint:**
```
GET https://admin.ynukalabs.com/api/api.php?action=google_auth_url
```

**Réponse:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&response_type=id_token&scope=openid+email+profile&state=abc123..."
}
```

**Utilisation dans le frontend:**
```typescript
const response = await fetch(`${API_BASE}?action=google_auth_url`);
const { url } = await response.json();
window.location.href = url;  // Redirection vers Google
```

---

### Action: `google_oauth_verify`

**Endpoint:**
```
POST https://admin.ynukalabs.com/api/api.php?action=google_oauth_verify
```

**Body:**
```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."
}
```

**Réponse (succès):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "jacquesmasuruku2@gmail.com",
    "name": "Jacques Masuruku"
  }
}
```

**Réponse (erreur - email non autorisé):**
```json
{
  "error": "Email not authorized for admin access"
}
```

**Étapes du traitement:**
1. Décoder le JWT Google reçu
2. Vérifier la signature et l'expiration
3. Extraire l'email
4. **Vérifier si l'email est dans la whitelist**
5. Si OK: créer ou mettre à jour l'utilisateur en BD
6. Générer un JWT interne (7 jours d'expiration)
7. Retourner le JWT et les infos utilisateur

---

### Action: `google_oauth_login`

**Endpoint:**
```
POST https://admin.ynukalabs.com/api/api.php?action=google_oauth_login
```

**Body:**
```json
{
  "email": "jacquesmasuruku2@gmail.com",
  "name": "Jacques Masuruku"
}
```

**Réponse (succès):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "jacquesmasuruku2@gmail.com",
    "name": "Jacques Masuruku"
  }
}
```

**Utilisation:** Alternative à `google_oauth_verify` si vous avez déjà validé l'email côté frontend

---

## 🔐 Sécurité

### Protection CSRF

La protection CSRF est implémentée avec un `state` :

```php
$state = bin2hex(random_bytes(16));
$_SESSION['oauth_state'] = $state;
$_SESSION['oauth_state_time'] = time();

// Plus tard, lors du callback:
if ($state !== $_SESSION['oauth_state']) {
    // Rejet de la requête
}

// Vérifier que le state n'est pas trop ancien (10 minutes)
if (time() - $_SESSION['oauth_state_time'] > 600) {
    // Rejet de la requête
}
```

### Vérification du token

Le token JWT Google est vérifié:
- ✅ Signature valide
- ✅ Audience correspond au client ID
- ✅ Email vérifié auprès de Google
- ✅ Token pas expiré
- ✅ Email dans la whitelist

### JWT interne (Backend)

Le JWT interne généré par le backend:
- **Algorithme:** HS256
- **Secret:** À définir (actuellement: 'CHANGE_ME_TO_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARS')
- **Expiration:** 7 jours
- **Contenu:** `user_id`, `email`, `name`

**À mettre à jour:** Ligne 56 dans `api.php`
```php
function jwt_secret() {
    return 'CHANGE_ME_TO_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARS';
}
```

---

## 📊 Flux de données

### Inscription première connexion

```
Google User (email autorisé)
        ↓
  Clique sur "Google Sign In"
        ↓
  Frontend appelle: google_auth_url
        ↓
  Redirection vers Google
        ↓
  Utilisateur se connecte à Google
        ↓
  Google génère un ID token
        ↓
  Redirection vers: https://admin.ynukalabs.com/login#token=...
        ↓
  Frontend parse le hash
        ↓
  Appelle: google_oauth_verify
        ↓
  Backend vérifie l'email
        ↓
  Backend crée l'enregistrement admin_users
        ↓
  Backend génère JWT interne
        ↓
  JWT stocké dans localStorage
        ↓
  Redirection vers /admin
        ↓
  Utilisateur connecté!
```

### Connexion suivante

```
Utilisateur revient à /login
        ↓
  Frontend détecte JWT valide en localStorage
        ↓
  Redirection automatique vers /admin
        ↓
  Utilisateur connecté!
```

---

## 🛠️ Maintenance

### Ajouter un nouvel administrateur

1. Obtenez l'adresse email du nouvel admin
2. Ouvrez `Ynuka Site/php/api.php`
3. Allez à la ligne 92-98
4. Ajoutez l'email à la liste:
   ```php
   $allowed_admin_emails = [
       'jacquesmasuruku2@gmail.com',
       'balumeboaz@gmail.com',
       'martinmusagara@gmail.com',
       'mwatsimulamoolivier@gmail.com',
       'newemail@example.com',  // ← Ajouter ici
   ];
   ```
5. Uploadez le fichier `api.php`
6. ✅ Le nouvel email peut immédiatement se connecter

### Retirer un administrateur

1. Ouvrez `Ynuka Site/php/api.php`
2. Allez à la ligne 92-98
3. Supprimez l'email de la liste
4. Uploadez le fichier `api.php`
5. ✅ L'email ne peut plus se connecter

### Changer le secret JWT

1. Ouvrez `Ynuka Site/php/api.php`
2. Allez à la ligne 56 (fonction `jwt_secret()`)
3. Remplacez la chaîne par une nouvelle chaîne sécurisée (minimum 32 caractères)
4. Uploadez le fichier
5. ⚠️ Les JWTs existants deviennent invalides (l'utilisateur doit se reconnecter)

---

## 📈 Logs et dépannage

### Logs du serveur

Les erreurs sont loggées dans le fichier d'erreurs PHP:

```
error_log("Google OAuth Error: " . $e->getMessage());
error_log("PDO Error: " . $e->getMessage());
```

**Localisation typique:**
- InterServer: `public_html/error.log` ou logs du compte
- Autre hébergement PHP: Vérifiez le php.ini (`error_log` directive)

### Tests en ligne de commande

**Tester l'action `google_auth_url`:**
```bash
curl "https://admin.ynukalabs.com/api/api.php?action=google_auth_url"
```

**Tester l'action `google_oauth_verify`:**
```bash
curl -X POST "https://admin.ynukalabs.com/api/api.php?action=google_oauth_verify" \
  -H "Content-Type: application/json" \
  -d '{"id_token":"GOOGLE_ID_TOKEN_HERE"}'
```

---

## 🔄 Mise à jour des credentials

Si vous devez créer une nouvelle paire de credentials Google:

1. **Google Cloud Console:**
   - Créer un nouveau OAuth 2.0 Client ID
   - Configurer les Redirect URIs

2. **Mettre à jour `google-oauth.php`:**
   ```php
   define('GOOGLE_CLIENT_ID', 'NEW_CLIENT_ID');
   define('GOOGLE_CLIENT_SECRET', 'NEW_CLIENT_SECRET');
   ```

3. **Mettre à jour `Panel Admin/src/main-spa.tsx`:**
   ```tsx
   const GOOGLE_CLIENT_ID = 'NEW_CLIENT_ID';
   ```

4. **Redéployer partout**

---

## 📚 Ressources

- [Google OAuth 2.0 Doc](https://developers.google.com/identity/protocols/oauth2)
- [Google Identity Services](https://developers.google.com/identity/gsi)
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)
- [JWT.io](https://jwt.io/)

---

**Version:** 1.0  
**Date:** 30 Mai 2026  
**Statut:** Production Ready ✅
