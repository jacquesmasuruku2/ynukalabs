# ✅ Vérification Configuration Base de Données Interserver

## 📋 Informations du serveur Interserver
```
Domaine: ynukalabs.com
Adresse IP: 205.209.109.3
Base de données: ynukalab_database_website
Utilisateur DB: ynukalab_admin-jacques
Mot de passe DB: Admin-Jacques.ynuka_db
```

## 🔧 Configuration API PHP

**Fichier**: `Panel Adm/php-api/api.php` (lignes 16-18)

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');
```

✅ **STATUT**: Correctement configuré pour accéder à votre base de données MySQL Interserver

---

## 🌐 URLs d'accès à l'API

### Panel Adm
- **Fichier env**: `Panel Adm/.env`
- **Valeur**: `VITE_API_URL="https://admin.ynukalabs.com/api.php"`
- **Fallback URLs**:
  - `https://admin.ynukalabs.com/api.php` (principal)
  - `https://admin.ynukalabs.com/api/api.php` (secours 1)
  - `https://admin.ynukalabs.com/api/api..php` (secours 2)

### Panel Admin
- **Fichier env**: `Panel Admin/ynuka-hub-main/.env`
- **Valeur**: `VITE_API_URL="https://admin.ynukalabs.com/api/api.php"`
- **Fallback URLs**:
  - `https://admin.ynukalabs.com/api/api.php` (principal)
  - `https://admin.ynukalabs.com/api.php` (secours 1)
  - `https://admin.ynukalabs.com/api/api..php` (secours 2)

---

## 📊 Tables supportées dans l'API

Les données seront stockées dans ces tables de `ynukalab_database_website`:

```
✓ users
✓ user_roles
✓ blog_posts
✓ blog_comments
✓ contact_messages
✓ donations
✓ events
✓ event_registrations
✓ gallery_images
✓ newsletter_subscribers
✓ projects
✓ resource_items
✓ team_members
```

---

## 🔐 Authentification JWT

**Secret**: Dans `api.php` ligne 19
```php
define('JWT_SECRET', 'CHANGE_ME_TO_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARS');
```

⚠️ **À FAIRE**: Avant mise en production, générer une clé sécurisée:
```bash
# Exemple de génération (Linux/Mac/PowerShell):
openssl rand -hex 32
```

---

## 🧪 Tests de vérification

### 1️⃣ Tester la connexion DB
```bash
curl "https://admin.ynukalabs.com/api.php?action=ping"
# Doit retourner:
# {
#   "db": "ok",
#   "tables": ["users", "user_roles", ..., "team_members"],
#   "message": "All systems nominal"
# }
```

### 2️⃣ Tester une requête authentifiée
```bash
# Se connecter d'abord avec email/password pour obtenir un token
curl -X POST "https://admin.ynukalabs.com/api.php?action=login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
# Doit retourner: { "token": "eyJ...", "user": {...} }
```

### 3️⃣ Vérifier depuis le navigateur
Accédez à `https://admin.ynukalabs.com/` et tentez une connexion:
- L'application va envoyer les credentials à l'API
- L'API va les valider contre la table `admin_users`
- Un JWT sera généré et stocké localement

---

## 📁 Flux de données

```
NAVIGATEUR (Panel Adm)
    ↓
    └→ Lit VITE_API_URL depuis .env
    └→ Envoie requête à https://admin.ynukalabs.com/api.php
    
NAVIGATEUR (Panel Admin)
    ↓
    └→ Lit VITE_API_URL depuis .env
    └→ Envoie requête à https://admin.ynukalabs.com/api/api.php
    
Serveur Interserver (api.php)
    ↓
    ├→ Lit constantes DB_HOST, DB_NAME, DB_USER, DB_PASS
    ├→ Se connecte à PDO:mysql://localhost/ynukalab_database_website
    ├→ Valide la requête (authentification JWT)
    ├→ Exécute la requête SQL
    └→ Retourne JSON au navigateur
```

---

## ✅ Checklist Déploiement

- [x] Credentials MySQL configurés dans `api.php`
- [x] URLs pointent vers `admin.ynukalabs.com`
- [x] Fichiers `.env` créés avec `VITE_API_URL`
- [x] Code migré de Supabase vers phpAuth/phpApi
- [x] Tables attendues listées dans `$ALLOWED_TABLES`
- [ ] ⚠️ JWT_SECRET changé en production (générer une clé sécurisée)
- [ ] ⚠️ setup.sql exécuté dans phpMyAdmin (pour créer table admin_users)
- [ ] ⚠️ Google OAuth configuré si utilisé (optionnel)
- [ ] ⚠️ Fichiers uploadés sur Interserver via FTP/DirectAdmin

---

## 🚀 Prochaines étapes

1. **Générer une clé JWT sécurisée** et l'ajouter à `api.php` ligne 19
2. **Uploader `api.php`** à `public_html/api.php` via FTP ou DirectAdmin
3. **Exécuter `setup.sql`** dans phpMyAdmin pour créer la table `admin_users`
4. **Tester**: Accéder à `https://admin.ynukalabs.com/api.php?action=ping`
5. **Déployer les frontends** (Panel Adm et Panel Admin build)

---

## 📞 Support

Pour des questions, consultez:
- Credentials Interserver: `GITHUB_SECRETS_SETUP.md`
- Configuration API: `Panel Adm/php-api/README.md`
- Migration docs: `MIGRATION_SUPABASE_TO_MYSQL.md`

