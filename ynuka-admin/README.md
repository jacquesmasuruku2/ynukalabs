# 🛠️ Ynuka Labs Admin Panel

Panneau d'administration complet pour gérer tous les aspects du site Ynuka Labs avec une base de données partagée.

## 🚀 Démarrage Rapide

### Développement Local

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Accès: http://localhost:5173
```

### Build pour Production

```bash
# Compiler le projet
npm run build

# Prévisualiser la build
npm run preview
```

## 📋 Fonctionnalités

- ✅ Authentification JWT avec rôles d'utilisateur
- ✅ CRUD complet sur les tables (posts, utilisateurs, événements, etc.)
- ✅ Interface responsive avec Radix UI
- ✅ TanStack Router pour la navigation client-side
- ✅ React Query pour la gestion des requêtes API
- ✅ Validation de formulaires avec React Hook Form
- ✅ Design système avec Tailwind CSS

## 🗂️ Structure du Projet

```
ynuka-admin/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── hooks/          # Hooks personnalisés
│   ├── lib/            # Utilitaires et helpers
│   ├── routes/         # Définition des routes (TanStack Router)
│   ├── router.tsx      # Configuration du routeur
│   └── main.tsx        # Point d'entrée
├── php-api/
│   ├── api.php         # API PHP avec authentification JWT
│   └── setup.sql       # Schéma de base de données
├── public/             # Assets statiques
└── vite.config.ts      # Configuration Vite
```

## 🔌 API

L'API PHP (`php-api/api.php`) expose:

### Authentification
```bash
POST /api.php?action=login
Body: { "email": "admin@ynukalabs.com", "password": "..." }
Response: { "token": "eyJ..." }
```

### CRUD Générique
```bash
# Lister les données
GET /api.php?action=select&table=blog_posts&limit=50&offset=0

# Obtenir un enregistrement
GET /api.php?action=select&table=blog_posts&id=1

# Insérer
POST /api.php?action=insert
Body: { "table": "blog_posts", "data": { "title": "...", "content": "..." } }

# Mettre à jour
POST /api.php?action=update
Body: { "table": "blog_posts", "id": 1, "data": { "title": "..." } }

# Supprimer
POST /api.php?action=delete&table=blog_posts&id=1
```

### Tables Disponibles (Whitelist)

- `users`, `user_roles`
- `blog_posts`, `blog_comments`
- `contact_messages`
- `donations`
- `events`, `event_registrations`
- `gallery_images`
- `newsletter_subscribers`
- `projects`
- `resource_items`
- `team_members`

## 🔐 Configuration

Voir [ADMIN_SETUP.md](./ADMIN_SETUP.md) pour les instructions complètes de déploiement et de configuration sur DirectAdmin.

## 🛡️ Sécurité

- Authentification JWT avec signature HMAC-SHA256
- Tokens stockés en localStorage côté client
- Whitelist des tables exposées par l'API (prévention SQL injection)
- Prepared statements pour toutes les requêtes
- CORS configuré pour le subdomain `admin.ynukalabs.com`

## 📦 Dépendances Principales

- **React 18** - Framework UI
- **TanStack Router** - Routing côté client
- **TanStack Query** - Gestion des requêtes API
- **Radix UI** - Composants UI accessibles
- **React Hook Form** - Gestion des formulaires
- **Tailwind CSS** - Styling utilitaire
- **TypeScript** - Typage statique

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Propriété de Ynuka Labs. Tous droits réservés.

## 📞 Support

Pour les questions ou problèmes, contactez: support@ynukalabs.com
