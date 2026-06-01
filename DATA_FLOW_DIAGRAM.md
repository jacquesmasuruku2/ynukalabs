# 📊 Schéma Complet: Où Vont Vos Données?

## 🔍 Chaque requête est tracée ainsi:

### 1️⃣ UTILISATEUR saisit "Mon Article" dans Panel Adm

```
┌──────────────────────────────────────┐
│      Panel Adm (Frontend)            │
│  https://admin.ynukalabs.com/        │
│                                      │
│  [Formulaire: Créer Article]         │
│  Titre: "Mon Article"                │
│  Contenu: "Ceci est mon article"     │
│  Publié: true                        │
└──────────────────────────────────────┘
                │
                ▼
```

### 2️⃣ FRONTEND lit VITE_API_URL depuis .env

```
┌──────────────────────────────────────────┐
│  Panel Adm/.env                          │
│  ═════════════════════════════════════  │
│  VITE_API_URL="https://admin.ynukalabs.  │
│               com/api.php"               │
└──────────────────────────────────────────┘
                │
                ▼
              ✓ URL cible trouvée
```

### 3️⃣ JAVASCRIPT appelle phpApi.create()

```javascript
// Panel Adm/src/lib/php-api.ts, ligne ~40
await phpApi.create("blog_posts", {
  title: "Mon Article",
  content: "Ceci est mon article",
  published: true
});
```

**Ce qui se passe**:
```
✓ Récupère le token JWT depuis localStorage
✓ Construit header Authorization: Bearer [token]
✓ Fait une requête POST à https://admin.ynukalabs.com/api.php
✓ Envoie les données en JSON
```

### 4️⃣ RÉSEAU - La requête voyage vers Interserver

```
┌────────────────────────────────────────┐
│  Requête HTTP POST                     │
├────────────────────────────────────────┤
│  URL: https://admin.ynukalabs.com/     │
│       api.php                          │
│                                        │
│  Headers:                              │
│  ├── Content-Type: application/json    │
│  └── Authorization: Bearer eyJ...      │
│                                        │
│  Body:                                 │
│  {                                     │
│    "action": "create",                 │
│    "table": "blog_posts",              │
│    "data": {                           │
│      "title": "Mon Article",           │
│      "content": "...",                 │
│      "published": true                 │
│    }                                   │
│  }                                     │
└────────────────────────────────────────┘
       │
       │ Voyage par Internet
       │ jusqu'à IP 205.209.109.3
       ▼
```

### 5️⃣ SERVEUR Interserver reçoit (public_html/api.php)

```
┌──────────────────────────────────────────────────────┐
│  Serveur Interserver                                 │
│  Domaine: ynukalabs.com                              │
│  IP: 205.209.109.3                                   │
│  Répertoire: public_html/                            │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  api.php (le fichier qu'on va uploader)       │ │
│  │                                                │ │
│  │  Reçoit la requête POST                       │ │
│  │  Valide le token JWT                          │ │
│  │  Extrait les données                          │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
                │
                ▼
```

### 6️⃣ API.PHP lit les CONSTANTES (lignes 16-19)

```php
// Panel Adm/php-api/api.php

define('DB_HOST',     'localhost');                    // Ligne 16
define('DB_NAME',     'ynukalab_database_website');    // Ligne 17
define('DB_USER',     'ynukalab_admin-jacques');       // Ligne 18
define('DB_PASS',     'Admin-Jacques.ynuka_db');       // Ligne 19
define('JWT_SECRET',  'YOUR_KEY_HERE_MIN_32_CHARS');  // À générer!
```

**Les constantes disent**: 
- "Connecte-toi à la base `ynukalab_database_website`"
- "Utilise l'utilisateur `ynukalab_admin-jacques`"
- "Avec le mot de passe `Admin-Jacques.ynuka_db`"
- "Le serveur est sur `localhost` (même machine)"

### 7️⃣ CONNEXION à MySQL

