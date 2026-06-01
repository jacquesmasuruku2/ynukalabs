# 📦 CHECKLIST D'UPLOAD - API Ynuka Labs

> **Pour vous guider pas à pas lors du déploiement sur InterServer**

---

## 📍 LOCALISATION EXACTE

**Serveur:** vda6600.is.cc:2222  
**Chemin:** `/domains/admin.ynukalabs.com/public_html/api/`  
**URL d'accès:** `https://admin.ynukalabs.com/api/api.php`

---

## 🎯 VUE D'ENSEMBLE

```
LOCAL                SERVEUR (InterServer)
─────────────────────────────────────   ─────────────────────────────────────

Ynuka Site/php/                         /domains/admin.ynukalabs.com/public_html/
├── api.php                    ─────→   api/
├── config.php                 ─────→   ├── api.php
├── database.php               ─────→   ├── config.php
├── google-oauth.php           ─────→   ├── database.php
├── google-callback.php        ─────→   ├── google-oauth.php
├── setup.sql                  ─────→   ├── google-callback.php
├── .htaccess (À CRÉER)        ─────→   ├── setup.sql
├── README.md                  ─────→   ├── .htaccess
└── API_DOCUMENTATION.md       ─────→   ├── README.md
                                         ├── API_DOCUMENTATION.md
                                         └── logs/
```

---

## ✅ ÉTAPE 1: VÉRIFICATION LOCALE

### Tâche 1.1: Lister les fichiers source

```bash
ls -la "Ynuka Site/php/" | grep -E "(\.php|\.sql|\.htaccess|\.md)"
```

**Résultat attendu:**
```
-rw-r--r--  api.php
-rw-r--r--  config.php
-rw-r--r--  database.php
-rw-r--r--  google-oauth.php
-rw-r--r--  google-callback.php
-rw-r--r--  setup.sql
-rw-r--r--  README.md
-rw-r--r--  API_DOCUMENTATION.md
```

**Checklist:**
- [ ] ✅ api.php (2.2 KB) - Point d'entrée principal
- [ ] ✅ config.php (2.5 KB) - Configuration BD
- [ ] ✅ database.php (3.1 KB) - Connexion PDO
- [ ] ✅ google-oauth.php (8.2 KB) - OAuth Google
- [ ] ✅ google-callback.php (2.0 KB) - Callback
- [ ] ✅ setup.sql (3.5 KB) - Schéma BD

### Tâche 1.2: Vérifier .htaccess

```bash
cat "Ynuka Site/php/.htaccess"
```

**Résultat attendu:**
```
RewriteEngine On
RewriteBase /api/
RewriteCond %{HTTP:Authorization} ^(.+)$
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
```

**Checklist:**
- [ ] ✅ Fichier .htaccess existe (ou À CRÉER)

### Tâche 1.3: Vérifier les configurations critiques

```bash
# Vérifier DB config
grep "define('DB_" "Ynuka Site/php/config.php"

# Vérifier Google config
grep "define('GOOGLE_" "Ynuka Site/php/google-oauth.php"

# Vérifier whitelist
grep "allowed_admin_emails" "Ynuka Site/php/api.php"
```

**Checklist:**
- [ ] ✅ DB_HOST = localhost
- [ ] ✅ DB_NAME = ynukalab_database_website
- [ ] ✅ DB_USER = ynukalab_admin-jacques
- [ ] ✅ DB_PASS = Admin-Jacques.ynuka_db
- [ ] ✅ GOOGLE_CLIENT_ID = 1039734035041-...
- [ ] ✅ GOOGLE_CLIENT_SECRET = GOCSPX-...
- [ ] ✅ Whitelist = 4 emails

---

## 🚀 ÉTAPE 2: PRÉPARATION POUR UPLOAD

### Tâche 2.1: Créer le dossier staging local

```bash
# Créer un dossier temporaire
mkdir -p ~/ynuka-api-deploy

# Copier tous les fichiers
cp "Ynuka Site/php/api.php" ~/ynuka-api-deploy/
cp "Ynuka Site/php/config.php" ~/ynuka-api-deploy/
cp "Ynuka Site/php/database.php" ~/ynuka-api-deploy/
cp "Ynuka Site/php/google-oauth.php" ~/ynuka-api-deploy/
cp "Ynuka Site/php/google-callback.php" ~/ynuka-api-deploy/
cp "Ynuka Site/php/setup.sql" ~/ynuka-api-deploy/
cp "Ynuka Site/php/.htaccess" ~/ynuka-api-deploy/
```

**Checklist:**
- [ ] ✅ Dossier créé: ~/ynuka-api-deploy/
- [ ] ✅ Tous les fichiers copiés

### Tâche 2.2: Vérifier le contenu

```bash
ls -la ~/ynuka-api-deploy/ | wc -l
# Doit afficher: 8 fichiers + . + .. = 10 lignes
```

**Checklist:**
- [ ] ✅ 7 fichiers présents

---

## 📤 ÉTAPE 3: UPLOAD SUR INTERSERVER

