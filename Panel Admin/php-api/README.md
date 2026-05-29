# Ynuka Labs — API PHP

Backend PHP léger à déployer sur Interserver.

## Déploiement pas à pas

### 1. Éditer `api.php`
Ouvrez le fichier et renseignez :
```php
define('DB_USER', 'votre_user_mysql');
define('DB_PASS', 'votre_password_mysql');
define('JWT_SECRET', 'chaine-aleatoire-32-caracteres-minimum');
```

### 2. Uploader sur Interserver
Via FTP ou cPanel File Manager, uploadez **`api.php` ET `.htaccess`** dans `public_html/` (ou un sous-dossier comme `public_html/admin-api/`).

> Le `.htaccess` est **indispensable** : sans lui, l'en-tête `Authorization` n'arrive pas à PHP sur l'hébergement mutualisé, et toutes les routes renvoient `401 Unauthorized`.

### 3. Tester la connexion DB
Ouvrez dans votre navigateur :
```
https://votre-domaine.com/api.php?action=ping
```
Vous devez voir un JSON avec :
- `"db": "ok"` → la connexion MySQL fonctionne
- `tables_found` → la liste des tables de votre base
- `tables_missing` → ce qui manque par rapport aux 13 attendues
- `admin_users_table: true/false`

Si `"db": "error"`, le message d'erreur vous dit ce qui ne va pas (mauvais user/pass, base introuvable, etc.).

### 4. Créer la table admin + un compte
Dans phpMyAdmin, ouvrez la base `ynukalab_database_website`, onglet SQL, exécutez le contenu de `setup.sql`.

Pour générer un hash de mot de passe :
```bash
php -r "echo password_hash('VotreMotDePasse', PASSWORD_BCRYPT) . PHP_EOL;"
```
ou utilisez https://bcrypt-generator.com/ — puis collez-le dans la requête INSERT.

### 5. Connecter le panel
Sur la page Login du panel, mettez l'URL complète : `https://votre-domaine.com/api.php`

### 6. (Recommandé pour la prod) Restreindre CORS
Dans `api.php`, remplacez :
```php
define('ALLOWED_ORIGIN', '*');
```
par l'URL exacte de votre panel, ex : `'https://admin.ynukalabs.com'`.

## Endpoints

| Action | Méthode | Auth | Description |
|---|---|---|---|
| `?action=ping` | GET | non | Diagnostic : DB, tables, config |
| `?action=login` | POST | non | `{email, password}` → `{token}` |
| `?action=google_auth_url` | GET | non | Renvoie l'URL Google à laquelle rediriger le navigateur |
| `?action=google_callback` | GET | non | Callback Google → 302 vers `PANEL_URL/login#token=...` |
| `?action=me` | GET | oui | Utilisateur courant |
| `?action=list&resource=T&page=1&limit=25&search=...` | GET | oui | Liste paginée |
| `?action=get&resource=T&id=X` | GET | oui | Détail |
| `?action=create&resource=T` | POST | oui | Création |
| `?action=update&resource=T&id=X` | POST | oui | Mise à jour |
| `?action=delete&resource=T&id=X` | POST | oui | Suppression |

## Sécurité

- Liste blanche de tables (impossible de cibler une table arbitraire)
- Requêtes préparées partout
- Tokens signés HMAC-SHA256, expiration 7 jours
- Champ `password` automatiquement hashé en bcrypt et stocké dans `password_hash` lors d'un create/update sur une table qui possède cette colonne

---

## Connexion Google (OAuth2)

Le bouton **Google** du formulaire `/login` appelle `?action=google_auth_url` → redirige vers Google → Google redirige vers `?action=google_callback` → le backend redirige vers `PANEL_URL/login#token=...` que le frontend stocke.

### 1. Créer les credentials dans Google Cloud

