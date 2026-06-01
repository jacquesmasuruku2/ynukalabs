# Admin Panel Deployment - Next Steps

Panel Admin a été converti en **SPA React** pour fonctionner sur Interserver (shared hosting).

## ✅ Complété Localement

- ✅ Conversion SSR → SPA
- ✅ Script `npm run build:spa` 
- ✅ Build réussi (`dist/`)
- ✅ GitHub Actions workflow mise à jour
- ✅ `.htaccess-spa` créé pour routing client-side

## 🚀 À faire sur Interserver

### 1. Upload des fichiers
```
Panel Admin/dist/* → /home/ynukalab/admin.ynukalabs.com/
Panel Admin/.htaccess-spa → /home/ynukalab/admin.ynukalabs.com/.htaccess
```

### 2. Renommer le fichier d'entrée
```bash
mv /home/ynukalab/admin.ynukalabs.com/index-spa.html \
   /home/ynukalab/admin.ynukalabs.com/index.html
```

### 3. Mettre en place le .htaccess
```bash
cp /home/ynukalab/admin.ynukalabs.com/.htaccess-spa \
   /home/ynukalab/admin.ynukalabs.com/.htaccess
```

### 4. Vérifier permissions
```bash
chmod 755 /home/ynukalab/admin.ynukalabs.com
chmod 644 /home/ynukalab/admin.ynukalabs.com/.htaccess
chmod -R 644 /home/ynukalab/admin.ynukalabs.com/assets/*
```

### 5. Tester
```bash
# Via navigateur
https://admin.ynukalabs.com
https://admin.ynukalabs.com/dashboard    # Devrait fonctionner avec le .htaccess
```

## 🤖 GitHub Actions

Le workflow est maintenant configuré pour:
1. Détecter les changements dans `Panel Admin/**`
2. Lancer `npm run build:spa`
3. SCP les fichiers via SSH
4. Vérifier le déploiement

**Prochains pushs:**
```bash
git push origin main
# → Déclenche le déploiement automatique vers Interserver
```

## 📝 Architecture SPA

```
Panel Admin/
├── index.html (original, SSR)
├── index-spa.html (nouveau, SPA)
├── src/
│   ├── main-spa.tsx (point d'entrée SPA)
│   ├── router.tsx (TanStack Router en mode SPA)
│   └── ...
├── vite.config.ts (config SSR)
├── vite-spa.config.ts (config SPA)
└── package.json (build vs build:spa)
```

**Build:**
- `npm run build` → SSR (TanStack Start)
- `npm run build:spa` → SPA (pour Interserver)

## 🔧 Troubleshooting

### "Cannot GET /dashboard"
- Le `.htaccess` n'est pas en place
- Vérifier qu'il est dans `/home/ynukalab/admin.ynukalabs.com/.htaccess`
- Vérifier que mod_rewrite est activé sur le serveur

### Blanc/erreur JS
- Vérifier `index.html` existe (pas `index-spa.html`)
- Vérifier les permissions des fichiers (644)
- Regarder la console du navigateur pour les erreurs

### Google OAuth

Fichiers source : `Panel Admin/php-api/api.php` et `Panel Admin/php-api/.htaccess`

Après upload, `?action=ping` doit afficher `"google_oauth_set": true`.

Redirect URI dans Google Cloud : `https://admin.ynukalabs.com/api/api.php?action=google_callback`

Voir `Panel Admin/php-api/DEPLOY-SERVEUR.md` pour la liste complète des fichiers.

### API non accessible / « Erreur d'authentification »
- L'API doit répondre en **JSON**, pas en HTML du panel. Tester dans le navigateur :
  - `https://admin.ynukalabs.com/api/api.php?action=ping` → doit afficher `{"ok":true,...}`
  - `https://admin.ynukalabs.com/api.php?action=ping` → renvoie souvent la page React (mauvaise URL)
- Placer `api.php` dans `public_html/api/api.php` (ou à la racine **et** exclure `api.php` du rewrite SPA dans `.htaccess`)
- Dans `Panel Admin/.env` : `VITE_API_URL=https://admin.ynukalabs.com/api/api.php` puis rebuild (`npm run build:spa`)
- Les comptes se créent dans la table `admin_users` (phpMyAdmin / `setup.sql`), pas via « Créer un compte » sur le formulaire

## 📚 Documentation

- [ADMIN_SPA_CONVERSION.md](ADMIN_SPA_CONVERSION.md) - Détails techniques
- [API_SETUP.md](API_SETUP.md) - Configuration API
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Checklist déploiement
- [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md) - Secrets GitHub

---

**Une fois déployé sur Interserver:**
- Admin Panel accès: `https://admin.ynukalabs.com`
- Peut créer/modifier/supprimer données via l'API
- Site public peut lire les données

