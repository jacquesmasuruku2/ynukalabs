# Ynuka Labs — API PHP

Backend PHP léger pour le panel admin, à déployer sur votre hébergement Interserver.

## Déploiement

1. **Uploader `api.php`** dans `public_html/` (ou un sous-dossier, ex. `public_html/admin-api/`).
2. **Éditer `api.php`** — renseigner :
   - `DB_USER`, `DB_PASS` (vos identifiants MySQL Interserver)
   - `JWT_SECRET` (chaîne aléatoire ≥ 32 caractères)
   - `ALLOWED_ORIGIN` (idéalement l'URL de votre panel, ou `*` pour tester)
3. **Créer la table admin** via phpMyAdmin :
   - Ouvrir `ynukalab_database_website`
   - Onglet SQL → coller le contenu de `setup.sql`
   - Générer un mot de passe hashé :
     ```bash
     php -r "echo password_hash('VotreMotDePasse', PASSWORD_BCRYPT);"
     ```
     (ou utilisez https://bcrypt-generator.com/) puis collez-le dans `password_hash`.
4. **Tester** : `https://votre-domaine.com/api.php?action=me` doit renvoyer `{"error":"Unauthorized"}`.
5. **Dans le panel** : page Login → champ « URL de l'API » → mettre `https://votre-domaine.com/api.php`.

## Endpoints

| Action | Méthode | Description |
|---|---|---|
| `?action=login` | POST | `{email, password}` → `{token}` |
| `?action=me` | GET | Renvoie l'utilisateur courant |
| `?action=list&resource=TABLE&page=1&limit=25&search=...` | GET | Liste paginée |
| `?action=get&resource=TABLE&id=ID` | GET | Détail |
| `?action=create&resource=TABLE` | POST | Création |
| `?action=update&resource=TABLE&id=ID` | POST | Mise à jour |
| `?action=delete&resource=TABLE&id=ID` | POST | Suppression |

Toutes les routes (sauf `login`) exigent l'en-tête `Authorization: Bearer <token>`.

## Sécurité

- Tables en liste blanche (impossible de cibler une table arbitraire).
- Requêtes préparées partout.
- Tokens signés HMAC-SHA256, expiration 7 jours.
- Si vous créez/modifiez un utilisateur avec un champ `password`, il est automatiquement hashé en bcrypt et stocké dans `password_hash` (si la colonne existe).
