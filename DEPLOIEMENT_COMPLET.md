# 🚀 Guide de Déploiement Complet - Ynuka Labs

## 📐 Architecture du Système

Le système utilise **deux APIs PHP** qui partagent la même base de données MySQL:

### 1. API du Site Public
- **URL**: `https://ynukalabs.com/php/api.php`
- **Emplacement**: `public_html/php/api.php`
- **Rôle**: Gère les formulaires publics (contact, newsletter, inscriptions événements, dons)
- **Authentification**: Non requise pour les tables publiques
- **Fichiers**: `Ynuka Site/php/api.php`, `config.php`, `database.php`

### 2. API du Panel Admin
- **URL**: `https://admin.ynukalabs.com/api/api.php`
- **Emplacement**: `public_html/api/api.php` (sous-domaine admin)
- **Rôle**: Gère l'authentification admin, CRUD sur toutes les tables, Google OAuth
- **Authentification**: Requise (JWT ou Google OAuth)
- **Fichiers**: `Panel Admin/php-api/api.php`

### Base de Données
- **Nom**: `ynukalab_database_website`
- **Hôte**: `localhost`
- **Utilisateur**: `ynukalab_admin-jacques`
- **Tables partagées**: contact_messages, newsletter_subscribers, events, projects, blog_posts, etc.

---

## 📋 Étapes de Déploiement

### Étape 1: Déployer l'API du Site Public

1. **Via FTP (FileZilla)** ou DirectAdmin File Manager:
   - Connectez-vous au serveur (205.209.109.3)
   - Naviguez vers `public_html/php/`
   - Uploadez les fichiers:
     - `config.php`
     - `api.php`
     - `database.php`
     - `google-oauth.php` (optionnel)
     - `test-contact.php` (pour tester)

2. **Permissions**: 644 pour tous les fichiers PHP

### Étape 2: Déployer l'API du Panel Admin

1. **Via FTP** ou DirectAdmin:
   - Naviguez vers `public_html/api/` (sous-domaine admin)
   - Uploadez le fichier:
     - `api.php` (depuis `Panel Admin/php-api/api.php`)

2. **Permissions**: 644

### Étape 3: Créer les Tables de la Base de Données

1. **Via phpMyAdmin** (DirectAdmin → phpMyAdmin):
   - Sélectionnez la base `ynukalab_database_website`
   - Cliquez sur l'onglet **SQL**
   - Exécutez le contenu de `Ynuka Site/php/tables-complete.sql`
   - Vérifiez que toutes les tables sont créées

### Étape 4: Configurer les Variables d'Environnement

#### Site Public (`Ynuka Site/.env`):
```env
VITE_API_URL=https://ynukalabs.com/php/api.php
```

#### Panel Admin (`Panel Admin/.env`):
```env
VITE_API_URL=https://admin.ynukalabs.com/api/api.php
```

### Étape 5: Tester les APIs

#### Test API Site Public:
```bash
# Test ping
curl "https://ynukalabs.com/php/api.php?action=ping"

# Test formulaire contact
php "Ynuka Site/php/test-contact.php"
```

#### Test API Panel Admin:
```bash
# Test ping
curl "https://admin.ynukalabs.com/api/api.php?action=ping"
```

Réponse attendue:
```json
{
  "status": "ok",
  "database": "ynukalab_database_website",
  "tables": [...]
}
```

### Étape 6: Builder et Déployer les Frontends

#### Site Public:
```bash
cd "Ynuka Site"
npm run build
```
Déployez le dossier `dist/` vers `public_html/`

#### Panel Admin:
```bash
cd "Panel Admin"
npm run build
```
Déployez le dossier `dist/` vers `public_html/` (sous-domaine admin)

---

## ✅ Fonctionnalités à Vérifier

### Site Public (ynukalabs.com):
- [ ] Formulaire de contact (`/contact`) - envoie vers `contact_messages`
- [ ] Newsletter - envoie vers `newsletter_subscribers`
- [ ] Inscription événements - envoie vers `event_registrations`
- [ ] Dons - envoie vers `donations`
- [ ] Affichage des événements - lit depuis `events`
- [ ] Affichage des projets - lit depuis `projects`
- [ ] Affichage du blog - lit depuis `blog_posts`

