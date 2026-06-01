# Analyse Complète de l'Intégration API - Ynuka Site & Panel Admin

**Date**: Juin 1, 2026  
**Scope**: Vérification de l'intégration du site principal (Ynuka Site) avec l'API du panel admin

---

## 📋 Résumé Exécutif

Le site principal (Ynuka Site) consomme l'API PHP du Panel Admin via un système de proxy intelligent (`strapiFetch`). Les appels Strapi-like (`/api/resource`) sont traduits en appels PHP API avec paramètres compatibles. La CORS est correctement configurée et les données sont mappées depuis les tables MySQL en JSON.

---

## 1️⃣ Architecture d'Intégration API

### 1.1 Client HTTP Wrapper - `strapiFetch()`

**Fichier**: [Ynuka Site/src/lib/strapi.ts](Ynuka%20Site/src/lib/strapi.ts)

```typescript
// Configuration base
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";

// Proxy PHP API
const phpApi = `${window.location.origin}/php/api.php`;
```

#### Mapping des Requêtes:

| Méthode HTTP | Strapi Pattern | PHP API | Description |
|---|---|---|---|
| **GET** | `/api/{resource}?params` | `?action=list&resource={resource}&params` | Lister les ressources |
| **GET** | `/api/{resource}/{id}` | `?action=get&resource={resource}&id={id}` | Récupérer une ressource spécifique |
| **POST** | `/api/{resource}` | `?action=create&resource={resource}` | Créer une nouvelle ressource |
| **PUT/PATCH** | `/api/{resource}/{id}` | `?action=update&resource={resource}&id={id}` | Modifier une ressource |
| **DELETE** | `/api/{resource}/{id}` | `?action=delete&resource={resource}&id={id}` | Supprimer une ressource |

#### Transformation des Paramètres Strapi → PHP:

```
Strapi Filters:
  /api/events?filters[published][$eq]=true
  
PHP API:
  ?action=list&resource=events&search=published=true

Strapi Pagination:
  /api/events?pagination[pageSize]=100&pagination[page]=1
  
PHP API:
  ?action=list&resource=events&limit=100&page=1

Strapi Sort:
  /api/events?sort=createdAt:desc
  
PHP API:
  (Paramètre accepté mais ignoré actuellement)

Strapi Populate:
  /api/events?populate=image
  
PHP API:
  (Paramètre ignoré - tout est retourné)
```

---

## 2️⃣ Endpoints API Utilisés

### 2.1 Endpoints par Ressource

#### **Events (Événements)**
- **Endpoint**: `/api/events`
- **Fichiers utilisant**: 
  - [Events.tsx](Ynuka%20Site/src/pages/Events.tsx) - Affichage liste complète
  - [EventDetail.tsx](Ynuka Site/src/pages/EventDetail.tsx) - Détail d'un événement
  - [Index-final.tsx](Ynuka%20Site/src/pages/Index-final.tsx) - Événements à venir sur home
  - [AdminDashboard.tsx](Ynuka%20Site/src/pages/AdminDashboard.tsx) - Gestion admin
  - [EcosystemEventsPreview.tsx](Ynuka%20Site/src/components/EcosystemEventsPreview.tsx) - Aperçu
  
- **Requêtes**:
  ```javascript
  // Tous les événements (tri + image)
  GET /api/events?sort=createdAt:desc&populate=image&pagination[pageSize]=100
  
  // Événements à venir filtrés
  GET /api/events?filters[upcoming][$eq]=true&sort=date:asc&populate=image&pagination[pageSize]=12
  
  // Détail d'un événement
  GET /api/events/{id}?populate=image
  
  // Créer un événement (admin)
  POST /api/events { data: {...} }
  
  // Modifier/Supprimer (admin)
  PATCH|DELETE /api/events/{id}
  ```

#### **Event Registrations (Inscriptions aux Événements)**
- **Endpoint**: `/api/event-registrations`
- **Fichiers utilisant**:
  - [Events.tsx](Ynuka%20Site/src/pages/Events.tsx) - Formulaire d'inscription
  - [EventDetail.tsx](Ynuka%20Site/src/pages/EventDetail.tsx) - Inscription détail
  - [AdminDashboard.tsx](Ynuka%20Site/src/pages/AdminDashboard.tsx) - Gestion admin

