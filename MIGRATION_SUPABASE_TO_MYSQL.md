# Migration de Supabase vers MySQL/PHP API

## Résumé des changements

Vous avez demandé de remplacer Supabase par votre base de données MySQL sur Interserver. J'ai effectué les changements suivants :

### 1. ✅ Configuration MySQL (API PHP)
- **Fichier** : `Panel Adm/php-api/api.php`
- **Changement** : Mis à jour les identifiants MySQL avec vos vraies données :
  ```
  DB_HOST: localhost
  DB_NAME: ynukalab_database_website
  DB_USER: ynukalab_admin-jacques
  DB_PASS: Admin-Jacques.ynuka_db
  ```

### 2. ✅ Services d'authentification créés
Deux nouveaux fichiers de service ont été créés pour remplacer Supabase :

#### Panel Adm
- `Panel Adm/src/lib/php-auth.ts` - Service d'authentification utilisant l'API PHP
- `Panel Adm/src/lib/php-api.ts` - Client générique pour les opérations CRUD

#### Panel Admin/ynuka-hub-main
- `Panel Admin/ynuka-hub-main/src/lib/php-auth.ts` - Service d'authentification
- `Panel Admin/ynuka-hub-main/src/lib/php-api.ts` - Client API générique

### 3. ✅ Fichiers mises à jour

#### Panel Adm
- `src/routes/login.tsx` - Utilise maintenant `phpAuth` au lieu de Supabase
- `src/routes/admin.tsx` - Utilise `phpAuth` pour les vérifications de session
- `src/routes/admin.roles.tsx` - Utilise `phpApi` pour les opérations CRUD

#### Panel Admin/ynuka-hub-main
- `src/routes/login.tsx` - Utilise `phpAuth`
- `src/routes/admin.tsx` - Utilise `phpAuth` 
- `src/routes/admin.roles.tsx` - Utilise `phpApi`

### 4. ✅ Variables d'environnement
Mis à jour : `Panel Adm/.env` et `Panel Admin/ynuka-hub-main/.env`
```
VITE_API_URL=https://admin.ynukalabs.com/api.php
```

## Prochaines étapes requises

### 1. Configuration de l'API PHP
La variable d'environnement est déjà configurée dans les fichiers `.env` :
```bash
VITE_API_URL=https://admin.ynukalabs.com/api.php
```

### 2. Générer un JWT_SECRET sécurisé
Dans `Panel Adm/php-api/api.php`, ligne 19, générez une clé secrète longue de 32+ caractères :
```php
define('JWT_SECRET', 'REMPLACER_AVEC_UNE_CLE_ALEATOIRE_LONGUE');
```

Vous pouvez générer une clé avec :
```bash
php -r 'echo base64_encode(random_bytes(32));'
```

### 3. Déployer l'API PHP sur Interserver
1. Uploade `Panel Adm/php-api/api.php` sur ton serveur Interserver
2. Accède à `https://admin.ynukalabs.com/api.php?action=ping` dans le navigateur
3. Vérifie que la réponse montre `"db": "ok"` et les tables détectées

### 4. Créer les utilisateurs administrateurs
Exécute `Panel Adm/php-api/setup.sql` dans phpMyAdmin :
```sql
-- Cette table stocke les administrateurs
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  google_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crée un admin avec le mot de passe 'password'
-- Hash généré avec password_hash('password', PASSWORD_BCRYPT)
INSERT INTO admin_users (email, password_hash, name) VALUES
  ('admin@example.com', '$2y$10$...', 'Administrateur');
```

Pour générer un hash de mot de passe :
```bash
php -r 'echo password_hash("votre_mot_de_passe", PASSWORD_BCRYPT);'
```

### 5. Ajouter la table user_roles (pour les rôles)
```sql
CREATE TABLE IF NOT EXISTS user_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Points importants

### ⚠️ Authentification
- L'authentification se fait maintenant via votre API PHP MySQL
- Les tokens sont des JWT stockés dans `localStorage`
- Durée de vie du token : 7 jours

### ⚠️ Google OAuth
- Google OAuth est configuré dans l'API PHP (`action=google_auth_url`)
- Vous devez configurer les identifiants Google dans `Panel Adm/php-api/api.php` :
  ```php
  define('GOOGLE_CLIENT_ID', 'votre_client_id.apps.googleusercontent.com');
  define('GOOGLE_CLIENT_SECRET', 'votre_client_secret');
  ```

### ⚠️ Inscription (Sign Up)
- La création de comptes via le formulaire n'est **pas activée** actuellement
- Les utilisateurs doivent être créés manuellement par un admin dans la base de données
- Vous pouvez l'activer en ajoutant un endpoint `signup` à l'API PHP

## Vérification

Pour vérifier que tout fonctionne :

1. Testez l'API PHP :
```bash
curl "https://admin.ynukalabs.com/api.php?action=ping"
```

2. Testez le login :
```bash
curl -X POST "https://admin.ynukalabs.com/api.php?action=login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

3. Si vous voyez `{"token":"eyJ...","user":{...}}` → ✅ Ça marche!

## Troubleshooting

### "API URL not configured"
- Vérifiez que `VITE_API_URL` est défini dans votre `.env`
- Assurez-vous que l'URL est correcte (sans /index.php ou trailing slash)

### "Invalid credentials"
- Vérifiez que l'utilisateur existe dans `admin_users`
- Vérifiez le mot de passe (utilisez `password_verify()`)

### "Database connection failed"
- Vérifiez les identifiants MySQL dans `api.php`
- Vérifiez que vous pouvez vous connecter avec phpMyAdmin

### "Unauthorized (401)"
- Le token est peut-être expiré (7 jours)
- Supprimez `php_auth_token` du localStorage et reconnectez-vous

## Support

Pour toute question, consultez :
1. `Panel Adm/php-api/api.php` - Code source complet de l'API
2. Les fichiers `php-auth.ts` et `php-api.ts` - Clients JavaScript
3. La documentation de l'API dans le commentaire en haut de `api.php`

