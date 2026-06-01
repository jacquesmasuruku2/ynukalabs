# 🚀 DÉPLOIEMENT RAPIDE - API Ynuka Labs (InterServer)

> **Vue d'ensemble:** 3 phases principales, ~2 heures total

---

## 📋 RÉSUMÉ DES ÉTAPES

```
PHASE 1: Préparation locale (30 min)
    ↓
PHASE 2: Upload sur InterServer (30 min)
    ↓
PHASE 3: Tests & Validation (1 heure)
    ↓
✅ PRODUCTION!
```

---

## 🟢 PHASE 1: PRÉPARATION LOCALE

### Étape 1: Vérifier les fichiers

```bash
# Source: Ynuka Site/php/
ls -la "Ynuka Site/php/" | grep -E "(api|config|database|google|\.htaccess)"
```

**Fichiers REQUIS:**
- ✅ `api.php`
- ✅ `config.php`
- ✅ `database.php`
- ✅ `google-oauth.php`
- ✅ `google-callback.php`
- ✅ `setup.sql`
- ✅ `.htaccess` (À CRÉER)

### Étape 2: Vérifier les configurations critiques

**config.php (ligne 1-8):**
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');
```

**api.php (ligne 92-98):**
```php
$allowed_admin_emails = [
    'jacquesmasuruku2@gmail.com',
    'balumeboaz@gmail.com',
    'martinmusagara@gmail.com',
    'mwatsimulamoolivier@gmail.com',
];
```

**google-oauth.php (ligne 17-21):**
```php
define('GOOGLE_CLIENT_ID', '1039734035041-3ob85lpfheoonvv43759desitdr7rhgc.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', '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');
define('GOOGLE_REDIRECT_URI', 'https://admin.ynukalabs.com/api/api.php?action=google_callback');
```

### Étape 3: Créer .htaccess

**Créer le fichier:** `Ynuka Site/php/.htaccess`

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /api/
    RewriteCond %{HTTP:Authorization} ^(.+)$
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
</IfModule>

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

<Files "setup.sql">
    Order allow,deny
    Deny from all
</Files>

php_value post_max_size 50M
php_value upload_max_filesize 50M
php_value max_execution_time 300
```

### Étape 4: Préparer l'upload

```bash
# Créer un dossier de staging
mkdir -p ~/deployment/ynuka-api

# Copier les fichiers
cp "Ynuka Site/php/api.php" ~/deployment/ynuka-api/
cp "Ynuka Site/php/config.php" ~/deployment/ynuka-api/
cp "Ynuka Site/php/database.php" ~/deployment/ynuka-api/
cp "Ynuka Site/php/google-oauth.php" ~/deployment/ynuka-api/
cp "Ynuka Site/php/google-callback.php" ~/deployment/ynuka-api/
cp "Ynuka Site/php/setup.sql" ~/deployment/ynuka-api/
cp "Ynuka Site/php/.htaccess" ~/deployment/ynuka-api/

# Vérifier
ls -la ~/deployment/ynuka-api/ | wc -l  # Doit avoir 7 fichiers
```

---

## 🟡 PHASE 2: UPLOAD INTERSERVER

### Étape 1: Accéder à InterServer

**URL:** https://vda6600.is.cc:2222/  
**Login:** Vos identifiants

### Étape 2: Créer le dossier API

1. Allez à: `/domains/admin.ynukalabs.com/public_html/`
2. Créez un nouveau dossier: `api`
3. Entrez dans le dossier `api`

### Étape 3: Upload des fichiers (ORDRE IMPORTANT!)

**⚠️ Respectez cet ordre exactement:**

```
1️⃣  config.php           ← D'abord (dépendance)
2️⃣  database.php         ← Deuxièmement (dépendance)
3️⃣  google-oauth.php     ← Troisièmement (dépendance)
4️⃣  .htaccess            ← Avant api.php (sécurité)
5️⃣  api.php              ← Principal (dépend des autres)
6️⃣  google-callback.php  ← Optionnel
7️⃣  setup.sql            ← Référence
```

**Via File Manager:**
- Cliquez "Upload"
- Sélectionnez les fichiers
- Confirmez

### Étape 4: Vérifier les permissions

**Via clic droit > Properties:**

| Fichier | Permissions | Valeur |
|---------|-------------|--------|
| `api.php` | Read/Write | 644 |
| `google-callback.php` | Read/Write | 644 |
| `.htaccess` | Read/Write | 644 |
| `config.php` | Read-only | 600 |
| `database.php` | Read-only | 600 |
| `google-oauth.php` | Read-only | 600 |
| `setup.sql` | Read-only | 600 |