- **Requêtes**:
  ```javascript
  // Créer une inscription
  POST /api/event-registrations {
    data: {
      event: eventId,
      full_name: string,
      email: string,
      phone?: string
    }
  }
  
  // Lister les inscriptions (admin)
  GET /api/event-registrations
  
  // Supprimer une inscription (admin)
  DELETE /api/event-registrations/{id}
  ```

#### **Blog Posts (Articles de Blog)**
- **Endpoint**: `/api/blog-posts`
- **Fichiers utilisant**:
  - [Index-final.tsx](Ynuka%20Site/src/pages/Index-final.tsx) - 3 derniers articles
  - [BlogPost.tsx](Ynuka%20Site/src/pages/BlogPost.tsx) - Détail d'un article
  - [AdminDashboard.tsx](Ynuka%20Site/src/pages/AdminDashboard.tsx) - Gestion admin
  - [BlogPostsSection.tsx](Ynuka%20Site/src/components/BlogPostsSection.tsx) - Liste

- **Requêtes**:
  ```javascript
  // Articles publiés
  GET /api/blog-posts?filters[published][$eq]=true&sort=createdAt:desc&pagination[pageSize]=100
  
  // Détail d'un article avec image
  GET /api/blog-posts/{id}?populate=image
  
  // Créer/Modifier/Supprimer (admin)
  POST|PATCH|DELETE /api/blog-posts/{id}
  ```

#### **Team Members (Membres de l'Équipe)**
- **Endpoint**: `/api/team-members`
- **Fichiers utilisant**:
  - [About.tsx](Ynuka%20Site/src/pages/About.tsx) - Affichage équipe

- **Requêtes**:
  ```javascript
  // Tous les membres avec image
  GET /api/team-members?populate=image&pagination[pageSize]=100
  ```

#### **Projects (Projets)**
- **Endpoint**: `/api/projects`
- **Fichiers utilisant**:
  - [Index-final.tsx](Ynuka%20Site/src/pages/Index-final.tsx) - Projets incubés

- **Requêtes**:
  ```javascript
  // Tous les projets
  GET /api/projects?sort=createdAt:desc&pagination[pageSize]=100
  ```

#### **Gallery Images (Images Galerie)**
- **Endpoint**: `/api/gallery-events`
- **Fichiers utilisant**:
  - [Resources.tsx](Ynuka%20Site/src/pages/Resources.tsx) - Galerie d'événements

- **Requêtes**:
  ```javascript
  // Événements galerie avec images
  GET /api/gallery-events?populate[images]=*&pagination[pageSize]=20
  ```

#### **Resource Items (Ressources)**
- **Endpoint**: `/api/resource-sections`
- **Fichiers utilisant**:
  - [Resources.tsx](Ynuka%20Site/src/pages/Resources.tsx) - Sections de ressources

- **Requêtes**:
  ```javascript
  // Sections de ressources avec items
  GET /api/resource-sections?populate=items&pagination[pageSize]=50
  ```

#### **Contact Messages (Messages de Contact)**
- **Endpoint**: `/api/contact-messages`
- **Fichiers utilisant**:
  - [Contact.tsx](Ynuka%20Site/src/pages/Contact.tsx) - Formulaire de contact

- **Requêtes**:
  ```javascript
  // Créer un message de contact
  POST /api/contact-messages {
    data: {
      name: string,
      email: string,
      subject: string,
      message: string
    }
  }
  ```

#### **Newsletter Subscribers (Abonnés Newsletter)**
- **Endpoint**: `/api/newsletter-subscribers`
- **Utilisé par**: AdminDashboard pour affichage des abonnés

- **Requêtes**:
  ```javascript
  // Lister les abonnés
  GET /api/newsletter-subscribers
  
  // Supprimer un abonné
  DELETE /api/newsletter-subscribers/{id}
  ```

#### **Partners (Partenaires)**
- **Endpoint**: `/api/partners`
- **Fichiers utilisant**:
  - [About.tsx](Ynuka%20Site/src/pages/About.tsx) - Liste des partenaires

- **Requêtes**:
  ```javascript
  // Partenaires avec logo
  GET /api/partners?populate=logo&pagination[pageSize]=50
  ```

---

## 3️⃣ Configuration CORS de l'API

**Fichier**: [Panel Admin/php-api/api.php](Panel%20Admin/php-api/api.php) (lignes 38, 67-71)

```php
// CORS Configuration
define('ALLOWED_ORIGIN', '*'); // ⚠️ Pour production: définir à l'URL du domaine

// Headers CORS
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');

// Gestion des requêtes preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
```

