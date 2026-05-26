# 🎯 Résumé: Configuration Interserver & Flux de Données

## Vue d'ensemble complète

```
┌─────────────────────────────────────────────────────────────────┐
│                     UTILISATEUR EN LIGNE                         │
└────────────┬────────────────────────────────────────────────────┘
             │
      ┌──────▼──────┐
      │ Navigateur  │
      │ Admin Panel │
      └──────┬──────┘
             │
     ┌───────▼────────┐
     │ Lit .env file: │
     │ VITE_API_URL   │
     └───────┬────────┘
             │
  Panel Adm: https://admin.ynukalabs.com/api.php
  Panel Admin: https://admin.ynukalabs.com/api/api.php
             │
      ┌──────▼──────────────────────────┐
      │   Serveur Interserver           │
      │   ynukalabs.com (205.209.109.3) │
      │                                  │
      │   public_html/                   │
      │   └── api.php                    │
      │                                  │
      │   (Reçoit requête HTTP/HTTPS)   │
      └──────┬───────────────────────────┘
             │
      ┌──────▼───────────────────────────────┐
      │  api.php lit constantes (lignes 16-19):│
      │                                        │
      │  DB_HOST = localhost                  │
      │  DB_NAME = ynukalab_database_website  │
      │  DB_USER = ynukalab_admin-jacques     │
      │  DB_PASS = Admin-Jacques.ynuka_db     │
      │  JWT_SECRET = [CLÉR GÉNÉRÉE]          │
      └──────┬────────────────────────────────┘
             │
      ┌──────▼────────────────────┐
      │   PDO Connection MySQL    │
      │   Serveur Interserver     │
      │   localhost:3306          │
      │   ynukalab_database_website│
      └──────┬────────────────────┘
             │
      ┌──────▼────────────────────────┐
      │   Tables MySQL:               │
      │   ├── users                  │
      │   ├── user_roles             │
      │   ├── blog_posts             │
      │   ├── blog_comments          │
      │   ├── contact_messages       │
      │   ├── donations              │
      │   ├── events                 │
      │   ├── event_registrations    │
      │   ├── gallery_images         │
      │   ├── newsletter_subscribers  │
      │   ├── projects               │
      │   ├── resource_items         │
      │   └── team_members           │
      └────────────────────────────────┘
```

---

## ✅ Vérification Configuration Actuelle

### 1. Base de données Interserver
| Élément | Valeur | Statut |
|---------|--------|--------|
| **Host** | localhost | ✅ En place |
| **Base** | ynukalab_database_website | ✅ En place |
| **Utilisateur** | ynukalab_admin-jacques | ✅ En place |
| **Mot de passe** | Admin-Jacques.ynuka_db | ✅ En place |

### 2. Fichiers Configuration

```
Panel Adm/.env:
✅ VITE_API_URL="https://admin.ynukalabs.com/api.php"

Panel Admin/ynuka-hub-main/.env:
✅ VITE_API_URL="https://admin.ynukalabs.com/api/api.php"

Panel Adm/php-api/api.php:
✅ DB_HOST, DB_NAME, DB_USER, DB_PASS (lignes 16-18)
⚠️  JWT_SECRET (ligne 19) - À GÉNÉRER avant déploiement
```

### 3. Code Frontend

```
Panel Adm/src/lib/php-auth.ts:
✅ Utilise import.meta.env.VITE_API_URL
✅ Implémente phpAuth.signInWithPassword()

Panel Adm/src/lib/php-api.ts:
✅ Utilise phpAuth pour les headers Authorization
✅ Implémente CRUD: list, get, create, update, delete

Routes migrées:
✅ admin.tsx (authentification)
✅ admin.index.tsx (dashboard)
✅ admin.blog_posts.tsx
✅ AdminUserMenu.tsx
```

---

## 🔄 Flux d'une requête CRUD

### Exemple: Créer un nouvel article

**1. Utilisateur dans Panel Adm**
```
Clique "Nouvel article"
```

**2. Frontend appelle phpApi**
```javascript
await phpApi.create("blog_posts", {
  title: "Mon article",
  content: "...",
  published: true
});
```

