# 🚀 DÉPLOIEMENT FINAL - Ynuka Labs
## 30 Mai 2026 - Prêt pour Production

---

## ✅ FICHIERS PRÊTS À UPLOADER

### 📁 Structure des fichiers à uploader

```
PRÊTS POUR UPLOAD:
════════════════════════════════════════════

API FILES (vers /domains/admin.ynukalabs.com/public_html/api/):
├── ✅ api.php                    (MODIFIÉ - correction PING)
├── ✅ google-oauth.php           (À JOUR - credentials inside)
├── ✅ .htaccess                  (NOUVEAU - sécurité)
├── ✅ google-callback.php        (À JOUR - inchangé)
├── ✅ config.php                 (À JOUR - inchangé)
├── ✅ database.php               (À JOUR - inchangé)
└── ✅ logs/                      (Dossier - création manuelle)

FRONTEND FILES (vers /domains/admin.ynukalabs.com/public_html/dist/):
├── ✅ index.html                 (COMPILÉ)
├── ✅ favicon.svg                (COMPILÉ)
└── ✅ assets/                    (COMPILÉ)
    ├── index-DvMT4dy4.css        (118.61 KB)
    ├── index-BTmYLfNf.js         (1,027.95 KB)
    └── logo-CyN_VOl5.jpg         (320.16 KB)
```

---

## 📍 LOCALISATION DES FICHIERS LOCAUX

### Sur votre ordinateur:

```
API FILES:
d:\Site-Ynukalabs\Ynuka Site\php\
├── api.php                 ← À copier
├── google-oauth.php        ← À copier
├── .htaccess               ← À copier (NOUVEAU)
├── google-callback.php     ← À copier
├── config.php              ← À copier
└── database.php            ← À copier

FRONTEND FILES:
d:\Site-Ynukalabs\Panel Admin\dist\
├── index.html              ← À copier (tout le dossier)
├── favicon.svg             ← À copier
└── assets/                 ← À copier
    ├── index-DvMT4dy4.css
    ├── index-BTmYLfNf.js
    └── logo-CyN_VOl5.jpg
```

---

## 🎯 PLAN DE DÉPLOIEMENT ÉTAPE PAR ÉTAPE

### ÉTAPE 1: Préparer le dossier de déploiement local

```bash
# Créer un dossier de staging
mkdir -p ~/ynuka-final-deploy

# Copier les fichiers API
cp "d:\Site-Ynukalabs\Ynuka Site\php\api.php" ~/ynuka-final-deploy/
cp "d:\Site-Ynukalabs\Ynuka Site\php\google-oauth.php" ~/ynuka-final-deploy/
cp "d:\Site-Ynukalabs\Ynuka Site\php\.htaccess" ~/ynuka-final-deploy/
cp "d:\Site-Ynukalabs\Ynuka Site\php\google-callback.php" ~/ynuka-final-deploy/
cp "d:\Site-Ynukalabs\Ynuka Site\php\config.php" ~/ynuka-final-deploy/
cp "d:\Site-Ynukalabs\Ynuka Site\php\database.php" ~/ynuka-final-deploy/

# Copier le frontend compilé
cp -r "d:\Site-Ynukalabs\Panel Admin\dist" ~/ynuka-final-deploy/

# Vérifier
ls -la ~/ynuka-final-deploy/
```

### ÉTAPE 2: Uploader les fichiers API sur InterServer