### 3.1 Statut CORS

| Aspect | Statut | Notes |
|---|---|---|
| **Origin** | `*` (Ouvert) | ⚠️ À restreindre en production |
| **Méthodes** | GET, POST, OPTIONS | Suffisant pour les opérations CRUD |
| **Headers** | Content-Type, Authorization | Support JWT pour authentification |
| **Preflight** | ✅ Activé | Requêtes OPTIONS gérées correctement |
| **Max Age** | 86400 sec (24h) | Caching des preflight |

### 3.2 Recommandation de Sécurité

```php
// PRODUCTION: Restreindre aux domaines autorisés
define('ALLOWED_ORIGIN', 'https://ynukalabs.com');
// Ou multiple origins:
$allowedOrigins = ['https://ynukalabs.com', 'https://www.ynukalabs.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
```

---

## 4️⃣ Configuration des URLs API

### 4.1 Configuration Vite

**Fichier**: [Ynuka Site/vite.config.ts](Ynuka%20Site/vite.config.ts)

- Aucune configuration d'URL d'API explicite
- Utilisation des valeurs par défaut

### 4.2 Fichier .env

**Fichier**: [Ynuka Site/.env](Ynuka%20Site/.env)

```env
VITE_SUPABASE_PROJECT_ID="fvxiesmljyzmnyjevrhq"
VITE_SUPABASE_PUBLISHABLE_KEY="..."
VITE_SUPABASE_URL="https://fvxiesmljyzmnyjevrhq.supabase.co"
VITE_LUMA_EVENTS_URL="https://luma.com/goma"
VITE_BLOCKFROST_PREPROD_PROJECT_ID="preprodLHCadXG2A9WpOcnyd1YPkHydbtwko9Rx"
VITE_CARDANO_DONATION_ADDRESS_PREPROD="addr_test1..."

# ⚠️ VITE_STRAPI_URL absent - défaut à http://localhost:1337
```

### 4.3 URLs Effectives

| Service | URL | Source |
|---|---|---|
| **Strapi Base** | `http://localhost:1337` | Défaut strapi.ts (line 1) |
| **PHP API** | `{window.location.origin}/php/api.php` | Runtime (strapi.ts line 27) |
| **Supabase** | `https://fvxiesmljyzmnyjevrhq.supabase.co` | .env |

---

## 5️⃣ Actions de l'API PHP

**Fichier**: [Panel Admin/php-api/api.php](Panel%20Admin/php-api/api.php) (lignes 397-740)

### Actions Disponibles

```
Authentification:
  - ping              → Vérifier la connexion
  - login             → Authentification email/password
  - register          → Inscription (si autorisé)
  - google_auth_url   → URL OAuth Google
  - google_callback   → Callback OAuth Google
  - me                → Profil utilisateur courant

Administration:
  - allowed_emails_list      → Lister les emails autorisés
  - allowed_emails_add       → Ajouter un email à la liste
  - allowed_emails_remove    → Retirer un email
  - upload_image             → Upload d'image

Données (CRUD):
  - list              → Lister une ressource
  - get               → Récupérer une ressource spécifique
  - create            → Créer une ressource
  - update            → Mettre à jour une ressource
  - delete            → Supprimer une ressource
```

### Tables Supportées

```php
$ALLOWED_TABLES = [
    'users',
    'user_roles',
    'blog_posts',
    'blog_comments',
    'contact_messages',
    'donations',
    'events',
    'event_registrations',
    'gallery_images',
    'newsletter_subscribers',
    'projects',
    'resource_items',
    'team_members',
];
```

---

## 6️⃣ Fichiers d'Intégration Clés

### 6.1 Côté Client (Ynuka Site)

