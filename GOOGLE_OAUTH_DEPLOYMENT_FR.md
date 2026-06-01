# 📦 Guide de déploiement - Google OAuth Ynuka Labs

## Prérequis

- ✅ Credentials Google OAuth configurés (déjà fait)
- ✅ Domaine HTTPS: `admin.ynukalabs.com` 
- ✅ Hébergement PHP avec MySQL (InterServer recommandé)
- ✅ FTP/SFTP ou accès File Manager

---

## Phase 1: Préparation locale

### Étape 1: Vérifier les fichiers locaux

```bash
# Dossiers requis:
Ynuka Site/php/
  ├── api.php                     # ✅ À jour
  ├── config.php                  # ✅ À jour
  ├── google-oauth.php            # ✅ À jour
  ├── database.php                # ✅ À jour
  └── google-callback.php         # Optionnel

Panel Admin/
  ├── src/
  │   ├── main-spa.tsx            # À mettre à jour avec GoogleOAuthProvider
  │   ├── routes/login.tsx        # ✅ Déjà configuré
  │   └── lib/php-auth.ts         # À créer si absent
  ├── package.json                # À vérifier
  ├── vite.config.ts              # ✅ À jour
  └── index.html                  # ✅ À jour
```

### Étape 2: Installer les dépendances

```bash
# Dans Panel Admin/
cd "Panel Admin"

# Installer les packages
bun install

# Vérifier que @react-oauth/google est présent
bun ls | grep react-oauth

# Ou si besoin l'installer:
bun add @react-oauth/google
```

### Étape 3: Builder le projet React

```bash
cd "Panel Admin"

# Build pour production
bun run build

# Vérifier que dist/ a été créé
ls -la dist/
# Doit voir: index.html, assets/, robots.txt, etc.
```

---

## Phase 2: Configuration serveur

### Étape 1: Accéder au serveur

**Via InterServer:**