### Étape 5: Créer les dossiers auxiliaires

**Via File Manager:**
1. Créez un dossier `logs` dans `/api/`
2. Permissions: 755

**Chemin final:**
```
/domains/admin.ynukalabs.com/public_html/api/logs/
```

---

## 🔵 PHASE 3: TESTS & VALIDATION

### Test 1: Ping de l'API ✅

**URL:**
```
https://admin.ynukalabs.com/api/api.php?action=ping
```

**Réponse attendue:**
```json
{
  "status": "ok",
  "database": "ynukalab_database_website",
  "tables": ["users", "admin_users", "blog_posts", ...],
  "timestamp": "2026-05-30..."
}
```

**Si erreur 404:** Le dossier `/api/` n'existe pas  
**Si erreur 500:** Les fichiers sont manquants ou syntaxe incorrecte

### Test 2: Google OAuth ✅

**URL:**
```
https://admin.ynukalabs.com/api/api.php?action=google_auth_url
```

**Réponse attendue:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
}
```

### Test 3: Sécurité des fichiers ✅

```bash
# Doit retourner 403 Forbidden:
curl https://admin.ynukalabs.com/api/config.php
curl https://admin.ynukalabs.com/api/database.php

# Doit retourner 200 OK:
curl https://admin.ynukalabs.com/api/api.php?action=ping
```

### Test 4: Authentification Google complète ✅

1. Allez à: `https://admin.ynukalabs.com/login`
2. Cliquez "Connexion avec Google"
3. Sélectionnez un compte autorisé
4. Redirigé vers `/admin` = ✅ Succès

### Test 5: Logs & Erreurs ✅

**Via InterServer Console:**
- Accédez: **Logs** → **PHP Error Logs**
- Cherchez des erreurs relatives à `/api/`

---

## 📊 STRUCTURE FINALE

```
admin.ynukalabs.com/
│
├── dist/                    ← Frontend React
│   ├── index.html
│   ├── assets/
│   └── ...
│
└── api/                     ← ✅ VOTRE API
    ├── api.php              (Point d'entrée)
    ├── config.php           (SÉCURISÉ)
    ├── database.php         (SÉCURISÉ)
    ├── google-oauth.php     (SÉCURISÉ)
    ├── google-callback.php
    ├── .htaccess            (Sécurité)
    ├── setup.sql            (SÉCURISÉ)
    └── logs/                (Logs)
        └── *.log
```

---

## ✅ CHECKLIST FINALE

```
[ ] PHASE 1
    [ ] Fichiers préparés localement
    [ ] Configurations vérifiées
    [ ] .htaccess créé
    
[ ] PHASE 2
    [ ] Dossier /api/ créé sur InterServer
    [ ] Fichiers uploadés (dans le bon ordre!)
    [ ] Permissions correctes
    [ ] Dossier logs/ créé
    
[ ] PHASE 3
    [ ] Test ping: ✅ Response JSON
    [ ] Test Google: ✅ URL reçue
    [ ] Sécurité: ✅ config.php = 403
    [ ] Login Google: ✅ Fonctionne
    [ ] Logs: ✅ Pas d'erreurs critiques
```

---

## 🔴 PROBLÈMES COURANTS

| Problème | Cause | Solution |
|----------|-------|----------|
| 404 Not Found | Dossier `/api/` manquant | Créer le dossier dans `/public_html/` |
| 500 Server Error | Fichier manquant ou syntaxe | Vérifier l'ordre d'upload |
| Database connection failed | Credentials incorrects | Vérifier `config.php` |
| 403 Forbidden sur api.php | Permissions incorrectes | Changer à 644 |
| Google OAuth ne marche pas | Credentials invalides | Vérifier `google-oauth.php` |

---

## 📈 APRÈS LE DÉPLOIEMENT

### Monitoring quotidien
```bash
# Voir les accès
tail -f /var/log/apache2/access.log | grep api.php

# Voir les erreurs
tail -f /var/log/apache2/error.log
```

### Maintenance régulière
- Vérifier les logs chaque jour
- Tester les endpoints chaque semaine
- Revoir les credentials Google chaque mois

---

## 🎯 RÉSUMÉ TOTAL

| Phase | Durée | Étapes |
|-------|-------|--------|
| Préparation | 30 min | Config + .htaccess + fichiers |
| Upload | 30 min | Créer dossier + Upload (ordre!) |
| Tests | 1 heure | 5 tests de validation |
| **TOTAL** | **2 heures** | **Prêt pour production** |

---

**Status:** ✅ Prêt à déployer!  
**Date:** 30 Mai 2026  
**Serveur:** InterServer (vda6600.is.cc:2222)