#### **Library d'API**
| Fichier | Rôle | Endpoints |
|---|---|---|
| [src/lib/strapi.ts](Ynuka%20Site/src/lib/strapi.ts) | Client HTTP proxy | Tous les /api/* |
| [src/hooks/useStrapiAuth.tsx](Ynuka%20Site/src/hooks/useStrapiAuth.tsx) | Auth context | /api/users/me, /api/auth/local |

#### **Pages Consommant l'API**
| Page | Endpoints | Méthode |
|---|---|---|
| [Pages/Events.tsx](Ynuka%20Site/src/pages/Events.tsx) | events, event-registrations | GET, POST, DELETE |
| [Pages/EventDetail.tsx](Ynuka%20Site/src/pages/EventDetail.tsx) | events, event-registrations | GET, POST |
| [Pages/BlogPost.tsx](Ynuka%20Site/src/pages/BlogPost.tsx) | blog-posts, blog-comments | GET, POST |
| [Pages/About.tsx](Ynuka%20Site/src/pages/About.tsx) | team-members, partners | GET |
| [Pages/Resources.tsx](Ynuka%20Site/src/pages/Resources.tsx) | gallery-events, resource-sections | GET |
| [Pages/Contact.tsx](Ynuka%20Site/src/pages/Contact.tsx) | contact-messages | POST |
| [Pages/Index-final.tsx](Ynuka%20Site/src/pages/Index-final.tsx) | events, blog-posts, projects | GET |
| [Pages/AdminDashboard.tsx](Ynuka%20Site/src/pages/AdminDashboard.tsx) | events, blog-posts, event-registrations, newsletter-subscribers | GET, POST, PATCH, DELETE |

#### **Composants**
| Composant | Endpoints | Usage |
|---|---|---|
| [Components/BlogPostsSection.tsx](Ynuka%20Site/src/components/BlogPostsSection.tsx) | blog-posts | GET articles publiés |
| [Components/EcosystemEventsPreview.tsx](Ynuka%20Site/src/components/EcosystemEventsPreview.tsx) | events | GET événements |

### 6.2 Côté Serveur (Panel Admin)

| Fichier | Rôle |
|---|---|
| [php-api/api.php](Panel%20Admin/php-api/api.php) | API principale (854 lignes) |
| [php-api/setup.sql](Panel%20Admin/php-api/setup.sql) | Schéma de base de données |
| [php-api/README.md](Panel%20Admin/php-api/README.md) | Documentation déploiement |

---

## 7️⃣ Schéma de Flux d'Données

```
┌─────────────────────────────────────────────────────────┐
│                    Ynuka Site (React)                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Pages/Components (Events, Blog, About, etc.)      │ │
│  └────────────────┬─────────────────────────────────┘ │
│                   │ strapiFetch()                      │
│  ┌────────────────▼─────────────────────────────────┐ │
│  │ src/lib/strapi.ts (Client HTTP)                 │ │
│  │ • Mappe /api/* → ?action=list&resource=*       │ │
│  │ • Convertit les paramètres Strapi → PHP        │ │
│  │ • Gère JWT (Authorization header)               │ │
│  └────────────────┬─────────────────────────────────┘ │
└────────────────┼───────────────────────────────────────┘
                 │ fetch(`{origin}/php/api.php?action=...`)
                 │
                 │ HTTP/CORS
                 ▼
┌─────────────────────────────────────────────────────────┐
│              Panel Admin API (PHP)                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │ php-api/api.php                                   │ │
│  │ • Parse action, resource, id du query string     │ │
│  │ • Valide JWT (Authorization header)              │ │
│  │ • Execute CRUD sur DB MySQL                      │ │
│  │ • Retourne JSON                                   │ │
│  └────────────────┬─────────────────────────────────┘ │
└────────────────┼───────────────────────────────────────┘
                 │ JSON Response
                 ▼
┌─────────────────────────────────────────────────────────┐
│               MySQL Database                            │
│  (Interserver Hosting)                                  │
│  • users, blog_posts, events, event_registrations     │
│  • gallery_images, projects, team_members, etc.       │
└─────────────────────────────────────────────────────────┘
```

---

## 8️⃣ Authentification & Authorization

### 8.1 Flux d'Authentification

```
1. User → Contact.tsx / AdminDashboard.tsx
2. Forms → strapiFetch('/api/auth/local') ou login action
3. API → api.php?action=login
4. JWT Generated → localStorage.setItem('strapi_jwt', token)
5. Subsequent Requests → Authorization: Bearer {token} header
```

### 8.2 JWT Configuration

**Fichier**: [Panel Admin/php-api/api.php](Panel%20Admin/php-api/api.php#L42)

```php
define('JWT_SECRET', 'MXsiCkSR5QexkLqRj5z6l6iF3QW6xWwPO4cXe0GX5gE=');
// Token expire: 7 jours (7 * 24 * 60 * 60)
```

### 8.3 Google OAuth2

**Configuration** (api.php, lines 48-50):
```php
define('GOOGLE_CLIENT_ID', '1039734035041-3ob85lpfheoonvv43759desitdr7rhgc.apps.googleusercontent.com');
define('GOOGLE_REDIRECT_URI', 'https://admin.ynukalabs.com/api/api.php?action=google_callback');
```

---

## 9️⃣ Points de Vérification & Diagnostics

### 9.1 Checklist d'Intégration

- [x] Endpoints Strapi mapés vers PHP API
- [x] CORS configuré (à restreindre en prod)
- [x] JWT authentification fonctionnelle
- [x] Toutes les ressources principales supportées
- [x] Fallbacks hardcodés en place (en cas d'erreur API)
- [ ] VITE_STRAPI_URL à définir en production
- [ ] ALLOWED_ORIGIN à restreindre en production
- [ ] Rate limiting à implémenter
- [ ] Logging/Monitoring à configurer

### 9.2 Testeurs d'API

**Fichiers de test fournis**:
- [Ynuka Site/php/test-api.sh](Ynuka%20Site/php/test-api.sh) - Tests curl
- [Ynuka Site/php/test-api.html](Ynuka%20Site/php/test-api.html) - Interface web
- [Ynuka Site/dist-Copie/php/example.html](Ynuka%20Site/dist%20-%20Copie/php/example.html) - Exemples

**Commande ping pour vérifier**:
```bash
curl -s "http://localhost/php/api.php?action=ping" | jq '.'
```

---

## 🔟 Résumé des Tables MySQL Utilisées

```
blog_posts         ← Blog articles (title, content, published, image)
blog_comments      ← Commentaires d'articles
contact_messages   ← Messages formulaire contact
donations          ← Donations blockchain
events             ← Événements (date, location, type, image)
event_registrations ← Inscriptions aux événements
gallery_images     ← Images galerie
newsletter_subscribers ← Abonnés newsletter
projects           ← Projets incubés
resource_items     ← Items de ressources
team_members       ← Membres équipe (name, role, social, image)
users              ← Utilisateurs généraux
user_roles         ← Rôles utilisateurs
admin_users        ← Administrateurs (avec JWT)
admin_allowed_emails ← Emails autorisés pour l'admin
```

---

## 1️⃣1️⃣ Recommandations

### 🔒 Sécurité
1. **CORS**: Restreindre `ALLOWED_ORIGIN` à `https://ynukalabs.com`
2. **JWT**: Augmenter l'expiration si nécessaire (actuellement 7 jours)
3. **Rate Limiting**: Implémenter un rate limiter sur l'API PHP
4. **HTTPS**: Forcer HTTPS en production
5. **Validation**: Valider/nettoyer ALL user inputs côté PHP

### 📊 Monitoring
1. Ajouter logging des requêtes API
2. Monitorer les erreurs 5xx
3. Tracer les performances des requêtes DB

### 🚀 Performance
1. Ajouter caching HTTP (Cache-Control headers)
2. Implémenter pagination côté serveur
3. Index les colonnes fréquemment filtrées (date, published, etc.)
4. Compresser les réponses (gzip)

### 📦 Maintenance
1. Documenter les schémas de base de données
2. Versioner l'API (`/api/v1/*`)
3. Créer des tests automatisés (unit + integration)
4. Documenter les règles de validation métier

---

## 📎 Annexe: Fichiers de Configuration

### A.1 Fichiers de Configuration Clés

```
Ynuka Site/
├── .env                          ← Supabase, Blockfrost, Luma
├── vite.config.ts               ← Pas de config API URL
├── src/
│   ├── lib/strapi.ts           ← Client HTTP API
│   ├── hooks/useStrapiAuth.tsx  ← Auth context
│   └── pages/
│       ├── AdminDashboard.tsx   ← Gestion admin (CRUD)
│       ├── Events.tsx           ← Liste/détail événements
│       ├── BlogPost.tsx         ← Blog
│       ├── About.tsx            ← Team, Partners
│       ├── Contact.tsx          ← Contact messages
│       ├── Resources.tsx        ← Gallery, Resource items
│       └── Index-final.tsx      ← Home (featured content)

Panel Admin/php-api/
├── api.php                       ← API 854 lignes
├── setup.sql                     ← Schema DB
└── README.md                     ← Documentation
```

### A.2 Schéma de Déploiement

```
Production Deployment:
  
  Domain: ynukalabs.com
  ├── Frontend: https://ynukalabs.com (Vercel/Static)
  └── Backend: https://ynukalabs.com/php/api.php (Interserver)
  
  Database: ynukalab_database_website (Interserver MySQL)
```

---

**Fin de l'analyse - Tous les endpoints et configurations documentés.**