1. Allez sur https://console.cloud.google.com/ → créez (ou sélectionnez) un projet.
2. **APIs & Services → OAuth consent screen** : configurez l'écran de consentement (External, nom de l'app, email de support).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type : **Web application**
   - **Authorized redirect URIs** : ajoutez **exactement** :
     ```
     https://admin.ynukalabs.com/api/api.php?action=google_callback
     ```
   - Copiez le **Client ID** et le **Client secret**.

### 2. Configurer les variables côté Interserver

Deux options — au choix :

**A. Éditer directement `api.php`** (le plus simple sur mutualisé) :
```php
define('GOOGLE_CLIENT_ID',     '1234567890-abc.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', 'GOCSPX-xxxxxxxxxxxx');
define('GOOGLE_REDIRECT_URI',  'https://votre-domaine.com/api.php?action=google_callback');
define('PANEL_URL',            'https://admin.ynukalabs.com'); // URL du panel React
```

**B. Variables d'environnement** (si votre hébergement le permet via cPanel → "Environment variables" ou un `.htaccess`) :
```apache
SetEnv GOOGLE_CLIENT_ID     1234567890-abc.apps.googleusercontent.com
SetEnv GOOGLE_CLIENT_SECRET GOCSPX-xxxxxxxxxxxx
SetEnv GOOGLE_REDIRECT_URI  https://votre-domaine.com/api.php?action=google_callback
SetEnv PANEL_URL            https://admin.ynukalabs.com
```
`api.php` lit `getenv('GOOGLE_CLIENT_ID')` etc. avant de retomber sur la valeur en dur.

### 3. Mettre à jour la table `admin_users`

Si elle existait déjà, ajoutez les colonnes :
```sql
ALTER TABLE `admin_users` ADD COLUMN `avatar_url` VARCHAR(500) NULL;
ALTER TABLE `admin_users` ADD COLUMN `google_id` VARCHAR(64) NULL UNIQUE;
ALTER TABLE `admin_users` MODIFY `password_hash` VARCHAR(255) NULL;
```

### 4. Autoriser les admins (auto-provisioning)

La connexion Google peut **auto-créer** le compte admin à la première connexion. Pour cela, ajoutez l'email dans la liste blanche `ALLOWED_GOOGLE_EMAILS` (séparés par des virgules) :

```php
// dans api.php
define('ALLOWED_GOOGLE_EMAILS', 'vous@gmail.com,partner@gmail.com');
```
ou via env :
```apache
SetEnv ALLOWED_GOOGLE_EMAILS vous@gmail.com,partner@gmail.com
```

Au premier login Google d'un email allowlisté, le backend :
1. Crée la ligne dans `admin_users` (avec `google_id`, `avatar_url`, sans mot de passe).
2. Crée — si la table existe — une ligne dans `users` (email + nom + avatar).
3. Ajoute le rôle `admin` dans `user_roles` (best-effort, s'adapte aux colonnes existantes).

> Pour autoriser **n'importe quel** compte Google vérifié (déconseillé en prod) : `ALLOWED_GOOGLE_EMAILS=*`.
> Pour désactiver l'auto-provisioning : laissez `ALLOWED_GOOGLE_EMAILS` vide et insérez manuellement la ligne :
> ```sql
> INSERT INTO admin_users (email, name) VALUES ('vous@gmail.com', 'Votre Nom');
> ```


### 5. Vérifier

- Ouvrez `https://votre-domaine.com/api.php?action=ping` → `config.google_oauth_set` doit être `true`.
- Sur `/login`, cliquez **Google** → choisissez votre compte → vous êtes redirigé sur `/admin`.

### Erreurs possibles (affichées en toast)

| Code | Cause |
|---|---|
| `not_authorized` | L'email Google n'est pas dans `admin_users` |
| `invalid_profile` | Email Google non vérifié |
| `token_exchange_failed` | Client ID / Secret incorrects, ou redirect URI ne correspond pas |
| `missing_code` | Google n'a pas renvoyé de code (utilisateur a annulé) |