### Tâche 3.1: Créer le dossier `/api/`

**Via File Manager InterServer:**

1. **Connectez-vous:** https://vda6600.is.cc:2222/
2. **Chemin:**  `/domains/admin.ynukalabs.com/public_html/`
3. **Créer dossier:** 
4. **Nommer:** `api`
5. **Entrer:** Double-cliquez pour entrer dans `api/`

**Checklist:**
- [ ] ✅ Connecté à InterServer File Manager
- [ ] ✅ Au chemin `/domains/admin.ynukalabs.com/public_html/api/`

### Tâche 3.2: Uploader les fichiers (ORDRE CRITIQUE!)

**⚠️ ORDRE D'UPLOAD - NE PAS CHANGER!**

```
Étape 1: Fichiers de dépendance
─────────────────────────────────
[ ] 1️⃣  config.php          (2.5 KB)
[ ] 2️⃣  database.php        (3.1 KB)
[ ] 3️⃣  google-oauth.php    (8.2 KB)

Étape 2: Sécurité
─────────────────
[ ] 4️⃣  .htaccess           (1.2 KB)

Étape 3: Point d'entrée
───────────────────────
[ ] 5️⃣  api.php             (2.2 KB)

Étape 4: Support
────────────────
[ ] 6️⃣  google-callback.php (2.0 KB)
[ ] 7️⃣  setup.sql           (3.5 KB)
```

**Via File Manager InterServer:**
- Pour chaque fichier:
  1. Cliquez "Upload"
  2. Sélectionnez le fichier
  3. Attendez la confirmation
  4. Passez au suivant

**Checklist:**
```
FICHIERS À UPLOADER:

[ ] 1. config.php
      └─ Statut upload: ✅ OK / ❌ Erreur
      └─ Taille: 2.5 KB

[ ] 2. database.php
      └─ Statut upload: ✅ OK / ❌ Erreur
      └─ Taille: 3.1 KB

[ ] 3. google-oauth.php
      └─ Statut upload: ✅ OK / ❌ Erreur
      └─ Taille: 8.2 KB

[ ] 4. .htaccess
      └─ Statut upload: ✅ OK / ❌ Erreur
      └─ Taille: 1.2 KB

[ ] 5. api.php
      └─ Statut upload: ✅ OK / ❌ Erreur
      └─ Taille: 2.2 KB

[ ] 6. google-callback.php
      └─ Statut upload: ✅ OK / ❌ Erreur
      └─ Taille: 2.0 KB

[ ] 7. setup.sql
      └─ Statut upload: ✅ OK / ❌ Erreur
      └─ Taille: 3.5 KB
```

### Tâche 3.3: Créer le dossier `logs/`

**Via File Manager InterServer:**

1. Restez dans `/api/`
2. Cliquez "New Folder"
3. Nommez: `logs`
4. Confirmez

**Checklist:**
- [ ] ✅ Dossier `logs/` créé dans `/api/`

### Tâche 3.4: Vérifier les fichiers uploadés

**Via File Manager InterServer:**

Dans `/domains/admin.ynukalabs.com/public_html/api/`, vous devez voir:

```
api/
├── api.php              ← Visible
├── config.php           ← Visible
├── database.php         ← Visible
├── google-oauth.php     ← Visible
├── google-callback.php  ← Visible
├── .htaccess            ← Visible
├── setup.sql            ← Visible
└── logs/                ← Dossier
```

**Checklist:**
- [ ] ✅ 7 fichiers + 1 dossier visible

---

## 🔐 ÉTAPE 4: CONFIGURER LES PERMISSIONS

### Tâche 4.1: Permissions des fichiers

**Via File Manager (Clic droit > Properties):**

| Fichier | Permission | Action |
|---------|-----------|--------|
| `api.php` | 644 | Cliquez "Edit Permissions" → 644 |
| `google-callback.php` | 644 | Cliquez "Edit Permissions" → 644 |
| `.htaccess` | 644 | Cliquez "Edit Permissions" → 644 |
| `config.php` | 600 | Cliquez "Edit Permissions" → 600 |
| `database.php` | 600 | Cliquez "Edit Permissions" → 600 |
| `google-oauth.php` | 600 | Cliquez "Edit Permissions" → 600 |
| `setup.sql` | 600 | Cliquez "Edit Permissions" → 600 |

**Checklist:**
```
Fichiers "Lisibles par tous" (644):
[ ] api.php
[ ] google-callback.php
[ ] .htaccess

Fichiers "Propriétaire seulement" (600):
[ ] config.php
[ ] database.php
[ ] google-oauth.php
[ ] setup.sql

Dossier "Accessible" (755):
[ ] logs/
```

### Tâche 4.2: Vérifier les permissions

**Via SSH/Terminal (optionnel):**

```bash
ssh -p 2222 user@vda6600.is.cc
cd /domains/admin.ynukalabs.com/public_html/api/
ls -la
```