### Panel Admin (admin.ynukalabs.com):
- [ ] Connexion admin (email/password ou Google OAuth)
- [ ] Liste des messages de contact
- [ ] Lecture des messages de contact
- [ ] Suppression des messages de contact
- [ ] CRUD sur les événements
- [ ] CRUD sur les projets
- [ ] CRUD sur les articles de blog
- [ ] Gestion des abonnés newsletter

---

## 🔧 Tables Publiques (Sans Authentification)

Ces tables peuvent être modifiées sans authentification depuis le site public:

- `contact_messages` - Formulaire de contact
- `newsletter_subscribers` - Inscription newsletter
- `event_registrations` - Inscription aux événements
- `donations` - Dons

## 🔒 Tables Protégées (Authentification Requise)

Ces tables nécessitent une authentification admin:

- `admin_users` - Utilisateurs admin
- `blog_posts` - Articles de blog (CRUD)
- `blog_comments` - Commentaires (modération)
- `events` - Événements (CRUD)
- `projects` - Projets (CRUD)
- `gallery_images` - Images galerie (CRUD)
- `team_members` - Membres équipe (CRUD)
- `resource_items` - Ressources (CRUD)

---

## 🐛 Dépannage

### Le formulaire de contact ne fonctionne pas:
1. Vérifiez que `https://ynukalabs.com/php/api.php?action=ping` répond
2. Vérifiez les permissions des fichiers PHP (644)
3. Vérifiez que la table `contact_messages` existe dans phpMyAdmin
4. Ouvrez la console navigateur (F12) pour voir les erreurs réseau

### Le panel admin ne se connecte pas:
1. Vérifiez que `https://admin.ynukalabs.com/api/api.php?action=ping` répond
2. Vérifiez que la table `admin_users` existe
3. Vérifiez les credentials dans `php-api/api.php`
4. Testez la connexion via curl:
   ```bash
   curl -X POST "https://admin.ynukalabs.com/api/api.php?action=login" \
     -H "Content-Type: application/json" \
     -d '{"email":"votre@email.com","password":"votre_password"}'
   ```

### Erreur CORS:
1. Vérifiez que `ALLOWED_ORIGIN` dans l'API inclut votre domaine
2. Vérifiez les headers CORS dans les fichiers API

### Erreur de connexion base de données:
1. Vérifiez les credentials MySQL dans `config.php` et `php-api/api.php`
2. Vérifiez que MySQL est actif sur le serveur
3. Testez la connexion via phpMyAdmin

---

## 📞 Informations Serveur

- **Domaine**: ynukalabs.com
- **Sous-domaine admin**: admin.ynukalabs.com
- **IP**: 205.209.109.3
- **DirectAdmin**: https://vda6600.is.cc:2222
- **Utilisateur**: ynukalab
- **Base de données**: ynukalab_database_website
- **Utilisateur DB**: ynukalab_admin-jacques

---

## 🔄 Flux de Données

### Formulaire Contact:
```
Utilisateur → Formulaire React → strapiFetch("/api/contact-messages")
→ API PHP (ynukalabs.com/php/api.php?action=create&resource=contact_messages)
→ Base de données MySQL (contact_messages)
→ Panel Admin peut lire/supprimer
```

### Panel Admin:
```
Admin connecté → Panel React → strapiFetch("/api/contact_messages")
→ API PHP (admin.ynukalabs.com/api/api.php?action=list&resource=contact_messages)
→ Base de données MySQL (contact_messages)
→ Affichage dans le panel
```

---

## ✅ Checklist de Déploiement

- [ ] API site public déployée (`public_html/php/api.php`)
- [ ] API panel admin déployée (`public_html/api/api.php`)
- [ ] Tables créées via `tables-complete.sql`
- [ ] `.env` site public configuré avec `VITE_API_URL`
- [ ] `.env` panel admin configuré avec `VITE_API_URL`
- [ ] API site public testée (ping)
- [ ] API panel admin testée (ping)
- [ ] Frontend site public buildé et déployé
- [ ] Frontend panel admin buildé et déployé
- [ ] Formulaire contact testé
- [ ] Panel admin connexion testée
- [ ] CRUD panel admin testé
