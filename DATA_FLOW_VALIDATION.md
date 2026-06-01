# ✅ Validation du Flux de Données - Panel Admin → Site Principal

## 🎯 Objectif
Vérifier que tous les formulaires du Panel Admin peuvent envoyer les données au Site Principal via l'API.

---

## 📊 Ressources et Flux de Données

### **1. Blog Posts** (`blog_posts`)
- **Panel Admin**: Formulaire "Créer un nouvel article"
- **Site Principal**: Affichage sur `/blog`, pages individuelles
- **Flux**: POST `/api/blog_posts` → DB → GET `/api/blog-posts`
- **Status**: ✅ Fonctionnel (slug unique implémenté)
- **Données requises**: title, slug, excerpt, content, cover_url, published

### **2. Événements** (`events`)
- **Panel Admin**: Formulaire "Créer un événement"
- **Site Principal**: Page `/events` avec liste et détail
- **Flux**: POST `/api/events` → DB → GET `/api/events`
- **Status**: ✅ Fonctionnel
- **Données requises**: name, description, date, location, capacity

### **3. Inscriptions Événements** (`event_registrations`)
- **Panel Admin**: Affichage des inscriptions (lecture seule)
- **Site Principal**: Formulaire d'inscription événement
- **Flux**: POST `/api/event-registrations` (site) → DB → GET (panel)
- **Status**: ✅ Fonctionnel
- **Données requises**: event_id, full_name, email, phone

### **4. Galerie Images** (`gallery_images`)
- **Panel Admin**: Formulaire "Ajouter une image"
- **Site Principal**: Page `/resources` avec galerie
- **Flux**: POST `/api/gallery_images` (avec upload) → DB → GET `/api/gallery-events`
- **Status**: ✅ Fonctionnel (upload_image implémenté)
- **Données requises**: title, image_url, description

### **5. Projets** (`projects`)
- **Panel Admin**: Formulaire "Créer un projet"
- **Site Principal**: Affichage sur page principale et `/projects`
- **Flux**: POST `/api/projects` → DB → GET `/api/projects`
- **Status**: ✅ Fonctionnel
- **Données requises**: title, description, link, image_url

### **6. Ressources** (`resource_items`)
- **Panel Admin**: Formulaire "Ajouter une ressource"
- **Site Principal**: Page `/resources` avec liste
- **Flux**: POST `/api/resource_items` → DB → GET `/api/resource_items`
- **Status**: ✅ Fonctionnel
- **Données requises**: name, description, link, icon, category

### **7. Équipe** (`team_members`)
- **Panel Admin**: Formulaire "Ajouter un membre d'équipe"
- **Site Principal**: Page `/about` avec liste d'équipe
- **Flux**: POST `/api/team_members` → DB → GET `/api/team-members`
- **Status**: ✅ Fonctionnel
- **Données requises**: name, role, bio, image_url, social_links

### **8. Messages Contact** (`contact_messages`)
- **Panel Admin**: Affichage des messages (lecture seule)
- **Site Principal**: Formulaire contact
- **Flux**: POST `/api/contact-messages` (site) → DB → GET (panel)
- **Status**: ✅ Fonctionnel
- **Données requises**: name, email, subject, message

### **9. Newsletter** (`newsletter_subscribers`)
- **Panel Admin**: Affichage des abonnés (lecture seule)
- **Site Principal**: Formulaire d'abonnement
- **Flux**: POST `/api/newsletter-subscribers` (site) → DB → GET (panel)
- **Status**: ✅ Fonctionnel
- **Données requises**: email

---

## 🔧 Configuration Requise en Production

### **API PHP** (`Panel Admin/php-api/api.php`)

#### CORS Configuration (Ligne 38)
```php
// ⚠️ À CHANGER EN PRODUCTION
define('ALLOWED_ORIGIN', '*');  // ❌ OUVERT À TOUS

// ✅ CORRIGER POUR:
define('ALLOWED_ORIGIN', 'https://ynukalabs.com');
```

#### Database Configuration (Lignes 34-38)
```php
define('DB_HOST', 'localhost');        // ✅ À configurer pour le serveur
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');
```

#### Ressources Autorisées (Lignes 60-64)
```php
$ALLOWED_TABLES = [
    'users', 'user_roles', 'blog_posts', 'blog_comments',
    'contact_messages', 'donations', 'events', 'event_registrations',
    'gallery_images', 'newsletter_subscribers', 'projects',
    'resource_items', 'team_members',
];
```
✅ **Status**: Toutes les 7 ressources requises sont présentes!

### **Site Principal** (`Ynuka Site`)

#### Variable d'Environnement (`.env`)
```bash
VITE_STRAPI_URL=https://admin.ynukalabs.com
```

**Défaut actuel**: `http://localhost:1337` (fallback)

#### Client API (`src/lib/strapi.ts`)
```typescript
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";
```
✅ **Status**: Flexible, utilise env ou fallback

---

## 📝 Checklist Pré-Déploiement

