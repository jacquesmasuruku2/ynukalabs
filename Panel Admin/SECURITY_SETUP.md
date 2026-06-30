# Configuration de sécurité - Identifiants de base de données

## ⚠️ IMPORTANT - Ne jamais commiter les identifiants

Les fichiers contenant des identifiants de base de données et clés API ne doivent JAMAIS être commités dans Git.

## Fichiers sensibles (dans .gitignore)

- `php/config.php` - Identifiants MySQL + clé API Brevo
- `php-api/api.php` - Identifiants MySQL + JWT_SECRET + Google OAuth
- `.env` - Variables d'environnement

## Configuration pour le développement

### 1. Configurer PHP Backend

Copiez les fichiers d'exemple et remplacez les placeholders :

```bash
# Pour php/config.php
cp php/config.example.php php/config.php
# Éditez php/config.php avec vos identifiants réels

# Pour php-api/api.php
cp php-api/api.example.php php-api/api.php
# Éditez php-api/api.php avec vos identifiants réels
```

### 2. Variables à configurer dans php/config.php

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
define('BREVO_API_KEY', 'your_brevo_api_key_here');
```

### 3. Variables à configurer dans php-api/api.php

```php
// Base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');

// JWT Secret (générez une clé forte de 32+ caractères)
define('JWT_SECRET', 'your_jwt_secret_key_minimum_32_characters_long');

// Google OAuth
define('GOOGLE_CLIENT_ID', 'your_google_client_id');
define('GOOGLE_CLIENT_SECRET', 'your_google_client_secret');
```

## Déploiement en production

1. **NE JAMAIS** uploader les fichiers .example.php sur le serveur
2. Uploadez uniquement les fichiers configurés (config.php, api.php)
3. Vérifiez que les permissions sont correctes (644 pour les fichiers PHP)
4. Utilisez HTTPS en production
5. Changez les clés secrètes si elles ont été exposées

## Génération d'un JWT Secret sécurisé

```bash
# Générez une clé aléatoire de 32 caractères
openssl rand -base64 32
```

## Vérification

Pour vérifier que les fichiers sensibles ne sont pas dans Git :

```bash
git ls-files | grep -E "(config\.php|api\.php|\.env)"
# Ne devrait rien retourner
```

## Si les identifiants ont été commités

Si vous avez accidentellement commité des identifiants :

1. Changez immédiatement tous les mots de passe et clés API
2. Supprimez les fichiers de l'historique Git (utilisez BFG Repo-Cleaner ou git filter-repo)
3. Forcez un nouveau commit avec les fichiers corrigés
4. Informez votre équipe de sécurité
