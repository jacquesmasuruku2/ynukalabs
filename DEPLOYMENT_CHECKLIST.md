# Checklist de Déploiement - Interserver

## 📋 Avant le déploiement (Local)

- [ ] Générer le hash du mot de passe admin
  ```bash
  cd "Ynuka Site/php"
  php generate-admin.php "YourSecurePassword"
  ```
  Garder le hash généré

## 🚀 Déploiement (Interserver FTP ou SSH)

### Via FTP/SFTP (recommandé pour shared hosting)

1. Télécharger ces fichiers vers `/public_html/`
   - [ ] `Ynuka Site/php/api.php`
   - [ ] `Ynuka Site/php/config.php`
   - [ ] `Ynuka Site/php/setup.sql`

2. Test de connexion API
   - [ ] Ouvrir: `https://ynukalabs.com/api.php?action=ping`
   - [ ] Vérifier que la réponse contient `"status": "ok"`

### Via phpMyAdmin (créer compte admin)

1. Accéder à phpMyAdmin sur cPanel Interserver
2. Sélectionner database `ynukalab_database_website`
3. Exécuter cette requête SQL:
   ```sql
   INSERT INTO admin_users (email, password_hash, name) 
   VALUES ('admin@ynukalabs.com', 'PASTE_HASH_HERE', 'Admin');
   ```
   Remplacer `PASTE_HASH_HERE` par le hash du step local

## ✅ Vérification Après Déploiement

- [ ] Admin Panel accès: `https://admin.ynukalabs.com`
- [ ] Essayer de login avec `admin@ynukalabs.com` et le password
- [ ] Créer une ressource de test (ex: team_members)
- [ ] Vérifier que le site public peut lire les données
- [ ] Vérifier CORS (admin panel peut appeler l'API)

## 🔐 Configuration en Production

### Changer le JWT_SECRET

Dans `/public_html/api.php`, ligne ~30:
```php
function jwt_secret() {
    return 'YOUR_LONG_RANDOM_STRING_AT_LEAST_32_CHARS';
}
```

Générer une clé: `openssl rand -base64 32`

### Restreindre CORS (optionnel)

Remplacer ligne 13:
```php
header('Access-Control-Allow-Origin: *');
```

Par:
```php
header('Access-Control-Allow-Origin: https://admin.ynukalabs.com, https://ynukalabs.com');
```

## 📞 Troubleshooting

### "Database connection failed"
- Vérifier DB_USER et DB_PASS dans config.php
- Vérifier que l'utilisateur MySQL a accès à la database
- Vérifier les paramètres de connexion sur le serveur

### API retourne 500 error
- Vérifier les logs d'erreur: `/public_html/error_log`
- Activé display_errors dans config.php pour debug
- Vérifier les permissions des fichiers (755 pour PHP)

### Admin Panel ne peut pas se connecter
- Vérifier le JWT_SECRET dans api.php
- Vérifier que le hash bcrypt est correct
- Vérifier que le token Bearer est envoyé correctement

## 📚 Documentation Complète

Voir [API_SETUP.md](../API_SETUP.md) pour la documentation technique complète.