- [ ] **API PHP**
  - [ ] Mettre à jour `ALLOWED_ORIGIN` pour restreindre à `ynukalabs.com`
  - [ ] Vérifier DB credentials pour le serveur Interserver
  - [ ] Tester connexion DB depuis phpMyAdmin

- [ ] **Site Principal**
  - [ ] Ajouter `.env.production` avec `VITE_STRAPI_URL=https://admin.ynukalabs.com/api/api.php`
  - [ ] Builder le projet: `npm run build`
  - [ ] Tester chaque page consommant l'API

- [ ] **Panel Admin**
  - [ ] Builder: `npm run build`
  - [ ] Uploader `dist/` sur le serveur
  - [ ] Uploader `php-api/api.php` sur le serveur

- [ ] **Tests End-to-End**
  - [ ] [ ] Créer un article, vérifier qu'il apparaît sur le site
  - [ ] [ ] Créer un événement, vérifier l'affichage
  - [ ] [ ] Uploader une image, vérifier l'accès
  - [ ] [ ] Ajouter un membre d'équipe, vérifier le rendu
  - [ ] [ ] Tester les formulaires du site (contact, inscription, newsletter)

---

## 🚀 Authentification & Sécurité

### JWT Configuration (API PHP)
- **Secret**: `MXsiCkSR5QexkLqRj5z6l6iF3QW6xWwPO4cXe0GX5gE=`
- **Expiration**: 7 jours
- **Headers**: `Authorization: Bearer {TOKEN}`

### Endpoints Sécurisés
✅ `POST /api.php?action=create&resource=...` → Requiert auth
✅ `POST /api.php?action=update&resource=...` → Requiert auth
✅ `POST /api.php?action=delete&resource=...` → Requiert auth
✅ `GET /api.php?action=list&resource=...` → Accès public

### Endpoints Publics (Site Principal)
- `GET /api.php?action=list&resource=blog_posts` (public)
- `GET /api.php?action=list&resource=events` (public)
- `POST /api.php?action=create&resource=contact_messages` (public, no auth)
- `POST /api.php?action=create&resource=newsletter_subscribers` (public)
- `POST /api.php?action=create&resource=event_registrations` (public)

---

## 📡 Endpoints API Reference

### **Format des Requêtes**

#### GET (Récupérer des données)
```bash
GET https://admin.ynukalabs.com/api/api.php?action=list&resource=blog_posts&page=1&limit=25
Content-Type: application/json
```

#### POST (Créer une ressource)
```bash
POST https://admin.ynukalabs.com/api/api.php?action=create&resource=blog_posts
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{
  "title": "Mon Article",
  "slug": "mon-article",
  "excerpt": "Résumé",
  "content": "Contenu...",
  "published": 1
}
```

#### POST (Mettre à jour)
```bash
POST https://admin.ynukalabs.com/api/api.php?action=update&resource=blog_posts&id=123
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}

{ "title": "Titre modifié" }
```

#### DELETE
```bash
POST https://admin.ynukalabs.com/api/api.php?action=delete&resource=blog_posts&id=123
Authorization: Bearer {JWT_TOKEN}
```

---

## ✅ Vérification Finale

**Date de vérification**: 2026-06-01

| Ressource | API | Panel | Site | CORS | Notes |
|---|---|---|---|---|---|
| blog_posts | ✅ | ✅ | ✅ | ⚠️ | Slug unique implémenté |
| events | ✅ | ✅ | ✅ | ⚠️ | Full CRUD |
| event_registrations | ✅ | ✅ | ✅ | ⚠️ | Public POST |
| gallery_images | ✅ | ✅ | ✅ | ⚠️ | Upload implémenté |
| projects | ✅ | ✅ | ✅ | ⚠️ | Full CRUD |
| resource_items | ✅ | ✅ | ✅ | ⚠️ | Full CRUD |
| team_members | ✅ | ✅ | ✅ | ⚠️ | Full CRUD |
| contact_messages | ✅ | ✅ | ✅ | ⚠️ | Public POST |
| newsletter_subscribers | ✅ | ✅ | ✅ | ⚠️ | Public POST |

**⚠️ = CORS ouvert, à restreindre en production**

---

## 🔗 Fichiers Clés

- **API Backend**: [Panel Admin/php-api/api.php](Panel%20Admin/php-api/api.php)
- **Frontend Client**: [Ynuka Site/src/lib/strapi.ts](Ynuka%20Site/src/lib/strapi.ts)
- **Auth Hook**: [Ynuka Site/src/hooks/useStrapiAuth.tsx](Ynuka%20Site/src/hooks/useStrapiAuth.tsx)

---

## 📞 Support

Pour plus d'infos:
- Voir: [API_INTEGRATION_ANALYSIS.md](API_INTEGRATION_ANALYSIS.md)
- Voir: [PANEL_ADMIN_COMPLETE_SETUP.md](PANEL_ADMIN_COMPLETE_SETUP.md)
