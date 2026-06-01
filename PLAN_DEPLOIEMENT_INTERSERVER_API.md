# 📋 PLAN DE DÉPLOIEMENT - API Ynuka Labs sur InterServer

**Date:** 30 Mai 2026  
**Serveur:** vda6600.is.cc:2222  
**Chemin cible:** `/domains/admin.ynukalabs.com/public_html/api/`

---

## 🎯 OBJECTIF GÉNÉRAL

Déployer une API REST cohérente, sécurisée et fonctionnelle pour l'authentification et la gestion des données Ynuka Labs.

**Architecture:**
```
admin.ynukalabs.com/
├── dist/                      ← Frontend React (compilé)
└── api/                       ← API REST (ce plan)
    ├── api.php               ← Point d'entrée principal
    ├── config.php            ← Configuration BD
    ├── database.php          ← Connexion PDO
    ├── google-oauth.php      ← Auth Google OAuth 2.0
    ├── google-callback.php   ← Callback Google
    ├── .htaccess             ← Configuration Apache
    ├── setup.sql             ← Script d'initialisation BD
    └── [logs/]               ← Dossier de logs (à créer)
```

---

## 📝 PHASE 1: PRÉPARATION LOCALE (30 min)

### Étape 1.1: Vérifier la structure locale

```bash
# Dossier source: Ynuka Site/php/
ls -la "Ynuka Site/php/"

# Fichiers REQUIS:
✓ api.php                  (2.2 KB)
✓ config.php               (2.5 KB)
✓ database.php             (3.1 KB)
✓ google-oauth.php         (8.2 KB)
✓ google-callback.php      (2.0 KB)
✓ setup.sql                (3.5 KB)

# Fichiers OPTIONNELS (à inclure pour documentation):
- API_DOCUMENTATION.md
- README.md
- test-api.sh
```

### Étape 1.2: Vérifier les configurations critiques

**✓ CHECKLIST - Vérifier dans config.php:**
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');
```

**✓ CHECKLIST - Vérifier dans api.php (ligne 92-98):**
```php
$allowed_admin_emails = [
    'jacquesmasuruku2@gmail.com',
    'balumeboaz@gmail.com',
    'martinmusagara@gmail.com',
    'mwatsimulamoolivier@gmail.com',
];
```

**✓ CHECKLIST - Vérifier dans google-oauth.php:**
```php
define('GOOGLE_CLIENT_ID', '1039734035041-3ob85lpfheoonvv43759desitdr7rhgc.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', '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');
define('GOOGLE_REDIRECT_URI', 'https://admin.ynukalabs.com/api/api.php?action=google_callback');
```

### Étape 1.3: Créer le fichier .htaccess

**Créer:** `Ynuka Site/php/.htaccess`

```apache
# ============ REWRITE ENGINE ============
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /api/
    
    # Pass Authorization header to PHP (IMPORTANT for JWT)
    RewriteCond %{HTTP:Authorization} ^(.+)$
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
</IfModule>

# ============ ALLOW ACCESS TO FILES ============
<Files "api.php">
    Allow from all
</Files>

# ============ DENY DIRECT ACCESS TO CONFIG ============
<Files "config.php">
    Order allow,deny
    Deny from all
</Files>

<Files "database.php">
    Order allow,deny
    Deny from all
</Files>

<Files "google-oauth.php">
    Order allow,deny
    Deny from all
</Files>

# ============ SETUP.SQL SECURITY ============
<Files "setup.sql">
    Order allow,deny
    Deny from all
</Files>

# ============ PHP CONFIGURATION ============
php_value post_max_size 50M
php_value upload_max_filesize 50M
php_value max_execution_time 300
```

### Étape 1.4: Préparer les fichiers pour l'upload

```bash
# Créer un dossier local pour le déploiement
mkdir -p ~/deployment/ynuka-api

# Copier les fichiers
cp "Ynuka Site/php/api.php" ~/deployment/ynuka-api/
cp "Ynuka Site/php/config.php" ~/deployment/ynuka-api/
cp "Ynuka Site/php/database.php" ~/deployment/ynuka-api/
cp "Ynuka Site/php/google-oauth.php" ~/deployment/ynuka-api/
cp "Ynuka Site/php/google-callback.php" ~/deployment/ynuka-api/
cp "Ynuka Site/php/setup.sql" ~/deployment/ynuka-api/
cp "Ynuka Site/php/.htaccess" ~/deployment/ynuka-api/
cp "Ynuka Site/php/README.md" ~/deployment/ynuka-api/
cp "Ynuka Site/php/API_DOCUMENTATION.md" ~/deployment/ynuka-api/

