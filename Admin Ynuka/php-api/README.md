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

## Connexion Google OAuth2

### Prérequis

1. Déployer `api.php` + `config.php` au même domaine que le panel (ex. `https://admin.ynukalabs.com/api/api.php`).
2. Exécuter `migrate-google-oauth.sql` si la table `admin_users` existait déjà.
3. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth 2.0 Client :
   - **Authorized redirect URI** (exact) :  
     `https://admin.ynukalabs.com/api/api.php?action=google_callback`
4. Configurer sur le serveur (cPanel → Variables d'environnement) **ou** décommenter dans `config.php` :
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (identique à Google Console)
   - `PANEL_URL` = `https://admin.ynukalabs.com`
   - `ALLOWED_GOOGLE_EMAILS` = votre email Gmail **ou** `*` pour tout compte vérifié

### Comportement

| Cas | Résultat |
|-----|----------|
| Email déjà dans `admin_users` | Connexion OK (mise à jour `google_id`) |
| Nouvel email + dans `ALLOWED_GOOGLE_EMAILS` | Création auto du compte admin |
| Nouvel email + liste vide | Erreur `not_authorized` |

### Test

```
https://admin.ynukalabs.com/api/api.php?action=ping
```

Vérifier : `"google_oauth_set": true`, `"curl_enabled": true`, `"admin_users_table": true`.

## Endpoints

| Action | Méthode | Auth | Description |
|---|---|---|---|
| `?action=ping` | GET | non | Diagnostic : DB, tables, config |
| `?action=login` | POST | non | `{email, password}` → `{token}` |
| `?action=google_auth_url` | GET | non | URL de redirection Google |
| `?action=google_callback` | GET | non | Callback Google (navigateur) |
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