```
┌──────────────────────────────────────┐
│  api.php crée une connexion PDO      │
├──────────────────────────────────────┤
│  new PDO(                            │
│    'mysql:host=localhost;            │
│     dbname=ynukalab_database_website │
│     ;charset=utf8mb4',               │
│    'ynukalab_admin-jacques',         │
│    'Admin-Jacques.ynuka_db'          │
│  )                                   │
└──────────────────────────────────────┘
          │
          │ Se connecte au service MySQL
          │ sur le même serveur (localhost)
          │
          ▼
    ┌─────────────────────┐
    │   MySQL 5.7 ou 8.0  │
    │   Interserver       │
    └─────────────────────┘
```

### 8️⃣ EXÉCUTION de la requête SQL

```sql
-- api.php exécute cette requête:

INSERT INTO ynukalab_database_website.blog_posts
  (title, content, published, created_at)
VALUES
  ('Mon Article', 'Ceci est mon article', 1, NOW())

-- ✓ 1 ligne insérée
-- ✓ ID généré: 42 (auto-increment)
```

### 9️⃣ DONNÉES INSÉRÉES dans la table

```
Table: ynukalab_database_website.blog_posts
═════════════════════════════════════════════════════════════════

id | title      | content              | published | created_at
──────────────────────────────────────────────────────────────
... | ...        | ...                  | ...       | ...
42 | Mon Article| Ceci est mon article | 1         | 2026-05-25 14:30:42
... | ...        | ...                  | ...       | ...
```

### 🔟 RÉPONSE JSON retournée au frontend

```json
{
  "id": 42,
  "message": "Article créé avec succès",
  "code": 200
}
```

### 1️⃣1️⃣ FRONTEND affiche le succès

```
┌──────────────────────────────────────┐
│      Panel Adm (Frontend)            │
│  https://admin.ynukalabs.com/        │
│                                      │
│  ✓ Article créé avec succès!         │
│    ID: 42                            │
│                                      │
│  La liste s'actualise et affiche:    │
│  "Mon Article" (créé il y a 2 sec)   │
└──────────────────────────────────────┘
```

---

## 🔐 Sécurité: Ce qui protège cette chaîne

| Étape | Protection | Details |
|-------|-----------|---------|
| **Frontend → Réseau** | HTTPS | Chiffrement SSL/TLS |
| **Token JWT** | Signature HMAC-SHA256 | Signé avec JWT_SECRET |
| **Authentification** | Bearer Token | Vérifié à chaque requête |
| **SQL** | Prepared Statements | Protection contre les injections |
| **Base de données** | Credentials séparés | User avec permissions limitées |
| **CORS** | Whitelist Origins | Autorise seulement vos domaines |

---

## 🎯 Flux Alternatif: Panel Admin

Le même processus, mais avec une URL légèrement différente:

```javascript
// Panel Admin utilise:
VITE_API_URL = "https://admin.ynukalabs.com/api/api.php"

// Avec fallback intelligent:
// 1. Essaie https://admin.ynukalabs.com/api/api.php
// 2. Essaie https://admin.ynukalabs.com/api.php
// 3. Essaie https://admin.ynukalabs.com/api/api..php
```

Tout converge vers le **même fichier api.php** et la **même base de données**.

---

## 🧐 Vérification: D'où viennent les données?

**Question**: "Où vont exactement mes données?"

**Réponse**:
```
Panel Adm/Panel Admin
    ↓
https://admin.ynukalabs.com/api.php
    ↓
Serveur Interserver (205.209.109.3)
    ↓
public_html/api.php
    ↓
MySQL localhost
    ↓
Base: ynukalab_database_website
    ↓
Tables: users, blog_posts, etc.
```

---

## ✅ Confirmez votre configuration

**Vos paramètres Interserver**:
- ✅ Domaine: ynukalabs.com
- ✅ IP: 205.209.109.3
- ✅ Base MySQL: ynukalab_database_website
- ✅ User MySQL: ynukalab_admin-jacques
- ✅ Password MySQL: Admin-Jacques.ynuka_db
- ✅ API Location: public_html/api.php

**Points clés à générer avant déploiement**:
- ⚠️ JWT_SECRET (32+ caractères aléatoires)
- ⚠️ Créer utilisateur admin initial (via setup.sql)

**Après déploiement**:
- Test: https://admin.ynukalabs.com/api.php?action=ping
- Retourner bien le Json: `{"db": "ok", "tables": [...], ...}`

---

**Statut**: ✅ L'application est correctement configurée pour utiliser votre base de données Interserver.

