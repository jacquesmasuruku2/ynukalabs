# 📦 PACKAGE DÉPLOIEMENT COMPLET - Ynuka Labs
## 30 Mai 2026

---

## 🎯 FICHIERS À METTRE À JOUR SUR LE SERVEUR

### ✅ PHASE 1: API PHP (À uploader dans `/api/`)

**Fichiers modifiés/à jour:**

1. **`api.php`** ← ⭐ CORRIGÉ (ligne 124: requête PING fix)
   - Chemin local: `Ynuka Site/php/api.php`
   - Destination: `/domains/admin.ynukalabs.com/public_html/api/api.php`
   - Permissions: 644
   - **Statut:** ✅ Prêt

2. **`google-oauth.php`** ← ⭐ À JOUR avec vos credentials
   - Chemin local: `Ynuka Site/php/google-oauth.php`
   - Destination: `/domains/admin.ynukalabs.com/public_html/api/google-oauth.php`
   - Permissions: 600
   - **Statut:** ✅ Prêt
   - **Credentials dedans:**
     - Client ID: 1039734035041-3ob85lpfheoonvv43759desitdr7rhgc.apps.googleusercontent.com
     - Client Secret: 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

3. **`config.php`** ← INCHANGÉ (déjà bon)
   - Destination: `/domains/admin.ynukalabs.com/public_html/api/config.php`
   - Permissions: 600
   - **Statut:** ✅ Pas besoin de changer

4. **`database.php`** ← INCHANGÉ (déjà bon)
   - Destination: `/domains/admin.ynukalabs.com/public_html/api/database.php`
   - Permissions: 600
   - **Statut:** ✅ Pas besoin de changer

5. **`google-callback.php`** ← INCHANGÉ
   - Destination: `/domains/admin.ynukalabs.com/public_html/api/google-callback.php`
   - Permissions: 644
   - **Statut:** ✅ Pas besoin de changer

6. **`.htaccess`** ← À CRÉER/Mettre à jour
   - Chemin local: `Ynuka Site/php/.htaccess`
   - Destination: `/domains/admin.ynukalabs.com/public_html/api/.htaccess`
   - Permissions: 644
   - **Statut:** ✅ Prêt

### ✅ PHASE 2: Frontend React (À compiler et uploader)

**Build requis:**
```bash
cd "Panel Admin"
bun run build
# Crée le dossier dist/
```

**Fichiers à uploader:**
- Source: `Panel Admin/dist/*`
- Destination: `/domains/admin.ynukalabs.com/public_html/dist/*`
- **Statut:** ⏳ À compiler

---

## 📋 ÉTAPES DE DÉPLOIEMENT

### ÉTAPE 1: API PHP (30 min)

**Files à uploader (ORDRE IMPORTANT):**

```
1️⃣  google-oauth.php    (Upload d'abord - dépendance)
2️⃣  api.php             (Upload ensuite)
3️⃣  .htaccess           (Sécurité)
4️⃣  google-callback.php (Support)
```

**Via InterServer File Manager:**
1. Allez à: `/domains/admin.ynukalabs.com/public_html/api/`
2. Pour chaque fichier:
   - Cliquez "Upload"
   - Sélectionnez le fichier local
   - Attendez la confirmation
   - Passez au suivant

**Vérification après upload:**
```bash
curl https://admin.ynukalabs.com/api/api.php?action=ping
# ← Doit retourner JSON avec les tables
```

### ÉTAPE 2: Frontend React (20 min)

**Compiler localement:**
```bash
cd "Panel Admin"
bun run build
# Dossier dist/ créé
```

**Upload du dossier dist:**
1. Via File Manager ou SCP
2. Destination: `/domains/admin.ynukalabs.com/public_html/dist/`
3. Remplacez le contenu existant

**Vérification:**
```bash
# Doit charger la page
curl https://admin.ynukalabs.com/
```

---

## 🔍 FICHIERS LOCAUX À PRÉPARER

### Pour uploader manuellement:

```
📁 Préparation locale
├── 📄 api.php              (Ynuka Site/php/api.php)
├── 📄 google-oauth.php     (Ynuka Site/php/google-oauth.php)
├── 📄 .htaccess            (Ynuka Site/php/.htaccess)
├── 📄 google-callback.php  (Ynuka Site/php/google-callback.php)
└── 📁 dist/                (Panel Admin/dist/ après compilation)
    ├── index.html
    ├── assets/
    └── ...
```

---

## ✅ CHECKLIST PRÉ-DÉPLOIEMENT

```
[ ] PHASE 1: API PHP
    [ ] Fichier api.php prêt (local)
    [ ] Fichier google-oauth.php prêt (local)
    [ ] Fichier .htaccess prêt (local)
    [ ] Fichier google-callback.php prêt (local)
    
    [ ] Dossier /api/ existe sur le serveur
    [ ] Permissions configurées après upload

[ ] PHASE 2: Frontend
    [ ] Commande `bun run build` exécutée
    [ ] Dossier dist/ créé avec fichiers
    [ ] Dossier dist/ uploadé sur le serveur
    
[ ] TESTS POST-UPLOAD
    [ ] curl .../api/api.php?action=ping ← JSON
    [ ] curl .../api/api.php?action=google_auth_url ← URL Google
    [ ] https://admin.ynukalabs.com/ ← Page charge
    [ ] https://admin.ynukalabs.com/login ← Bouton Google visible
```

---

## 🚀 COMMANDES RAPIDES

### Compiler le frontend
```bash
cd "Panel Admin"
bun install  # Si besoin
bun run build
```

### Vérifier les fichiers locaux
```bash
# Vérifier que les fichiers existent
ls -la "Ynuka Site/php/api.php"
ls -la "Ynuka Site/php/google-oauth.php"
ls -la "Ynuka Site/php/.htaccess"

# Vérifier le build
ls -la "Panel Admin/dist/"
```

### Tester après upload
```bash
# Test API
curl https://admin.ynukalabs.com/api/api.php?action=ping

# Test Google OAuth
curl https://admin.ynukalabs.com/api/api.php?action=google_auth_url

# Test Frontend
curl https://admin.ynukalabs.com/login
```

---

## 📊 RÉSUMÉ DES CHANGEMENTS

| Fichier | Type | Change | Status |
|---------|------|--------|--------|
| `api.php` | PHP | Correction ligne 124 | ✅ Prêt |
| `google-oauth.php` | PHP | Credentials dedans | ✅ Prêt |
| `.htaccess` | Config | Nouveau/À jour | ✅ Prêt |
| `google-callback.php` | PHP | Inchangé | ✅ Prêt |
| `config.php` | PHP | Inchangé | ✅ Prêt |
| `database.php` | PHP | Inchangé | ✅ Prêt |
| `dist/*` | Frontend | À compiler | ⏳ À faire |

---

## 🎯 STATUT FINAL

```
═════════════════════════════════════════════════════════════
  DÉPLOIEMENT READY STATUS
═════════════════════════════════════════════════════════════

  API FILES:           ✅ Tous prêts
  Frontend Build:      ⏳ À compiler
  Configuration:       ✅ OK
  Documentation:       ✅ Complète
  
  NEXT STEP:           👉 Compiler Panel Admin + Upload
═════════════════════════════════════════════════════════════
```

---

**Date:** 30 Mai 2026  
**Prêt pour:** Déploiement complet
