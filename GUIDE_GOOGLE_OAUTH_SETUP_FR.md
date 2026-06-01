# Guide Complet - Configuration Google OAuth pour Ynuka Labs

## 📋 Table des matières
1. [Aperçu](#aperçu)
2. [Configuration Google Cloud Console](#configuration-google-cloud-console)
3. [Configuration du serveur PHP](#configuration-du-serveur-php)
4. [Configuration du frontend React](#configuration-du-frontend-react)
5. [Liste blanche des emails](#liste-blanche-des-emails)
6. [Flux d'authentification](#flux-dauthentification)
7. [Déploiement en production](#déploiement-en-production)
8. [Dépannage](#dépannage)

---

## Aperçu

Ce guide vous explique comment configurer Google OAuth 2.0 pour le panel administrateur Ynuka Labs. Le système permet aux administrateurs autorisés de se connecter uniquement avec des adresses email spécifiques.

**Projet Google Cloud:** `ynukalabs-497722`

### Caractéristiques du système
- ✅ Authentification Google OAuth 2.0 sécurisée
- ✅ Liste blanche d'emails pour les admins
- ✅ Tokens JWT pour les sessions backend
- ✅ Protection CSRF intégrée
- ✅ Vérification des emails
- ✅ Support multi-domaine

---

## Configuration Google Cloud Console

### Étape 1: Vérifier votre projet Google Cloud

Votre projet est **déjà configuré** avec les credentials suivants:

```
Projet ID:      ynukalabs-497722
Client ID:      1039734035041-3ob85lpfheoonvv43759desitdr7rhgc.apps.googleusercontent.com
Client Secret:  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
```

### Étape 2: Vérifier les Redirect URIs

Allez à [Google Cloud Console](https://console.cloud.google.com/):

1. **Sélectionnez le projet:** `ynukalabs-497722`
2. **Naviguez vers:** APIs & Services → Credentials
3. **Cliquez sur:** OAuth 2.0 Client IDs → Web client
4. **Vérifiez que ces URIs sont configurées:**
   - `https://admin.ynukalabs.com/api/api.php?action=google_callback`
   - `https://ynukalabs-497722.firebaseapp.com/__/auth/handler`

**⚠️ Important:** Si vous devez ajouter un nouveau domaine:
1. Cliquez sur "Modify"
2. Ajoutez le URI complet dans "Authorized redirect URIs"
3. Sauvegardez

### Étape 3: Activer les APIs

Assurez-vous que ces APIs sont activées:
- ✅ Google+ API
- ✅ Google Identity Services API
- ✅ OAuth 2.0 Scopes: `openid`, `email`, `profile`

---

## Configuration du serveur PHP

### Étape 1: Mettre en place les fichiers PHP

**Fichiers requis sur le serveur:**
```
/php/
├── api.php                  # API principale
├── config.php               # Configuration DB
├── google-oauth.php         # Configuration Google OAuth
└── google-callback.php      # Handler de callback
```

### Étape 2: Fichier `google-oauth.php`

Le fichier est **déjà configuré** avec vos credentials. Contenu:

```php
<?php
// Configuration Google OAuth - DÉJÀ PRÉ-REMPLIE
define('GOOGLE_CLIENT_ID', '1039734035041-3ob85lpfheoonvv43759desitdr7rhgc.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', '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');
define('GOOGLE_PROJECT_ID', 'ynukalabs-497722');
define('GOOGLE_REDIRECT_URI', 'https://admin.ynukalabs.com/api/api.php?action=google_callback');
?>
```

### Étape 3: Fichier `api.php` - Actions Google

L'API propose trois actions pour Google OAuth:

#### A) `google_auth_url` - Générer l'URL de connexion
```bash
GET /php/api.php?action=google_auth_url

Response:
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&state=..."
}
```

#### B) `google_oauth_verify` - Vérifier le token ID
```bash
POST /php/api.php?action=google_oauth_verify

Body:
{
  "id_token": "eyJhbGc..."
}

Response (succès):
{
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "email": "jacquesmasuruku2@gmail.com",
    "name": "Jacques Masuruku"
  }
}

Response (erreur):
{
  "error": "Email not authorized for admin access"
}
```

#### C) `google_oauth_login` - Login simple
```bash
POST /php/api.php?action=google_oauth_login

Body:
{
  "email": "jacquesmasuruku2@gmail.com",
  "name": "Jacques Masuruku"
}

Response:
{
  "token": "JWT_TOKEN",
  "user": { ... }
}
```

### Étape 4: Fichier `api.php` - Liste blanche des emails

**Ligne 92-98 dans `api.php`:**

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

**💡 Pour ajouter un nouvel administrateur:**
1. Ouvrez `api.php`
2. Ajoutez l'email à la liste `$allowed_admin_emails`
3. Redéployez le fichier

### Étape 5: Table `admin_users`

Vérifiez que votre table SQL existe:

```sql
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255),
    google_id VARCHAR(255),
    picture_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Configuration du frontend React

### Étape 1: Installer la librairie Google Identity

Dans `Panel Admin/package.json`:

```json
{
  "dependencies": {
    "@react-oauth/google": "^0.12.0"
  }
}
```

```bash
cd "Panel Admin"
bun install @react-oauth/google
```

### Étape 2: Configurer le fournisseur Google

Dans `Panel Admin/src/main-spa.tsx`:

```tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = '1039734035041-3ob85lpfheoonvv43759desitdr7rhgc.apps.googleusercontent.com';

ReactDOM.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>,
  document.getElementById('root')
);
```

### Étape 3: Page de login - Composant `login.tsx`

Le fichier est **déjà configuré**. Voici comment il fonctionne:

```tsx
// Dans login.tsx
const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
        await phpAuth.startGoogleSignIn();
    } catch (err: unknown) {
        toast.error(translateAuthError(err));
        setGoogleLoading(false);
    }
};
```

### Étape 4: Fichier `php-auth.ts` - Handler OAuth

Créez/mettez à jour `Panel Admin/src/lib/php-auth.ts`:

```typescript
// Configuration API
const API_BASE = 'https://ynukalabs-497722.firebaseapp.com/php/api.php';
// OU en développement local:
// const API_BASE = 'http://localhost:8000/php/api.php';

class PHPAuth {
    async startGoogleSignIn() {
        // 1. Récupérer l'URL Google
        const response = await fetch(`${API_BASE}?action=google_auth_url`);
        const data = await response.json();
        
        // 2. Rediriger vers Google
        window.location.href = data.url;
    }
    
    async handleOAuthCallbackFromHash(hash: string) {
        // Parse le hash: #token=eyJ... ou #error=...
        const params = new URLSearchParams(hash.substring(1));
        const idToken = params.get('token');
        const error = params.get('error');
        
        if (error) {
            return { oauthError: error, redirectTo: null };
        }
        
        if (!idToken) {
            return { oauthError: null, redirectTo: null };
        }
        
        try {
            // Vérifier le token
            const response = await fetch(`${API_BASE}?action=google_oauth_verify`, {
                method: 'POST',
                body: JSON.stringify({ id_token: idToken }),
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();
            
            if (response.ok && data.token) {
                // Stocker le JWT
                localStorage.setItem('auth_token', data.token);
                return { oauthError: null, redirectTo: '/admin' };
            }
            
            return { oauthError: data.error, redirectTo: null };
        } catch (err) {
            return { oauthError: String(err), redirectTo: null };
        }
    }
}

export const phpAuth = new PHPAuth();
```

---

## Liste blanche des emails

### Emails actuellement autorisés

```
1. jacquesmasuruku2@gmail.com
2. balumeboaz@gmail.com
3. martinmusagara@gmail.com
4. mwatsimulamoolivier@gmail.com
```

### Ajouter/Modifier les emails

**Localisation:** `Ynuka Site/php/api.php`, lignes 92-98

```php
$allowed_admin_emails = [
    'jacquesmasuruku2@gmail.com',
    'balumeboaz@gmail.com',
    'martinmusagara@gmail.com',
    'mwatsimulamoolivier@gmail.com',
    // Ajouter ici: 'newemail@gmail.com',
];
```

**Processus:**
1. Modifiez la liste
2. Redéployez `api.php` sur le serveur
3. Le nouvel email peut immédiatement se connecter

---

## Flux d'authentification

### Flux complet (visual)

```
┌─ UTILISATEUR ────────┐
│ Clique sur "Google"  │
└──────────┬───────────┘
           │
           ▼
    ┌──────────────────┐
    │  FRONTEND React  │
    │ login.tsx        │
    └────────┬─────────┘
             │
      Appel: phpAuth.startGoogleSignIn()
             │
             ▼
    ┌──────────────────────────┐
    │  API Backend PHP         │
    │ /api.php?action=         │
    │ google_auth_url          │
    └────────┬─────────────────┘
             │
      Retourne URL Google
             │
             ▼
    ┌──────────────────────────┐
    │  Google OAuth Screen     │
    │  Sélection du compte     │
    │  Consentement            │
    └────────┬─────────────────┘
             │
      Redirection avec token
             │
             ▼
    ┌──────────────────────────┐
    │  FRONTEND React          │
    │  Parse hash #token=...   │
    │  loginPage loader        │
    └────────┬─────────────────┘
             │
    handleOAuthCallbackFromHash()
             │
             ▼
    ┌──────────────────────────┐
    │  API Backend PHP         │
    │ /api.php?action=         │
    │ google_oauth_verify      │
    │ POST id_token            │
    └────────┬─────────────────┘
             │
    Vérifier token + email
             │
             ▼
    ┌──────────────────────────┐
    │  Vérifications:          │
    │  ✓ Email whitelist?      │
    │  ✓ Token valide?         │
    │  ✓ Pas expiré?           │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │  JWT Créé & Retourné     │
    │  Stored in localStorage  │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │  Redirection /admin      │
    │  Connecté! ✓             │
    └──────────────────────────┘
```

### Étapes détaillées

1. **Utilisateur clique sur "Google Sign In"**
   - Page: `login.tsx`
   - Bouton: "Connexion avec Google"

2. **Frontend appelle `phpAuth.startGoogleSignIn()`**
   - Requête: `GET /api.php?action=google_auth_url`
   - Réponse: `{ "url": "https://accounts.google.com/o/oauth2..." }`

3. **Redirection vers Google OAuth**
   - Utilisateur sélectionne son compte Google
   - Google demande le consentement

4. **Google redirige vers le callback**
   - URL: `https://admin.ynukalabs.com/login#token=eyJ...&state=...`
   - Le hash contient le `id_token` et le `state`

5. **Frontend parse le hash**
   - Extrait `id_token` du hash
   - Envoie à l'API: `POST /api.php?action=google_oauth_verify`

6. **Serveur vérifie l'email**
   - Décode le JWT Google
   - Vérifie si l'email est dans la whitelist
   - Crée/met à jour l'utilisateur en BD

7. **Serveur génère un JWT interne**
   - Expires dans 7 jours
   - Contient: `user_id`, `email`, `name`

8. **Frontend stocke le JWT**
   - `localStorage.setItem('auth_token', token)`
   - Redirige vers `/admin`

9. **Utilisateur connecté**
   - Toutes les requêtes API incluent le JWT
   - Dans le header: `Authorization: Bearer JWT`

---

## Déploiement en production

### Checklist avant le déploiement

- [ ] `google-oauth.php` uploadé avec les credentials ✅ (déjà fait)
- [ ] `api.php` uploadé avec la whitelist configurée
- [ ] `config.php` configuré avec la BD MySQL
- [ ] Table `admin_users` créée
- [ ] Frontend React compilé (`bun run build`)
- [ ] `dist/` uploadé sur le serveur web
- [ ] Redirect URI configuré dans Google Console: ✅
  - `https://admin.ynukalabs.com/api/api.php?action=google_callback`
- [ ] HTTPS activé sur le domaine ✅
- [ ] CORS configuré correctement dans `api.php` ✅

### Commandes de déploiement

**Backend (PHP):**
```bash
# Sur InterServer ou votre hébergement PHP
# Naviguez vers le dossier /php/
# Uploadez ces fichiers:
# - api.php
# - google-oauth.php
# - config.php
# - google-callback.php (optionnel)
```

**Frontend (React):**
```bash
# Build le projet React
cd "Panel Admin"
bun run build

# Uploadez le dossier dist/ vers votre serveur web
# Exemple sur Vercel:
vercel --prod
```

### Configuration du serveur web

**Si vous utilisez Nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name admin.ynukalabs.com;
    
    # SSL certificates
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # PHP API
    location /api/ {
        try_files $uri $uri/ =404;
        fastcgi_pass php:9000;
        include fastcgi_params;
    }
    
    # Frontend React - serve index.html for SPA routing
    location / {
        try_files $uri $uri/ /index.html;
        root /var/www/html/dist;
    }
}
```

**Si vous utilisez Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ index.html [QSA,L]
</IfModule>
```

---

## Dépannage

### ❌ Erreur: "Email not authorized for admin access"

**Cause:** L'email de l'utilisateur n'est pas dans la whitelist

**Solution:**
1. Ouvrez `api.php`
2. Allez à la ligne 92-98
3. Ajoutez l'email à `$allowed_admin_emails`
4. Sauvegardez et uploadez

### ❌ Erreur: "Token destiné à une autre application"

**Cause:** Le `client_id` ne correspond pas

**Vérifications:**
1. Dans `google-oauth.php`, le `GOOGLE_CLIENT_ID` est correct: ✅
   ```
   1039734035041-3ob85lpfheoonvv43759desitdr7rhgc.apps.googleusercontent.com
   ```
2. Dans le frontend, le même ID est utilisé

### ❌ Erreur: "State invalide: attaque CSRF détectée"

**Cause:** Le state du callback ne correspond pas

**Solution:**
- Vérifiez que les sessions PHP sont activées
- Vérifiez que les cookies sont bien envoyés (HTTPS requis)

### ❌ Erreur: "Token expiré"

**Cause:** Le JWT Google a expiré pendant le traitement

**Solution:**
- Habituellement résolu automatiquement
- L'utilisateur doit se reconnecter

### ❌ Erreur: "Unauthorized" sur `/admin`

**Cause:** Le JWT interne n'a pas été stocké correctement

**Vérifications:**
1. Ouvrez DevTools (F12)
2. Allez à Application → Local Storage
3. Vérifiez que `auth_token` existe
4. Si absent: le problème vient du parsing du hash

### ❌ Le bouton Google ne fait rien

**Cause:** `GoogleOAuthProvider` n'est pas configuré

**Vérifications:**
1. `package.json` contient `@react-oauth/google`
2. `main-spa.tsx` enveloppe l'app avec `<GoogleOAuthProvider>`
3. Le `clientId` est correct

### ✅ Test d'authentification rapide

Ouvrez la console et exécutez:

```javascript
// Test 1: Vérifier le API endpoint
fetch('https://admin.ynukalabs.com/api/api.php?action=google_auth_url')
    .then(r => r.json())
    .then(d => console.log('Google Auth URL:', d.url))
    .catch(e => console.error('Error:', e));

// Test 2: Vérifier le stockage du token
console.log('Token stocké:', localStorage.getItem('auth_token'));

// Test 3: Vérifier le hash
console.log('Hash URL:', window.location.hash);
```

---

## Support & Documentation

### Ressources officielles
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Identity Services Library](https://developers.google.com/identity/gsi)
- [@react-oauth/google npm](https://www.npmjs.com/package/@react-oauth/google)

### Contacts pour support
- **Backend:** See `Ynuka Site/php/api.php`
- **Frontend:** See `Panel Admin/src/routes/login.tsx`
- **OAuth Config:** See `Ynuka Site/php/google-oauth.php`

---

## Mise à jour / Migration

### Si vous devez changer les credentials

1. **Nouvelle paire de credentials:**
   - Allez à Google Cloud Console
   - APIs & Services → Credentials
   - Create new OAuth 2.0 Client ID

2. **Mise à jour du fichier `google-oauth.php`:**
   ```php
   define('GOOGLE_CLIENT_ID', 'NEW_CLIENT_ID');
   define('GOOGLE_CLIENT_SECRET', 'NEW_CLIENT_SECRET');
   ```

3. **Mise à jour du frontend `main-spa.tsx`:**
   ```tsx
   const GOOGLE_CLIENT_ID = 'NEW_CLIENT_ID';
   ```

4. **Redéployer partout**

---

## Changelog

### Version 1.0 (Production)
- ✅ Google OAuth 2.0 intégré
- ✅ Whitelist d'emails configurée
- ✅ JWT backend généré
- ✅ CSRF protection activée
- ✅ Documentation complète

---

**Dernière mise à jour:** 30 Mai 2026  
**Statut:** ✅ Prêt pour production