# Vérifier
ls -la ~/deployment/ynuka-api/
```

---

## 🚀 PHASE 2: DÉPLOIEMENT SUR INTERSERVER (30 min)

### Étape 2.1: Accéder au File Manager InterServer

1. **URL:** https://vda6600.is.cc:2222/
2. **Login:** Vos identifiants InterServer
3. **Navigation:** Allez à `/domains/admin.ynukalabs.com/public_html/`

### Étape 2.2: Créer la structure du dossier `/api/`

**VIA File Manager InterServer:**

1. Dans `/public_html/`, créez un nouveau dossier: `api`
2. Entrez dans le dossier `api/`
3. Le chemin doit être: `/domains/admin.ynukalabs.com/public_html/api/`

```
/domains/admin.ynukalabs.com/public_html/
├── dist/                 ← Frontend React
├── api/                  ← À CRÉER (dossier vide pour l'instant)
│   └── (fichiers à venir)
```

### Étape 2.3: Upload des fichiers (ORDRE IMPORTANT)

**⚠️ ORDRE D'UPLOAD - Très important pour la cohérence:**

**Étape 1: Fichiers de configuration (d'abord)**
1. Uploadez **`config.php`** 
2. Uploadez **`database.php`**
3. Uploadez **`google-oauth.php`**

```
Pourquoi d'abord? Parce que api.php les require_once
```

**Étape 2: Fichiers de sécurité**
4. Uploadez **`.htaccess`**

```
Pourquoi ici? Pour que les permissions soient appliquées avant les tests
```

**Étape 3: Fichier principal**
5. Uploadez **`api.php`**

```
Pourquoi en dernier? Parce que c'est le point d'entrée qui dépend de tous les autres
```

**Étape 4: Fichiers auxiliaires**
6. Uploadez **`google-callback.php`**
7. Uploadez **`setup.sql`** (pour référence)
8. Uploadez **`README.md`** et **`API_DOCUMENTATION.md`** (documentation)

**Via File Manager InterServer:**
```
1. Cliquez sur "Upload" dans le dossier /api/
2. Sélectionnez les fichiers dans cet ordre:
   [config.php, database.php, google-oauth.php, .htaccess, api.php, google-callback.php, setup.sql, README.md]
3. Confirmez l'upload
```

### Étape 2.4: Vérifier les permissions des fichiers

**Via File Manager InterServer (clic droit > Properties):**

| Fichier | Permissions | Raison |
|---------|-------------|--------|
| `api.php` | 644 (rw-r--r--) | Lisible par le serveur |
| `config.php` | 600 (rw-------) | Sécurité - données sensibles |
| `database.php` | 600 (rw-------) | Sécurité - credentials |
| `google-oauth.php` | 600 (rw-------) | Sécurité - secrets Google |
| `google-callback.php` | 644 (rw-r--r--) | Normal |
| `.htaccess` | 644 (rw-r--r--) | Normal |
| `setup.sql` | 600 (rw-------) | Sécurité - données |

```bash
# Via Terminal SSH (si disponible):
cd /domains/admin.ynukalabs.com/public_html/api/
chmod 644 api.php google-callback.php .htaccess
chmod 600 config.php database.php google-oauth.php setup.sql
```

### Étape 2.5: Créer les dossiers auxiliaires

**Via File Manager InterServer:**

1. Créez un dossier `logs` dans `/api/`
   ```
   /domains/admin.ynukalabs.com/public_html/api/logs/
   ```
2. Permissions: 755 (rwxr-xr-x)

```bash
# Via Terminal:
mkdir -p /domains/admin.ynukalabs.com/public_html/api/logs
chmod 755 /domains/admin.ynukalabs.com/public_html/api/logs
```

---

## 🧪 PHASE 3: TESTS DE VALIDATION (20 min)

### Étape 3.1: Test 1 - Vérifier que les fichiers sont uploadés

**Accédez à:**
```
https://admin.ynukalabs.com/api/api.php?action=ping
```

**Réponse attendue:**
```json
{
  "status": "ok",
  "database": "ynukalab_database_website",
  "tables": ["users", "admin_users", "blog_posts", ...],
  "timestamp": "2026-05-30T15:30:45+00:00"
}
```

**Si erreur 404:**
- ❌ Le dossier `/api/` n'existe pas
- ❌ Les fichiers ne sont pas uploadés
- Solution: Vérifier le chemin et relancer l'upload

**Si erreur 500:**
- ❌ Erreur PHP (généralement manque de fichier ou syntaxe)
- Solution: Vérifier les logs du serveur

### Étape 3.2: Test 2 - Vérifier la connexion BD

**Accédez à:**
```
https://admin.ynukalabs.com/api/api.php?action=ping
```

**Résultat:**
- ✅ Si la BD est connectée, vous recevez la liste des tables
- ❌ Si erreur BD: Vérifier config.php et les credentials

### Étape 3.3: Test 3 - Vérifier Google OAuth

**Accédez à:**
```
https://admin.ynukalabs.com/api/api.php?action=google_auth_url
```

**Réponse attendue:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&state=..."
}
```

**Si erreur:**
- ❌ Les credentials Google ne sont pas corrects
- ❌ google-oauth.php n'est pas uploadé
- Solution: Vérifier le fichier et les credentials

### Étape 3.4: Test 4 - Vérifier les permissions des fichiers

**Via Terminal/SSH:**
```bash
curl -I https://admin.ynukalabs.com/api/config.php
# Doit retourner 403 (accès refusé) ← CORRECT!

curl -I https://admin.ynukalabs.com/api/api.php
# Doit retourner 200 (OK) ← CORRECT!
```

### Étape 3.5: Test complet de login

1. Allez à: `https://admin.ynukalabs.com/login`
2. Cliquez sur "Connexion avec Google"
3. Sélectionnez un compte autorisé
4. Vous devriez être redirigé vers `/admin`

---

## 🔒 PHASE 4: SÉCURITÉ & HARDENING (15 min)

### Étape 4.1: Vérifier le .htaccess

**Le fichier `.htaccess` doit:**
- ✅ Passer le header Authorization
- ✅ Bloquer l'accès à config.php
- ✅ Bloquer l'accès à database.php
- ✅ Bloquer l'accès à google-oauth.php
- ✅ Bloquer l'accès à setup.sql

**Tester:**
```bash
# Doit retourner 403 Forbidden:
curl https://admin.ynukalabs.com/api/config.php
curl https://admin.ynukalabs.com/api/database.php

# Doit retourner 200 OK (ou JSON réponse):
curl https://admin.ynukalabs.com/api/api.php?action=ping
```

### Étape 4.2: Vérifier les erreurs PHP

**Via logs InterServer:**
1. Accédez à la console InterServer
2. Allez à: **Logs** → **PHP Error Logs**
3. Vérifiez qu'il n'y a pas d'erreurs critiques

```bash
# Via SSH:
tail -f /var/log/apache2/error.log | grep "admin.ynukalabs.com"
```

### Étape 4.3: Paramètres de sécurité

**Vérifiez dans config.php:**
```php
// Doit être DÉSACTIVÉ en production:
ini_set('display_errors', 0);  ← Non visible publiquement
ini_set('log_errors', 1);      ← Logs activés
```

**À faire:**
1. Changez `display_errors` à 0 si ce n'est pas fait
2. Vérifiez que `log_errors` est à 1
3. Uploadez le fichier modifié

### Étape 4.4: Sauvegardes

**Créer une sauvegarde avant modifications:**
```bash
# Via Terminal:
tar -czf /domains/admin.ynukalabs.com/public_html/api.backup.tar.gz /domains/admin.ynukalabs.com/public_html/api/
```

---

## 📊 PHASE 5: MONITORING & LOGS (10 min)

### Étape 5.1: Configurer les logs

**Dans api.php, vérifiez la fonction `error_log()`:**
```php
error_log("Google OAuth Error: " . $e->getMessage());
error_log("PDO Error: " . $e->getMessage());
```

**Les logs doivent aller dans:**
- `/domains/admin.ynukalabs.com/public_html/api/logs/`
- Ou le fichier PHP error_log par défaut

### Étape 5.2: Vérifier les logs

**Via SSH/Terminal:**
```bash
# Voir les logs
tail -f /var/log/php-errors.log
tail -f /domains/admin.ynukalabs.com/public_html/api/logs/*.log
```

### Étape 5.3: Monitoring d'accès

```bash
# Voir les accès à l'API
tail -f /var/log/apache2/access.log | grep "api.php"

# Compter les erreurs
grep "error" /var/log/apache2/error.log | wc -l
```

---

## 🎯 PHASE 6: VALIDATION FINALE (10 min)

### Checklist finale avant production

```
[ ] PHASE 1: Préparation
    [ ] config.php vérifié localement
    [ ] api.php avec whitelist OK
    [ ] google-oauth.php avec credentials
    [ ] .htaccess créé

[ ] PHASE 2: Déploiement
    [ ] Dossier /api/ créé sur le serveur
    [ ] Fichiers uploadés dans le bon ordre
    [ ] Permissions correctes (644/600)
    [ ] Dossier logs/ créé

[ ] PHASE 3: Tests
    [ ] /api/api.php?action=ping ← JSON reçu
    [ ] /api/api.php?action=google_auth_url ← URL Google
    [ ] /api/config.php ← 403 Forbidden
    [ ] /api/database.php ← 403 Forbidden
    [ ] Login Google fonctionne

[ ] PHASE 4: Sécurité
    [ ] .htaccess appliqué
    [ ] Pas d'erreurs PHP graves
    [ ] display_errors = 0
    [ ] log_errors = 1

[ ] PHASE 5: Monitoring
    [ ] Logs accessibles
    [ ] Logs en écriture

[ ] FINAL
    [ ] API stable
    [ ] Frontend React connecté
    [ ] Base de données OK
    [ ] Authentification Google OK
```

---

## 📞 DÉPANNAGE RAPIDE

### Erreur: "File not found (404)"
**Solution:**
- Vérifier que le dossier `/api/` existe
- Vérifier que les fichiers sont dedans
- Vérifier l'URL exacte

### Erreur: "Database connection failed"
**Solution:**
- Vérifier config.php (DB_HOST, DB_NAME, DB_USER, DB_PASS)
- Tester la connexion BD via InterServer
- Vérifier que la BD `ynukalab_database_website` existe

### Erreur: "Permission denied"
**Solution:**
- Vérifier les permissions (644 pour api.php)
- Vérifier que le serveur a les droits de lecture

### Erreur: "Google OAuth failed"
**Solution:**
- Vérifier les credentials dans google-oauth.php
- Vérifier que le redirect URI est correct dans Google Console
- Vérifier que google-oauth.php est bien uploadé

---

## 📈 STRUCTURE FINALE SUR LE SERVEUR

```
/domains/admin.ynukalabs.com/public_html/
├── dist/                        (Frontend React)
│   ├── index.html
│   ├── assets/
│   └── ...
│
└── api/                         ← Votre API
    ├── api.php                  ← Point d'entrée principal
    ├── config.php               ← Configuration (PROTÉGÉ)
    ├── database.php             ← Connexion PDO (PROTÉGÉ)
    ├── google-oauth.php         ← Google OAuth (PROTÉGÉ)
    ├── google-callback.php      ← Callback Google
    ├── .htaccess                ← Sécurité & routing
    ├── setup.sql                ← SQL setup (PROTÉGÉ)
    ├── README.md                ← Documentation
    ├── API_DOCUMENTATION.md     ← Documentation API
    └── logs/                    ← Logs d'erreurs
        └── *.log
```

---

## 🚀 COMMANDES RAPIDES (Terminal SSH)

```bash
# Se connecter au serveur
ssh -p 2222 user@vda6600.is.cc

# Naviguer
cd /domains/admin.ynukalabs.com/public_html/api/

# Lister les fichiers
ls -la

# Vérifier les permissions
ls -l api.php config.php

# Tester l'API
curl https://admin.ynukalabs.com/api/api.php?action=ping

# Voir les logs
tail -f /var/log/apache2/error.log

# Sauvegarder
tar -czf backup.tar.gz *

# Restaurer
tar -xzf backup.tar.gz
```

---

## ✅ PRÊT POUR LE DÉPLOIEMENT!

**Total time estimate:** 2-3 heures (incluant tests et monitoring)

**Points critiques:**
1. ✅ Ordre d'upload des fichiers
2. ✅ Permissions correctes (sécurité)
3. ✅ .htaccess en place
4. ✅ Tests validation
5. ✅ Monitoring des logs

**Une fois déployé:**
- L'API sera accessible à: `https://admin.ynukalabs.com/api/api.php`
- La sécurité sera garantie par le .htaccess
- La configuration sera cohérente et stable

---

**Document créé:** 30 Mai 2026  
**Version:** 1.0  
**Statut:** ✅ Prêt pour déploiement
