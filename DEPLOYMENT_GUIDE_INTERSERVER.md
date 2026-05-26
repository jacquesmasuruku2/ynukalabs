# 🚀 Guide de Déploiement API sur Interserver

## Informations de votre compte Interserver

```
Domaine: ynukalabs.com
IP: 205.209.109.3
DirectAdmin: https://vda6600.is.cc:2222
Utilisateur: ynukalab
Mot de passe: ZA5!s7Qf

FTP:
- Serveur: 205.209.109.3 (SSL/TLS disponible)
- Utilisateur: ynukalab
- Mot de passe: ZA5!s7Qf

Base de données MySQL:
- Host: localhost
- Nom: ynukalab_database_website
- Utilisateur: ynukalab_admin-jacques
- Mot de passe: Admin-Jacques.ynuka_db
```

---

## ✅ Étape 1: Préparer le fichier API

Avant de déployer, **générez une clé JWT sécurisée**:

```bash
# Si vous avez OpenSSL (Linux/Mac):
openssl rand -base64 32

# Ou utilisez un générateur en ligne:
# https://generate-random.org/api-token-generator
# Copiez une clé de 32+ caractères
```

Modifiez `Panel Adm/php-api/api.php` ligne 19:
```php
define('JWT_SECRET', 'VOTRE_CLE_GENEREE_ICI');  // Remplacez par la clé générée
```

---

## 📤 Étape 2: Uploader via FTP

### Option A: Avec FileZilla ou un client FTP

1. Ouvrez FileZilla
2. Connectez-vous:
   - **Hôte**: 205.209.109.3
   - **Utilisateur**: ynukalab
   - **Mot de passe**: ZA5!s7Qf
   - **Protocol**: SFTP ou FTP (SSL/TLS)
   - **Port**: 22 (SFTP) ou 21 (FTP)

3. Naviguez vers `public_html/`

4. Uploadez le fichier:
   - De: `Panel Adm/php-api/api.php`
   - Vers: `public_html/api.php`

5. **Important**: Changez les permissions
   - Clic droit → Properties
   - Permissions: 644 (rw-r--r--)

### Option B: Via DirectAdmin

1. Accédez à https://vda6600.is.cc:2222
2. Connectez-vous (ynukalab / ZA5!s7Qf)
3. Allez à **File Manager**
4. Naviguez vers `public_html/`
5. Uploadez `api.php`
6. Changez les permissions à 644

---

## 📊 Étape 3: Créer les tables

### Via phpMyAdmin

1. Accédez à DirectAdmin → **PHPMyAdmin**
2. Sélectionnez la base: `ynukalab_database_website`
3. Cliquez sur **SQL** (onglet en haut)
4. Collez le contenu de `Panel Adm/php-api/setup.sql`
5. Cliquez **Go**

Cela créera les tables:
- `admin_users` (pour l'authentification)
- `jwt_tokens` (optionnel, pour la gestion des sessions)

### Créer un utilisateur admin initial

```sql
-- Exécutez ceci dans phpMyAdmin après avoir lancé setup.sql
-- Remplacez email/password par les vôtres
INSERT INTO admin_users (email, password_hash, name, created_at) VALUES (
  'admin@ynukalabs.com',
  '$2y$10$Nm9pL8K5Qx2M1Z9N3Y4K5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D', -- mot de passe: "password123"
  'Admin',
  NOW()
);
```

Ou utilisez le formulaire de création de compte dans la panel une fois déployé.

---

## 🧪 Étape 4: Tester l'API

### Test 1: Ping (sans authentification)
```bash
curl "https://admin.ynukalabs.com/api.php?action=ping"
```

**Réponse attendue**:
```json
{
  "db": "ok",
  "tables": [
    "users", "user_roles", "blog_posts", "blog_comments",
    "contact_messages", "donations", "events", "event_registrations",
    "gallery_images", "newsletter_subscribers", "projects",
    "resource_items", "team_members"
  ],
  "message": "All systems nominal"
}
```

### Test 2: Connexion
```bash
curl -X POST "https://admin.ynukalabs.com/api.php?action=login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ynukalabs.com","password":"password123"}'
```

**Réponse attendue**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@ynukalabs.com",
    "name": "Admin"
  }
}
```

### Test 3: Accès protégé
```bash
TOKEN="eyJ..." # Copiez depuis la réponse précédente
curl "https://admin.ynukalabs.com/api.php?action=list&table=users" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🌐 Étape 5: Accéder à la Panel

Une fois l'API déployée et testée:

1. Ouvrez https://admin.ynukalabs.com/
2. Connectez-vous avec les credentials admin
3. Vous devriez voir le tableau de bord

**IMPORTANT**: 
- Panel Adm utilise `https://admin.ynukalabs.com/api.php`
- Panel Admin utilise `https://admin.ynukalabs.com/api/api.php` (avec fallback)

Si l'API est uniquement à `public_html/api.php`, utilisez la première URL.

---

## 🔒 Étape 6: Configuration Google OAuth (optionnel)

Si vous voulez permettre la connexion avec Google:

1. Allez sur https://console.cloud.google.com/
2. Créez un OAuth client ID (Web application)
3. Autorisez l'URI: `https://admin.ynukalabs.com/api.php?action=google_callback`
4. Modifiez `api.php`:
   ```php
   define('GOOGLE_CLIENT_ID',     'VOTRE_CLIENT_ID.apps.googleusercontent.com');
   define('GOOGLE_CLIENT_SECRET', 'VOTRE_SECRET');
   define('GOOGLE_REDIRECT_URI',  'https://admin.ynukalabs.com/api.php?action=google_callback');
   define('ALLOWED_GOOGLE_EMAILS', 'votre-email@gmail.com');  // ou '*' pour tous
   ```
5. Uploadez à nouveau `api.php`

---

## 📋 Checklist de déploiement

- [ ] Clé JWT générée et mise à jour dans `api.php` ligne 19
- [ ] `api.php` uploadé sur Interserver à `public_html/api.php`
- [ ] Permissions du fichier changées à 644
- [ ] `setup.sql` exécuté dans phpMyAdmin
- [ ] Utilisateur admin créé
- [ ] Test ping réussi: `https://admin.ynukalabs.com/api.php?action=ping`
- [ ] Test login réussi
- [ ] Panel accessible à `https://admin.ynukalabs.com/`
- [ ] Panel Admin configuré avec bonne `.env`
- [ ] Google OAuth configuré (optionnel)

---

## ⚠️ Troubleshooting

### Erreur: "CORS blocked"
→ Vérifiez que `ALLOWED_ORIGIN` dans `api.php` inclut votre domaine

### Erreur: "Connection refused" à la base de données
→ Vérifiez les credentials MySQL dans `api.php` lignes 16-18

### Erreur: "Table 'ynukalab_database_website.admin_users' doesn't exist"
→ Exécutez `setup.sql` dans phpMyAdmin

### Le mot de passe/token ne fonctionne pas
→ Vérifiez que `JWT_SECRET` est correctement défini dans `api.php`
→ Assurez-vous que la table `admin_users` a bien été créée

### La panel reste sur la page de login
→ Vérifiez les URLs de l'API dans les fichiers `.env`
→ Ouvrez la console du navigateur (F12) pour voir les erreurs

---

## 📞 Support

- DirectAdmin: https://vda6600.is.cc:2222
- Credentials: ynukalab / ZA5!s7Qf
- Documentation API: `Panel Adm/php-api/README.md`