1. Connectez-vous à [InterServer Dashboard](https://my.interserver.net)
2. Allez à: **My Services** → **Account Management**
3. Cliquez sur: **FTP/SFTP Access** ou **File Manager**

**Option A: File Manager (plus facile)**
- Cliquez sur "File Manager"
- Naviguez à: `/public_html/php/`

**Option B: FTP/SFTP (terminal)**
```bash
sftp -P 22 username@your-interserver-host.com
# Ou FTP
ftp ftp.your-domain.com
```

### Étape 2: Vérifier la structure existante

```
public_html/
├── api/
├── php/
│   ├── api.php              ✅ À remplacer
│   ├── config.php           ✅ À vérifier
│   ├── database.php         ✅ À vérifier
│   ├── google-oauth.php     ✅ À remplacer
│   └── ...
├── index.html               (ancien)
└── dist/                    (à créer)
```

### Étape 3: Créer la structure des répertoires

**Via File Manager:**
1. Créez un dossier `dist` à la racine (si absent)
2. À l'intérieur `dist`, créez un dossier `assets`

**Via Terminal:**
```bash
mkdir -p public_html/dist/assets
mkdir -p public_html/php
chmod 755 public_html/php
```

---

## Phase 3: Upload des fichiers PHP

### Fichier 1: `google-oauth.php`

**Localisation locale:** `Ynuka Site/php/google-oauth.php`

**Upload vers:** `/public_html/php/google-oauth.php`

**Via File Manager:**
1. Allez à `/public_html/php/`
2. Cliquez sur "Upload"
3. Sélectionnez `google-oauth.php`
4. Confirmez

**Via Terminal/SFTP:**
```bash
sftp> cd public_html/php
sftp> put google-oauth.php
sftp> bye
```

**Vérification:**
```bash
curl https://admin.ynukalabs.com/api/api.php?action=google_auth_url
# Doit retourner une URL Google OAuth
```

### Fichier 2: `api.php`

**Localisation locale:** `Ynuka Site/php/api.php`

**Upload vers:** `/public_html/php/api.php`

**⚠️ IMPORTANT AVANT L'UPLOAD:**

Vérifiez la whitelist des emails (ligne 92-98):
```php
$allowed_admin_emails = [
    'jacquesmasuruku2@gmail.com',
    'balumeboaz@gmail.com',
    'martinmusagara@gmail.com',
    'mwatsimulamoolivier@gmail.com',
];
```

**Upload:**
```bash
sftp> cd public_html/php
sftp> put api.php
sftp> bye
```

**Vérification:**
```bash
curl https://admin.ynukalabs.com/api/api.php?action=ping
# Doit retourner JSON avec la liste des tables
```

### Fichier 3: `config.php` (si modifié)

**Upload vers:** `/public_html/php/config.php`

Contient les credentials de base de données. Vérifiez avant l'upload.

---

## Phase 4: Upload du Frontend React

### Étape 1: Préparation du build

```bash
cd "Panel Admin"

# Build final pour production
bun run build

# Taille du build
du -sh dist/

# Contenu du build
ls -la dist/
# Doit avoir: index.html, assets/, robots.txt
```

### Étape 2: Upload du dossier `dist/`

**Option A: Via File Manager (recommandé)**

1. Connectez-vous au File Manager
2. Naviguez à: `/public_html/dist/`
3. Cliquez sur "Upload" → "Select Folder"
4. Sélectionnez votre dossier `dist/` local
5. Confirmez (peut prendre quelques minutes)

**Option B: Via SCP/SFTP (terminal)**

```bash
# Sur votre machine locale
scp -r "Panel Admin/dist/*" username@admin.ynukalabs.com:/public_html/dist/

# Ou avec rsync (plus robuste)
rsync -avz "Panel Admin/dist/" username@admin.ynukalabs.com:/public_html/dist/
```

**Option C: Via Vercel/GitHub Pages (automatique)**

Si vous déployez sur Vercel:
```bash
cd "Panel Admin"
npm install -g vercel
vercel --prod
```

### Étape 3: Vérifier le fichier `index.html`

```bash
# Vérifier que index.html est accessible
curl https://admin.ynukalabs.com/

# Doit retourner le HTML de votre app
```

---

## Phase 5: Configuration du serveur web

### Nginx (si applicable)

Créez/mettez à jour le fichier de config Nginx:

```nginx
# /etc/nginx/sites-available/admin.ynukalabs.com

server {
    listen 443 ssl http2;
    server_name admin.ynukalabs.com;

    # Certificats SSL (Let's Encrypt recommandé)
    ssl_certificate /etc/letsencrypt/live/admin.ynukalabs.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.ynukalabs.com/privkey.pem;

    # Répertoire racine
    root /var/www/public_html;

    # Index
    index index.html;

    # API PHP (routing vers /php/)
    location /api/ {
        try_files $uri $uri/ =404;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index api.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root/php/api.php;
    }

    # Frontend SPA React (routing pour history)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Bloquer l'accès aux fichiers sensibles
    location ~ /\. {
        deny all;
    }
}

# Redirection HTTP → HTTPS
server {
    listen 80;
    server_name admin.ynukalabs.com;
    return 301 https://$server_name$request_uri;
}
```

### Apache avec .htaccess

**Fichier:** `/public_html/.htaccess`

```apache
# Activer mod_rewrite
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Exclure les fichiers et dossiers existants
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Rediriger tout vers index.html (SPA routing)
    RewriteRule ^ index.html [QSA,L]
    
    # Exception: laisser les fichiers /api/ non réécrits
    RewriteCond %{REQUEST_URI} ^/api/
    RewriteRule ^ - [L]
</IfModule>

# Force HTTPS
<IfModule mod_ssl.c>
    RewriteCond %{HTTPS} off
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# Compression GZIP
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/x-httpd-php
    AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# Cache Browser
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/html "access plus 1 hour"
    ExpiresByType text/css "access plus 30 days"
    ExpiresByType text/javascript "access plus 30 days"
    ExpiresByType application/javascript "access plus 30 days"
    ExpiresByType image/* "access plus 30 days"
</IfModule>
```

### InterServer (Control Panel)

Si vous utilisez InterServer:

1. Connectez-vous à la console
2. Allez à: **Servers** → **Web Server Configuration**
3. Vérifiez que PHP est activé
4. Vérifiez que HTTPS/SSL est configuré
5. Sauvegardez

---

## Phase 6: Vérifications finales

### Test 1: API PHP

```bash
# Test de l'action google_auth_url
curl https://admin.ynukalabs.com/api/api.php?action=google_auth_url

# Réponse attendue:
# {"url":"https://accounts.google.com/o/oauth2/v2/auth?..."}
```

### Test 2: Frontend React

```bash
# Accéder à la page de login
curl https://admin.ynukalabs.com/login

# Doit retourner le HTML de votre app React
# (Ne pas se fier au curl, mieux vaut vérifier dans le navigateur)
```

### Test 3: Navigation

Ouvrez dans votre navigateur:
1. `https://admin.ynukalabs.com/login`
2. Le bouton "Connexion avec Google" doit être visible
3. Cliquez dessus
4. Vous devriez être redirigé vers Google

### Test 4: Authentification complète

```
1. Allez à https://admin.ynukalabs.com/login
2. Cliquez "Connexion avec Google"
3. Sélectionnez un compte autorisé (par ex: jacquesmasuruku2@gmail.com)
4. Acceptez les permissions
5. Vous devriez être redirigé vers /admin
6. Si erreur, vérifiez les logs
```

---

## Phase 7: Monitorer la production

### Logs PHP

**Vérifier les erreurs:**

```bash
# Via SSH
tail -f /var/log/apache2/error.log
tail -f /var/log/php-errors.log

# Ou via InterServer File Manager
# Accédez à: public_html/error.log ou error.txt
```

### Logs JavaScript (Frontend)

Ouvrez la console du navigateur (F12):
```javascript
// Vérifier les erreurs
console.error // Cherchez les messages rouges

// Vérifier le token stocké
localStorage.getItem('auth_token')

// Vérifier l'URL de redirection
console.log(window.location.href)
```

### Monitoring d'accès

```bash
# Vérifier les accès aux endpoints
tail -f /var/log/apache2/access.log | grep api.php

# Ou via les logs de Google Cloud Console
# Vérifiez les logs OAuth à: console.cloud.google.com
```

---

## Checklist de déploiement

```bash
[ ] Fichiers PHP préparés localement
    [ ] google-oauth.php avec credentials
    [ ] api.php avec whitelist
    [ ] config.php avec BD
    
[ ] Frontend React builté
    [ ] bun run build exécuté
    [ ] dossier dist/ créé
    
[ ] Fichiers uploadés sur le serveur
    [ ] /public_html/php/google-oauth.php
    [ ] /public_html/php/api.php
    [ ] /public_html/php/config.php
    [ ] /public_html/dist/* (tous les fichiers)
    
[ ] Configuration du serveur web
    [ ] .htaccess créé (Apache)
    [ ] HTTPS configuré
    [ ] Routing SPA configuré
    
[ ] Tests passés
    [ ] API accessible: /api/api.php?action=ping
    [ ] Frontend chargé: /login
    [ ] Bouton Google visible
    [ ] Authentification fonctionne
    
[ ] Monitoring en place
    [ ] Logs PHP vérifiés
    [ ] Logs Google OAuth vérifiés
    [ ] Console du navigateur OK
```

---

## ✅ Déploiement complet!

Vous êtes prêt pour le lancement! 🎉

**Besoin d'aide?** Consultez:
- Guide complet: `GUIDE_GOOGLE_OAUTH_SETUP_FR.md`
- Configuration détaillée: `GOOGLE_OAUTH_CONFIG_DETAILS_FR.md`
- Dépannage rapide: `GOOGLE_OAUTH_QUICKSTART_FR.md`

---

**Date:** 30 Mai 2026  
**Version:** 1.0  
**Statut:** Production Ready ✅
