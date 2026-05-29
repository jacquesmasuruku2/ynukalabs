# Fichiers à uploader sur admin.ynukalabs.com

## Panel React (après `npm run build` dans Panel Admin)

| Local | Serveur |
|-------|---------|
| `Panel Admin/dist/*` | `public_html/` (index.html, assets/) |
| `Panel Admin/public_html.htaccess` | `public_html/.htaccess` |

## API PHP + Google OAuth

| Local | Serveur |
|-------|---------|
| `Panel Admin/php-api/api.php` | `public_html/api/api.php` |
| `Panel Admin/php-api/.htaccess` | `public_html/api/.htaccess` |

## Vérifications

1. https://admin.ynukalabs.com/api/api.php?action=ping → `"google_oauth_set": true`
2. https://admin.ynukalabs.com/api/api.php?action=google_auth_url → JSON avec `"url": "https://accounts.google.com/..."`
3. Login → bouton Google → retour connecté sur `/admin`

## Google Cloud Console

**Authorized redirect URI** (exact) :

```
https://admin.ynukalabs.com/api/api.php?action=google_callback
```

**Accès Google** : par défaut tout compte Google vérifié peut se connecter (`GOOGLE_OPEN_ACCESS=true`).
Pour restreindre : `SetEnv GOOGLE_OPEN_ACCESS false` dans `api/.htaccess` + emails dans la table `admin_allowed_emails`.

**Inscription formulaire** : `SetEnv ALLOW_REGISTRATION true` pour ouvrir à tous, sinon ajouter des emails :

```sql
INSERT INTO admin_allowed_emails (email, note) VALUES ('collab@example.com', 'Équipe');
```

API (connecté) : `?action=allowed_emails_add` POST `{"email":"..."}`, `?action=allowed_emails_list`, `?action=allowed_emails_remove`.