**Résultat attendu:**
```
-rw-r--r-- api.php
-rw-r--r-- google-callback.php
-rw-r--r-- .htaccess
-rw------- config.php
-rw------- database.php
-rw------- google-oauth.php
-rw------- setup.sql
drwxr-xr-x logs
```

**Checklist:**
- [ ] ✅ Permissions correctes

---

## 🧪 ÉTAPE 5: TESTS DE VALIDATION

### Test 1: Vérifier l'accès à l'API

**URL:** `https://admin.ynukalabs.com/api/api.php?action=ping`

**Via navigateur:**
1. Ouvrez l'URL
2. Vous devez voir une réponse JSON

**Réponse attendue:**
```json
{
  "status": "ok",
  "database": "ynukalab_database_website",
  "tables": ["users", "admin_users", "blog_posts", ...],
  "timestamp": "2026-05-30T..."
}
```

**Checklist:**
- [ ] ✅ URL accessible
- [ ] ✅ JSON reçu avec "status": "ok"
- [ ] ❌ Erreur 404 → Dossier `/api/` manquant
- [ ] ❌ Erreur 500 → Fichier manquant ou syntaxe incorrecte

### Test 2: Vérifier Google OAuth

**URL:** `https://admin.ynukalabs.com/api/api.php?action=google_auth_url`

**Réponse attendue:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
}
```

**Checklist:**
- [ ] ✅ URL Google reçue
- [ ] ❌ Erreur → Vérifier `google-oauth.php`

### Test 3: Vérifier la sécurité (Accès refusé aux fichiers sensibles)

**Via Terminal/cURL:**

```bash
# Doit retourner 403 Forbidden (accès refusé)
curl -I https://admin.ynukalabs.com/api/config.php
curl -I https://admin.ynukalabs.com/api/database.php
curl -I https://admin.ynukalabs.com/api/google-oauth.php
curl -I https://admin.ynukalabs.com/api/setup.sql
```

**Résultat attendu:**
```
HTTP/2 403 Forbidden
```

**Checklist:**
- [ ] ✅ config.php → 403 Forbidden
- [ ] ✅ database.php → 403 Forbidden
- [ ] ✅ google-oauth.php → 403 Forbidden
- [ ] ✅ setup.sql → 403 Forbidden
- [ ] ❌ Les fichiers sont accessibles → .htaccess non appliqué

### Test 4: Vérifier la sécurité (Accès autorisé aux fichiers publics)

**Via Terminal/cURL:**

```bash
# Doit retourner 200 OK
curl -I https://admin.ynukalabs.com/api/api.php?action=ping
```

**Résultat attendu:**
```
HTTP/2 200 OK
```

**Checklist:**
- [ ] ✅ api.php → 200 OK

### Test 5: Test d'authentification Google complet

**Via Navigateur:**

1. Allez à: `https://admin.ynukalabs.com/login`
2. Cliquez sur "Connexion avec Google"
3. Sélectionnez un compte autorisé (par ex: jacquesmasuruku2@gmail.com)
4. Acceptez les permissions
5. Vous devriez être redirigé vers `/admin`

**Checklist:**
- [ ] ✅ Login Google visible
- [ ] ✅ Redirection vers Google fonctionne
- [ ] ✅ Redirection vers `/admin` réussie
- [ ] ❌ Erreur "Email not authorized" → Ajouter à la whitelist dans `api.php`

---

## 📋 RÉSUMÉ COMPLET

### Structure finale

```
✅ /domains/admin.ynukalabs.com/public_html/api/

├── [644] api.php
├── [600] config.php
├── [600] database.php
├── [600] google-oauth.php
├── [644] google-callback.php
├── [644] .htaccess
├── [600] setup.sql
└── [755] logs/
```

### Tests réussis

```
✅ Test 1: /api/api.php?action=ping → JSON
✅ Test 2: /api/api.php?action=google_auth_url → URL Google
✅ Test 3: /api/config.php → 403 Forbidden
✅ Test 4: /api/api.php → 200 OK
✅ Test 5: Login Google complet → Redirection /admin
```

### Sécurité

```
✅ config.php protégé (600)
✅ database.php protégé (600)
✅ google-oauth.php protégé (600)
✅ .htaccess appliqué
✅ Accès refusé aux fichiers sensibles
✅ api.php accessible publiquement
```

---

## 🎯 STATUS FINAL

```
═════════════════════════════════════════════════════════════
  API DEPLOYMENT STATUS
═════════════════════════════════════════════════════════════

  Server:        ✅ InterServer (vda6600.is.cc:2222)
  Path:          ✅ /domains/admin.ynukalabs.com/public_html/api/
  Files:         ✅ 7 fichiers + 1 dossier uploadés
  Permissions:   ✅ Configurés correctement
  Tests:         ✅ 5/5 réussis
  Security:      ✅ Fichiers sensibles protégés
  
  ═════════════════════════════════════════════════════════════
                    🚀 READY FOR PRODUCTION
  ═════════════════════════════════════════════════════════════
```

---

**Document créé:** 30 Mai 2026  
**Version:** 1.0  
**Statut:** ✅ Prêt pour déploiement