**Via File Manager InterServer (https://vda6600.is.cc:2222/):**

1. **Naviguer vers:** `/domains/admin.ynukalabs.com/public_html/api/`

2. **Upload des fichiers (ORDRE IMPORTANT):**

   ```
   1️⃣  google-oauth.php        Upload
   2️⃣  config.php              Upload
   3️⃣  database.php            Upload
   4️⃣  api.php                 Upload
   5️⃣  google-callback.php     Upload
   6️⃣  .htaccess               Upload
   ```

3. **Vérifier les fichiers uploadés:**
   ```
   ✅ Tous les 6 fichiers visibles dans /api/
   ```

### ÉTAPE 3: Définir les permissions des fichiers API

**Via File Manager (Clic droit > Properties > Edit Permissions):**

| Fichier | Permission | Valeur |
|---------|-----------|--------|
| `api.php` | Lisible par tous | 644 |
| `google-callback.php` | Lisible par tous | 644 |
| `.htaccess` | Lisible par tous | 644 |
| `config.php` | Propriétaire seulement | 600 |
| `database.php` | Propriétaire seulement | 600 |
| `google-oauth.php` | Propriétaire seulement | 600 |

### ÉTAPE 4: Créer le dossier logs (optionnel)

**Via File Manager:**
1. Cliquez "New Folder"
2. Nommez: `logs`
3. Permissions: 755

### ÉTAPE 5: Uploader le frontend React

**Via File Manager InterServer:**

1. **Naviguer vers:** `/domains/admin.ynukalabs.com/public_html/`

2. **Uploader le dossier `dist`:**
   - Cliquez "Upload"
   - Sélectionnez le dossier `dist` entier
   - (Ou upload les fichiers individuels)

3. **Vérifier la structure:**
   ```
   /domains/admin.ynukalabs.com/public_html/dist/
   ├── index.html              ✅
   ├── favicon.svg             ✅
   └── assets/                 ✅
       ├── index-DvMT4dy4.css
       ├── index-BTmYLfNf.js
       └── logo-CyN_VOl5.jpg
   ```

---

## 🧪 TESTS POST-DÉPLOIEMENT

### Test 1: Vérifier l'API (via terminal/curl)

```bash
# Test 1: Ping
curl https://admin.ynukalabs.com/api/api.php?action=ping

# Résultat attendu: JSON avec les tables
{
  "status": "ok",
  "database": "ynukalab_database_website",
  "tables": ["users", "admin_users", "blog_posts", ...],
  "timestamp": "2026-05-30..."
}
```

✅ **SUCCESS** = Vous voyez les vrais noms de tables

### Test 2: Vérifier Google OAuth

```bash
# Test 2: Google Auth URL
curl https://admin.ynukalabs.com/api/api.php?action=google_auth_url

# Résultat attendu: URL Google
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
}
```

✅ **SUCCESS** = Vous recevez une URL Google valide

### Test 3: Vérifier la sécurité des fichiers

```bash
# Test 3a: config.php doit être refusé (403)
curl -I https://admin.ynukalabs.com/api/config.php
# HTTP/2 403 Forbidden ✅

# Test 3b: api.php doit être accessible (200)
curl -I https://admin.ynukalabs.com/api/api.php
# HTTP/2 200 OK ✅
```

✅ **SUCCESS** = .htaccess fonctionne correctement

### Test 4: Vérifier le frontend

```bash
# Test 4: Charger la page publique
curl https://admin.ynukalabs.com/

# Doit retourner le HTML du fichier index.html compilé
```

✅ **SUCCESS** = Page React charge correctement

### Test 5: Vérifier la page de login

**Via navigateur:**
1. Allez à: `https://admin.ynukalabs.com/login`
2. Vous devez voir le bouton "Connexion avec Google"
3. Cliquez dessus
4. Vous êtes redirigé vers Google

✅ **SUCCESS** = Login Google fonctionne

### Test 6: Tester la newsletter (via curl)

```bash
curl -X POST "https://admin.ynukalabs.com/api/api.php?action=create&resource=newsletter_subscribers" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "active": 1
  }'

# Résultat attendu:
{
  "data": {
    "email": "test@example.com",
    "name": "Test User",
    "active": 1,
    "subscribed_at": "2026-05-30 10:00:00",
    "updated_at": "2026-05-30 10:00:00",
    "id": 1
  },
  "success": true,
  "id": 1,
  "message": "Created successfully"
}
```

✅ **SUCCESS** = API insert fonctionne

---

## ✅ CHECKLIST FINAL

```
AVANT DÉPLOIEMENT:
[ ] Tous les fichiers locaux copiés et vérifiés
[ ] Frontend compilé (dist/ créé)
[ ] Fichiers API prêts

DÉPLOIEMENT API:
[ ] 6 fichiers uploadés dans /api/
[ ] Permissions correctes (644 et 600)
[ ] Dossier logs/ créé

DÉPLOIEMENT FRONTEND:
[ ] Dossier dist/ uploadé dans /public_html/
[ ] Fichier index.html présent
[ ] Assets présents

TESTS POST-DÉPLOIEMENT:
[ ] Test 1: /api/api.php?action=ping ← JSON tables
[ ] Test 2: /api/api.php?action=google_auth_url ← URL Google
[ ] Test 3: /api/config.php ← 403 Forbidden
[ ] Test 4: https://admin.ynukalabs.com/ ← Page charge
[ ] Test 5: https://admin.ynukalabs.com/login ← Button Google
[ ] Test 6: POST newsletter ← success: true

MONITORING:
[ ] Logs vérifiés (pas d'erreurs critiques)
[ ] Base de données connectée
[ ] Authentification Google fonctionne
```

---

## 🔧 RÉSOLUTION DE PROBLÈMES

### Erreur 404 sur l'API
**Cause:** Les fichiers ne sont pas dans `/api/`  
**Solution:** Vérifier le chemin complet sur le serveur

### Erreur 403 sur api.php
**Cause:** Les permissions sont incorrectes  
**Solution:** Définir les permissions à 644 pour api.php

### Erreur "Database connection failed"
**Cause:** config.php n'est pas correct  
**Solution:** Vérifier que config.php contient les bonnes credentials BD

### Erreur "Unknown column 'subscribed'"
**Cause:** Le test utilise la mauvaise colonne  
**Solution:** Utiliser `"active": 1` au lieu de `"subscribed": 1`

### Frontend ne charge pas
**Cause:** Le dossier dist/ n'est pas au bon endroit  
**Solution:** Vérifier que dist/ est dans `/public_html/` pas `/api/`

---

## 📊 RÉSUMÉ DES FICHIERS

| Fichier | Taille | Location | Type |
|---------|--------|----------|------|
| api.php | 2.2 KB | /api/ | PHP (MODIFIÉ) |
| google-oauth.php | 8.2 KB | /api/ | PHP (À JOUR) |
| .htaccess | 1.2 KB | /api/ | Config (NOUVEAU) |
| google-callback.php | 2.0 KB | /api/ | PHP (À JOUR) |
| config.php | 2.5 KB | /api/ | PHP (À JOUR) |
| database.php | 3.1 KB | /api/ | PHP (À JOUR) |
| index.html | 0.87 KB | /dist/ | Frontend (COMPILÉ) |
| index-DvMT4dy4.css | 118.61 KB | /dist/assets/ | Frontend (COMPILÉ) |
| index-BTmYLfNf.js | 1,027.95 KB | /dist/assets/ | Frontend (COMPILÉ) |
| logo-CyN_VOl5.jpg | 320.16 KB | /dist/assets/ | Image (COMPILÉ) |

---

## 🎯 STATUT FINAL

```
═════════════════════════════════════════════════════════════
           ✅ DÉPLOIEMENT FINAL PRÊT ✅
═════════════════════════════════════════════════════════════

  API FILES:              ✅ Compilés & prêts
  Frontend Build:         ✅ Généré (dist/)
  Configuration:          ✅ Vérifiée
  Documentation:          ✅ Complète
  
  ÉTAPES SUIVANTES:
  1. Uploader les fichiers API
  2. Uploader le dossier dist/
  3. Tester les 6 tests de validation
  4. Vérifier les logs
  5. 🚀 PRODUCTION READY!
═════════════════════════════════════════════════════════════
```

---

**Date:** 30 Mai 2026  
**Version:** 1.0 - FINAL  
**Status:** ✅ Prêt pour déploiement production
