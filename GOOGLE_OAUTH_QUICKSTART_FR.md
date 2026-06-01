# 🚀 Configuration Rapide - Google OAuth Ynuka Labs

> **Statut:** ✅ Vos credentials sont déjà configurés. Suivez cette checklist pour finaliser.

## 5 minutes pour être opérationnel

### ✓ Étape 1: Vérifier Google Cloud Console (2 min)

1. Allez à https://console.cloud.google.com
2. Sélectionnez le projet: **`ynukalabs-497722`**
3. Allez à: **APIs & Services** → **Credentials**
4. Cliquez sur: **"Web client"** OAuth 2.0 Client
5. Vérifiez que ce Redirect URI est présent:
   ```
   https://admin.ynukalabs.com/api/api.php?action=google_callback
   ```
6. Si absent, cliquez "Edit" et l'ajoutez

✅ **Fait!**

---

### ✓ Étape 2: Uploader les fichiers PHP (1 min)

**Sur votre serveur InterServer** (ou équivalent):

1. Connectez-vous via FTP ou File Manager
2. Allez au dossier `/php/`
3. **Uploadez/remplacez ces 2 fichiers:**
   - `google-oauth.php` (les credentials sont déjà dedans)
   - `api.php` (la whitelist est déjà configurée)

```bash
# Si vous utilisez le terminal
scp google-oauth.php user@admin.ynukalabs.com:/php/
scp api.php user@admin.ynukalabs.com:/php/
```

✅ **Fait!**

---

### ✓ Étape 3: Configurer le Frontend React (1 min)

**Dans le dossier `Panel Admin/`:**

```bash
# 1. Installer la librairie Google
cd Panel Admin
bun install @react-oauth/google

# 2. Build le projet
bun run build

# 3. Uploader le dossier dist/ sur votre serveur
# (OU si vous utilisez Vercel/GitHub Pages: `vercel --prod`)
```

✅ **Fait!**

---

### ✓ Étape 4: Vérifier la liste blanche des emails (1 min)

**Dans `Ynuka Site/php/api.php`, ligne 92-98:**

Vérifiez que ces emails sont listés:
```
✓ jacquesmasuruku2@gmail.com
✓ balumeboaz@gmail.com
✓ martinmusagara@gmail.com
✓ mwatsimulamoolivier@gmail.com
```

**Pour ajouter un nouvel admin:**
1. Ouvrez `api.php` localement
2. Ajoutez l'email à la liste (ligne 92-98)
3. Uploadez le fichier

✅ **Fait!**

---

### ✓ Étape 5: Tester l'authentification (2 min)

1. Allez à: `https://admin.ynukalabs.com/login`
2. Cliquez sur le bouton **"Connexion avec Google"**
3. Sélectionnez un compte autorisé
4. Vous devriez être redirigé vers `/admin`

**Si erreur:** Consultez la section "Dépannage" du guide complet

✅ **Fait!**

---

## 📋 Checklist finale

```
[ ] Google Cloud Console vérifié
    - Redirect URI: https://admin.ynukalabs.com/api/api.php?action=google_callback
    
[ ] Fichiers PHP uploadés
    - google-oauth.php ✓
    - api.php ✓
    
[ ] Frontend React compilé et uploadé
    - dist/ folder pushed
    
[ ] Liste blanche des emails vérifiée
    - 4 emails configurés
    
[ ] Test d'authentification réussi
    - Google login fonctionne
    - Accès au panel admin
```

---

## 🔧 Configuration de credentials (si besoin)

### Informations actuelles

```
Projet Google Cloud:    ynukalabs-497722
Client ID:              1039734035041-3ob85lpfheoonvv43759desitdr7rhgc.apps.googleusercontent.com
Client Secret:          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
Redirect URI:           https://admin.ynukalabs.com/api/api.php?action=google_callback
```

### Où les credentials sont utilisés

- **Backend PHP:** `Ynuka Site/php/google-oauth.php`
- **Frontend React:** `Panel Admin/src/main-spa.tsx` (client ID seulement)

---

## 🆘 Aide rapide

### "Email not authorized for admin access"
→ Votre email n'est pas dans la whitelist
→ Modifiez `api.php` ligne 92-98

### "Token destiné à une autre application"
→ Le Client ID ne correspond pas
→ Vérifiez que `GOOGLE_CLIENT_ID` est correct dans `google-oauth.php`

### "État invalide"
→ Les sessions PHP ne sont pas activées
→ Vérifiez que le serveur accepte les cookies

### Le bouton Google ne marche pas
→ `GoogleOAuthProvider` n'est pas configuré
→ Vérifiez `Panel Admin/src/main-spa.tsx`

**Besoin d'aide?** Voir le guide complet: `GUIDE_GOOGLE_OAUTH_SETUP_FR.md`

---

## 📞 Pour aller plus loin

1. **Configuration avancée:** GUIDE_GOOGLE_OAUTH_SETUP_FR.md
2. **Dépannage complet:** Section "Dépannage" du guide
3. **Ajouter des administrateurs:** Modifiez la liste blanche dans `api.php`

---

**Prêt pour le lancement! 🎉**
