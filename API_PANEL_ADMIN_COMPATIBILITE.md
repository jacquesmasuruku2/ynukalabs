# ✅ Compatibilité API Panel Admin - Site Public

## Modifications effectuées dans `Panel Admin/php-api/api.php`

### 1. Fonctions Google OAuth ajoutées

Ajout des fonctions helper pour la compatibilité avec le site public:

- `verify_google_id_token(string $id_token): ?array` - Vérifie un ID token Google
- `is_email_allowed(string $email): bool` - Vérifie si un email est autorisé

Ces fonctions permettent au site public d'utiliser Google OAuth via l'API du panel admin.

### 2. Actions ajoutées

#### `google_oauth_verify`
- **Usage**: Valide un ID token Google et crée/met à jour un utilisateur
- **Paramètres**: `{ id_token: string }`
- **Response**: `{ token: string, user: { id, email, name } }`
- **Compatibilité**: Site public Google Sign-In

#### `google_oauth_login`
- **Usage**: Variante simple acceptant email et name pré-validés
- **Paramètres**: `{ email: string, name: string }`
- **Response**: `{ token: string, user: { id, email, name } }`
- **Compatibilité**: Site public OAuth simplifié

### 3. Alias ajouté

- `insert` → alias pour `create`
- Permet au site public d'utiliser les deux noms d'action

### 4. Format de réponse amélioré

Action `create`/`insert` retourne maintenant un format Strapi-like:
```json
{
  "data": { ... },
  "success": true,
  "id": 123,
  "message": "Created successfully"
}
```
Code HTTP: 201 (au lieu de 200)

## 📋 Actions supportées par les deux APIs

### Actions communes
- ✅ `ping` - Diagnostic
- ✅ `login` - Connexion email/password
- ✅ `me` - Utilisateur courant
- ✅ `list` - Lister les enregistrements
- ✅ `get` - Obtenir un enregistrement
- ✅ `create`/`insert` - Créer un enregistrement
- ✅ `update` - Modifier un enregistrement
- ✅ `delete` - Supprimer un enregistrement
- ✅ `upload_image` - Uploader une image

### Actions Google OAuth
- ✅ `google_auth_url` - URL d'authentification Google
- ✅ `google_callback` - Callback Google OAuth
- ✅ `google_oauth_verify` - Vérifier token Google (ajouté)
- ✅ `google_oauth_login` - Login Google simplifié (ajouté)

### Actions spécifiques Panel Admin
- `register` - Inscription admin
- `allowed_emails_list` - Liste emails autorisés
- `allowed_emails_add` - Ajouter email autorisé
- `allowed_emails_remove` - Supprimer email autorisé

## 🎯 Tables publiques (sans authentification)

Les deux APIs autorisent l'accès sans authentification pour:
- `contact_messages` - Formulaire de contact
- `newsletter_subscribers` - Newsletter
- `event_registrations` - Inscriptions événements
- `donations` - Dons

L'API panel admin autorise également sans auth:
- `events` - Événements (lecture)
- `team_members` - Membres équipe (lecture)
- `projects` - Projets (lecture)
- `blog_posts` - Articles blog (lecture)
- `gallery_images` - Images galerie (lecture)

## 📊 Architecture finale

```
Site Public (ynukalabs.com)
    ↓ strapiFetch()
    ↓
API Panel Admin (admin.ynukalabs.com/api/api.php)
    ↓
Base de données (ynukalab_database_website)
```

## ✅ Avantages

1. **Une seule API à maintenir** - Plus simple
2. **CORS déjà configuré** - Fonctionne immédiatement
3. **Toutes les fonctionnalités** - Google OAuth, CRUD, upload
4. **Format compatible** - Réponses Strapi-like
5. **Tables partagées** - Même base de données

## 🚀 Déploiement

1. Uploadez `Panel Admin/php-api/api.php` modifié vers `public_html/api/api.php`
2. Le site public utilise déjà cette URL via `.env`
3. Testez le formulaire de contact
4. Tous les formulaires devraient fonctionner

## 🔧 Configuration

Le site public a déjà la bonne configuration:
```env
VITE_API_URL=https://admin.ynukalabs.com/api/api.php
```

Aucune modification nécessaire côté frontend.
