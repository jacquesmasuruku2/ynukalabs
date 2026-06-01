# 🚀 Guide Complet de Déploiement - Panel Admin → Site Principal

**Date**: 2026-06-01  
**Objectif**: Assurer que tous les formulaires du Panel Admin envoient correctement les données au Site Principal

---

## 📋 Table des Matières

1. [Architecture et Flux](#architecture-et-flux)
2. [Configuration API](#configuration-api)
3. [Configuration Site Principal](#configuration-site-principal)
4. [Déploiement Interserver](#déploiement-interserver)
5. [Vérification Post-Déploiement](#vérification-post-déploiement)
6. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture et Flux

```
┌─────────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PANEL ADMIN (React/TypeScript)                                │
│  └─ Formulaires CRUD                                           │
│     ├─ Blog Posts                                              │
│     ├─ Événements                                              │
│     ├─ Galerie                                                 │
│     ├─ Projets                                                 │
│     ├─ Ressources                                              │
│     └─ Équipe                                                  │
│        │                                                        │
│        ├─────────────────────────────────────────────┐         │
│        │ POST/PUT/DELETE (Authentifié)              │         │
│        │                                              │         │
│        ▼                                              │         │
│  API PHP (Single File)                               │         │
│  ├─ Validation & Auth (JWT)                          │         │
│  ├─ Génération slugs uniques                        │         │
│  ├─ Upload d'images                                  │         │
│  └─ CRUD générique pour toutes ressources           │         │
│        │                                              │         │
│        ├─────────────────────────────────────────────┤         │
│        │ INSERT/UPDATE/DELETE                        │         │
│        │                                              │         │
│        ▼                                              │         │
│  MySQL Database (Interserver Shared Hosting)        │         │
│  ├─ blog_posts                                       │         │
│  ├─ events                                           │         │
│  ├─ event_registrations                            │         │
│  ├─ gallery_images                                  │         │
│  ├─ projects                                        │         │
│  ├─ resource_items                                  │         │
│  ├─ team_members                                    │         │
│  └─ [9 autres tables]                              │         │
│        │                                              │         │
│        ├──────────────────────────────────────────────┤         │
│        │ SELECT (Public)                            │         │
│        │                                              │         │
│        ▼                                              │         │
│  SITE PRINCIPAL (React/TypeScript/Vite)              │         │
│  └─ Pages Publiques                                  │         │
│     ├─ /blog (Blog Posts)                           │         │
│     ├─ /events (Événements)                         │         │
│     ├─ /resources (Galerie + Ressources)           │         │
│     ├─ /projects (Projets)                          │         │
│     ├─ /about (Équipe)                              │         │
│     ├─ /contact (Contact - Forms)                   │         │
│     └─ [Autres pages consommant l'API]              │         │
│                                                        │         │
└───────────────────────────────────────────────────────┴─────────┘
```

---

## 🔧 Configuration API

### **Fichier**: `Panel Admin/php-api/api.php`

#### **1. Variables d'Environnement (ligne 36-38)**

```php
// CORS: Configuration par environnement
define('ALLOWED_ORIGIN', getenv('ALLOWED_ORIGIN') ?: 'https://ynukalabs.com');
```

**Pour Interserver** (dans `.htaccess` ou cPanel):
```apache
SetEnv ALLOWED_ORIGIN https://ynukalabs.com
SetEnv DB_HOST localhost
SetEnv DB_NAME ynukalab_database_website
SetEnv DB_USER ynukalab_admin-jacques
SetEnv DB_PASS [YOUR_DB_PASSWORD]
SetEnv JWT_SECRET [VOTRE_JWT_SECRET_LONG_32_CHARS]
```

#### **2. Database Configuration (ligne 34-38)**

Les credentials sont hardcodés (à adapter à votre serveur):
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');
```

✅ **Status**: À vérifier sur Interserver

#### **3. Google OAuth (ligne 48-54)**

```php
define('GOOGLE_CLIENT_ID',     getenv('GOOGLE_CLIENT_ID') ?: '...);
define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: '...');
define('GOOGLE_REDIRECT_URI',  getenv('GOOGLE_REDIRECT_URI') ?: 'https://admin.ynukalabs.com/api/api.php?action=google_callback');
define('PANEL_URL',            getenv('PANEL_URL') ?: 'https://admin.ynukalabs.com');
```

✅ **Status**: Déjà configuré

#### **4. Ressources Autorisées (ligne 61-66)**

```php
$ALLOWED_TABLES = [
    'users', 'user_roles', 'blog_posts', 'blog_comments',
    'contact_messages', 'donations', 'events', 'event_registrations',
    'gallery_images', 'newsletter_subscribers', 'projects',
    'resource_items', 'team_members',
];
```

✅ **Status**: Les 7 ressources requises sont présentes

#### **5. Endpoints Implémentés (ligne 700+)**

Tous les endpoints CRUD génériques:
- `action=list` → SELECT
- `action=get` → SELECT WHERE id
- `action=create` → INSERT
- `action=update` → UPDATE
- `action=delete` → DELETE
- `action=upload_image` → File upload

✅ **Status**: Tous implémentés

---

## 🌐 Configuration Site Principal

### **Fichier**: `Ynuka Site/src/lib/strapi.ts`

#### **1. URL de l'API (ligne 1)**

```typescript
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";
```

**À configurer dans `.env.production`**:
```bash
VITE_STRAPI_URL=https://admin.ynukalabs.com/api
```

**Pour local**:
```bash
VITE_STRAPI_URL=http://localhost:5173/php/api.php
```

#### **2. Client HTTP avec Proxy (ligne 22+)**

Le client mappe automatiquement:
- `POST /api/blog-posts` → `GET https://admin.ynukalabs.com/api/api.php?action=list&resource=blog_posts`
- `POST /api/events` → `POST ...&action=create&resource=events`
- `DELETE /api/blog-posts/123` → `POST ...&action=delete&resource=blog_posts&id=123`

✅ **Status**: Automatique, pas besoin de changer

#### **3. Pages Consommant l'API**

| Page | Ressource | Requête |
|---|---|---|
| `/blog` | blog_posts | GET list, GET detail |
| `/events` | events | GET list, GET detail |
| `/resources` | gallery_images, resource_items | GET list |
| `/projects` | projects | GET list |
| `/about` | team_members | GET list |
| `/contact` | contact_messages | POST create |
| `/events/:id` | event_registrations | POST create |
| `/` | newsletter_subscribers | POST create |

✅ **Status**: Tous implémentés

---

## 📦 Déploiement Interserver

### **Étape 1: Préparer les Fichiers**

```bash
# Panel Admin
cd "d:\Site-Ynukalabs\Panel Admin"
npm run build  # Génère dist/

# Site Principal
cd "d:\Site-Ynukalabs\Ynuka Site"
npm run build  # Génère dist/
```

### **Étape 2: Structure Interserver**

```
/home/ynukalabs/public_html/
├── /api/
│   └── api.php                    ← Panel Admin/php-api/api.php
├── /admin/
│   └── [dist files]              ← Panel Admin/dist/
├── /uploads/
│   └── /gallery/                 ← Images uploadées
├── /php/
│   └── api.php                   ← Lien symbolique ou copie
├── /[Page publiques]/             ← Site Principal/dist/
└── .htaccess                      ← Configuration
```

### **Étape 3: Uploads via FTP/cPanel**

1. **Panel Admin API**:
   - Uploader `Panel Admin/php-api/api.php` → `/public_html/api/api.php`
   - Uploader `Panel Admin/php-api/api.php` → `/public_html/php/api.php` (fallback)

2. **Panel Admin Frontend**:
   - Uploader `Panel Admin/dist/*` → `/public_html/admin/`

3. **Site Principal Frontend**:
   - Uploader `Ynuka Site/dist/*` → `/public_html/` (racine)

4. **Répertoires**:
   - Créer `/public_html/uploads/gallery/` (permissions 755)
   - Créer `/public_html/uploads/` (permissions 755)

### **Étape 4: Configuration Serveur**

#### **.htaccess** (racine `public_html/`)

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Panel Admin routing
    RewriteRule ^admin/(.*)$ /admin/index.html [QSA,L]
    
    # Site Principal routing
    RewriteRule ^(blog|events|projects|resources|about|contact|community|donations|onboarding|partners)(/.*)?$ /index.html [QSA,L]
    
    # API passthrough
    RewriteRule ^(api|php)/ - [L]
    
    # Front controller
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /index.html [QSA,L]
</IfModule>

# Headers de sécurité
Header set X-Content-Type-Options nosniff
Header set X-Frame-Options DENY
Header set X-XSS-Protection "1; mode=block"
```

#### **Variables d'Environnement** (via cPanel ou `.env`)

```bash
# Dans cPanel → Environment Variables ou via SSH:
export ALLOWED_ORIGIN=https://ynukalabs.com
export DB_HOST=localhost
export DB_NAME=ynukalab_database_website
export DB_USER=ynukalab_admin-jacques
export DB_PASS=YOUR_PASSWORD
```

---

## ✅ Vérification Post-Déploiement

### **1. Vérifier l'API**

```bash
# Test de connexité
curl https://admin.ynukalabs.com/api/api.php?action=ping

# Réponse attendue:
{
  "ok": true,
  "php_version": "7.4.x",
  "db": "ok",
  "tables_found": [...],
  "admin_users_count": 1
}
```

### **2. Vérifier CORS**

```bash
# Pré-flight (OPTIONS)
curl -i -X OPTIONS https://admin.ynukalabs.com/api/api.php \
  -H "Origin: https://ynukalabs.com" \
  -H "Access-Control-Request-Method: POST"

# Doit retourner:
# Access-Control-Allow-Origin: https://ynukalabs.com
# Access-Control-Allow-Methods: GET, POST, OPTIONS
```

### **3. Tester Chaque Ressource**

```bash
# Blog Posts
curl https://admin.ynukalabs.com/api/api.php?action=list&resource=blog_posts&limit=5

# Événements
curl https://admin.ynukalabs.com/api/api.php?action=list&resource=events&limit=5

# Galerie
curl https://admin.ynukalabs.com/api/api.php?action=list&resource=gallery_images&limit=5

# Projets
curl https://admin.ynukalabs.com/api/api.php?action=list&resource=projects&limit=5

# Ressources
curl https://admin.ynukalabs.com/api/api.php?action=list&resource=resource_items&limit=5

# Équipe
curl https://admin.ynukalabs.com/api/api.php?action=list&resource=team_members&limit=5
```

### **4. Tester Création depuis Site Principal**

Via le formulaire contact:
```bash
curl -X POST https://admin.ynukalabs.com/api/api.php?action=create&resource=contact_messages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "Test message"
  }'
```

### **5. Vérifier l'Affichage sur le Site Principal**

- [ ] `/blog` affiche les articles
- [ ] `/events` affiche les événements
- [ ] `/resources` affiche galerie + ressources
- [ ] `/projects` affiche les projets
- [ ] `/about` affiche l'équipe
- [ ] Formulaires envoient correctement les données

---

## 🔍 Troubleshooting

### **Erreur CORS**

```
Access to fetch at 'https://admin.ynukalabs.com/api/api.php'
from origin 'https://ynukalabs.com' has been blocked
```

**Solution**:
```php
// Vérifier api.php ligne 38:
define('ALLOWED_ORIGIN', getenv('ALLOWED_ORIGIN') ?: 'https://ynukalabs.com');

// Ou via .htaccess:
SetEnv ALLOWED_ORIGIN https://ynukalabs.com
```

### **Erreur 404 sur l'API**

```
curl https://admin.ynukalabs.com/api/api.php?action=ping
→ 404 Not Found
```

**Solution**:
- Vérifier que `api.php` est uploadé à `/public_html/api/api.php` ou `/public_html/php/api.php`
- Vérifier les permissions (644 pour le fichier)
- Tester via FTP: `ls -la /public_html/api/`

### **Erreur de Base de Données**

```
"error": "SQLSTATE[HY000]: General error: 1030 Got error 28 from storage engine"
```

**Solution**:
- Vérifier les credentials DB dans `api.php` lignes 34-38
- S'assurer que la table existe: `setup.sql` a été exécuté
- Tester la connexion via phpMyAdmin

### **Données n'apparaissent pas sur le Site**

**Étapes**:
1. Vérifier que l'API retourne les données: `curl .../api.php?action=list&resource=blog_posts`
2. Vérifier que `VITE_STRAPI_URL` est configuré sur le site
3. Ouvrir la console du navigateur: vérifier les requêtes réseau
4. Vérifier que les pages consomment bien l'API (voir `Ynuka Site/src/pages/...`)

### **Upload d'images ne fonctionne pas**

```
"error": "Impossible de créer le répertoire d'upload"
```

**Solution**:
```bash
# SSH sur le serveur
chmod 755 /home/ynukalabs/public_html/uploads/gallery/
chmod 755 /home/ynukalabs/public_html/uploads/

# Vérifier que le répertoire existe:
ls -la /home/ynukalabs/public_html/uploads/gallery/
```

---

## 📋 Checklist Finale

### Avant le Déploiement
- [ ] `npm run build` réussi pour Panel Admin
- [ ] `npm run build` réussi pour Site Principal
- [ ] Fichier `api.php` testé en local
- [ ] Variables d'environnement documentées

### Pendant le Déploiement
- [ ] Fichiers uploadés via FTP/cPanel
- [ ] Permissions correctes (755 répertoires, 644 fichiers)
- [ ] `.htaccess` configuré
- [ ] Variables d'environnement définies
- [ ] Tables DB vérifiées via phpMyAdmin

### Après le Déploiement
- [ ] `ping` API retourne `ok: true`
- [ ] CORS headers présents
- [ ] Chaque ressource retourne des données
- [ ] Site affiche les données correctement
- [ ] Formulaires envoient les données
- [ ] Uploads d'images fonctionnent
- [ ] Authentification Panel fonctionne
- [ ] Google OAuth fonctionne

---

## 📞 Support

**Documentation complète**:
- [API_INTEGRATION_ANALYSIS.md](API_INTEGRATION_ANALYSIS.md)
- [DATA_FLOW_VALIDATION.md](DATA_FLOW_VALIDATION.md)
- [Panel Admin/php-api/README.md](Panel%20Admin/php-api/README.md)

**Fichiers à vérifier**:
- API: [Panel Admin/php-api/api.php](Panel%20Admin/php-api/api.php)
- Frontend: [Ynuka Site/src/lib/strapi.ts](Ynuka%20Site/src/lib/strapi.ts)

**Date de création**: 2026-06-01