**3. phpApi construit la requête**
```javascript
fetch("https://admin.ynukalabs.com/api.php", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJ...[JWT token]..."
  },
  body: JSON.stringify({
    action: "create",
    table: "blog_posts",
    data: {
      title: "Mon article",
      content: "...",
      published: true
    }
  })
})
```

**4. api.php reçoit la requête**
```php
// api.php ligne ~200
if ($action === 'create') {
    $user = require_auth();  // Vérifie JWT
    $table = $_POST['table'];
    $data = $_POST['data'];
    
    // Valide la table dans $ALLOWED_TABLES
    // Exécute: INSERT INTO blog_posts (...) VALUES (...)
    // Retourne: { "id": 123 }
}
```

**5. Les données sont insérées**
```sql
INSERT INTO ynukalab_database_website.blog_posts 
(title, content, published, created_at) 
VALUES ('Mon article', '...', 1, NOW())
```

**6. Frontend affiche le résultat**
```
Article créé avec succès! ID: 123
```

---

## 🔒 Sécurité JWT

### Authentification par Token

```
1. CONNEXION
   POST /api.php?action=login
   { email: "admin@...", password: "..." }
   
   Réponse: { token: "eyJ...", user: {...} }

2. STOCKAGE LOCAL
   localStorage.setItem("auth_token", token)

3. REQUÊTES FUTURES
   GET /api.php?action=list&table=users
   Authorization: Bearer eyJ...
   
4. VÉRIFICATION SUR SERVER
   - Vérifie la signature JWT avec JWT_SECRET
   - Si valide → exécute la requête
   - Si invalide → erreur 401 Unauthorized
```

### Points clés:
- ⚠️ **JWT_SECRET** doit être très sécurisé (32+ caractères)
- ⚠️ Le token a une durée de vie (à configurer)
- ✅ Stocké en localStorage (accessible au JS uniquement)
- ✅ Envoyé à chaque requête en header Authorization

---

## 📱 Déploiement Multi-Application

### Panel Adm
- **URL**: https://admin.ynukalabs.com/
- **API**: https://admin.ynukalabs.com/api.php
- **Utilisation**: Gestion administrative complète

### Panel Admin
- **URL**: À déployer
- **API**: https://admin.ynukalabs.com/api/api.php (avec fallback à /api.php)
- **Utilisation**: Version alternative de l'admin

### Ynuka Site (Public)
- **URL**: https://ynukalabs.com/
- **API**: Supabase (pas migré)
- **Utilisation**: Site public

---

## 🎯 Points Critiques à Vérifier Avant Production

✅ **Fait**:
- [x] Credentials MySQL configurés correctement
- [x] VITE_API_URL défini dans les fichiers .env
- [x] Code migré de Supabase vers phpAuth/phpApi
- [x] Supabase/Lovable supprimés du code

⚠️ **À faire**:
- [ ] Générer JWT_SECRET sécurisé (32+ caractères)
- [ ] Uploader api.php sur Interserver
- [ ] Exécuter setup.sql dans phpMyAdmin
- [ ] Créer utilisateur admin initial
- [ ] Tester l'endpoint ping: https://admin.ynukalabs.com/api.php?action=ping
- [ ] Tester la connexion avec un utilisateur admin
- [ ] Déployer les builds de Panel Adm et Panel Admin
- [ ] Vérifier les permissions de fichiers (644 pour api.php)
- [ ] Configurer Google OAuth si utilisé
- [ ] Activer HTTPS (normalement déjà en place sur Interserver)

---

## 📞 Ressources

| Fichier | Contenu |
|---------|---------|
| DATABASE_CONFIG_VERIFICATION.md | Cette vérification |
| DEPLOYMENT_GUIDE_INTERSERVER.md | Guide complet de déploiement |
| Panel Adm/php-api/api.php | Code API backend |
| Panel Adm/php-api/setup.sql | Script création tables |
| Panel Adm/php-api/README.md | Documentation API |

---

**Status**: ✅ Configuration correcte - Prêt pour déploiement

