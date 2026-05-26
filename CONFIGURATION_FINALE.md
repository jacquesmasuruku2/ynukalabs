# 🎯 Configuration finalisée - admin.ynukalabs.com

## État actuel ✅

Votre domaine a été configuré dans tous les fichiers :

### Domaine configuré
- **Domaine principal** : `ynukalabs.com`
- **Sous-domaine panel admin** : `admin.ynukalabs.com`
- **API endpoint** : `https://admin.ynukalabs.com/api.php`

### Fichiers configurés
| Fichier | Configuration |
|---------|---|
| `Panel Adm/.env` | `VITE_API_URL=https://admin.ynukalabs.com/api.php` |
| `Panel Admin/ynuka-hub-main/.env` | `VITE_API_URL=https://admin.ynukalabs.com/api.php` |
| `Panel Adm/php-api/api.php` | Google OAuth + domaines |
| `Panel Admin/ynuka-hub-main/php-api/api.php` | Google OAuth + domaines |

## Prochaines étapes

### 1️⃣ Uploader l'API PHP sur Interserver

Vous devez uploader **UN SEUL** `api.php` à la racine du sous-domaine :
```
Interserver → public_html du sous-domaine admin.ynukalabs.com → api.php
```

L'URL finale sera : `https://admin.ynukalabs.com/api.php`

### 2️⃣ Tester l'API

```bash
# Doit retourner "db": "ok" si la connection MySQL est bonne
curl "https://admin.ynukalabs.com/api.php?action=ping"
```

### 3️⃣ Créer au moins un administrateur

Dans phpMyAdmin :
```sql
-- 1. Générer le hash du mot de passe:
-- php -r 'echo password_hash("VotreMotDePasse123", PASSWORD_BCRYPT);'

INSERT INTO admin_users (email, password_hash, name) VALUES 
('votre_email@example.com', '$2y$10$HASH_GENERE_CI_DESSUS', 'Votre Nom');
```

### 4️⃣ Générer une clé JWT sécurisée

```bash
# Terminal/PowerShell
php -r 'echo base64_encode(random_bytes(32));'
```

Copier la clé générée et remplacer dans `Panel Adm/php-api/api.php` ligne 19:
```php
define('JWT_SECRET', 'VOTRE_CLE_GENEREE_CI_DESSUS');
```

## Architecteur déployée

```
ynukalabs.com (site public - Supabase)
│
└── admin.ynukalabs.com (panel admin - MySQL)
    ├── /api.php → API REST MySQL + JWT
    │   ├── Authentification (login, Google OAuth)
    │   ├── CRUD: users, user_roles, blog_posts, etc.
    │   └── JWT tokens (7 jours)
    │
    └── Fichiers React/Vite
        ├── login.tsx → phpAuth
        ├── admin.tsx → phpAuth
        └── admin.roles.tsx → phpApi
```

## Variables d'environnement (prêtes)

Vous n'avez RIEN à ajouter - tout est déjà configuré dans les `.env` :

```bash
# Panel Adm/.env
VITE_API_URL=https://admin.ynukalabs.com/api.php

# Panel Admin/ynuka-hub-main/.env  
VITE_API_URL=https://admin.ynukalabs.com/api.php
```

## Important: Sécurité

- ⚠️ Le JWT_SECRET doit être **unique et sécurisé** (32+ caractères aléatoires)
- ⚠️ N'envoyez JAMAIS le `api.php` par email ou GitHub
- ⚠️ Utilisez HTTPS (Interserver le fait automatiquement)
- ⚠️ Limitez les emails Google autorisés (`ALLOWED_GOOGLE_EMAILS`)

## En cas de problème

- ❌ **401 Unauthorized** → Token expiré (7 jours) = reconnecter
- ❌ **"db": "error"** → Vérifier identifiants MySQL dans `api.php`
- ❌ **Pas de réponse** → Vérifier que `api.php` est bien uploadé à `https://admin.ynukalabs.com/api.php`
- ❌ **Gmail autoprovisioning ne marche pas** → Ajouter votre email à `ALLOWED_GOOGLE_EMAILS`

## Checklist avant déploiement

- [ ] JWT_SECRET changé (32+ chars)
- [ ] Admin user créé dans `admin_users`
- [ ] `api.php` uploadé sur Interserver
- [ ] `/api.php?action=ping` retourne `"db": "ok"`
- [ ] Login fonctionne depuis `admin.ynukalabs.com`
- [ ] Google OAuth configuré (optionnel)

---

**État** : ✅ Configuration 100% prête. Il ne reste que le déploiement sur Interserver!

