# Configuration du Panel Admin - Subdomain admin.ynukalabs.com

## 📋 Prérequis

- DirectAdmin configuré avec au moins un domaine principal (`ynukalabs.com`)
- Accès SSH au serveur
- Base de données MySQL existante: `ynukalab_database_website`

## 🚀 Étapes de Configuration

### 1. Créer le Subdomain dans DirectAdmin

1. Connectez-vous à DirectAdmin (`https://your-server:2222`)
2. Allez dans **Account Manager** → **Manage Domains**
3. Cliquez sur **Add Subdomain**
4. Entrez:
   - **Subdomain name**: `admin`
   - **Domain**: `ynukalabs.com`
   - **Destination folder**: `/public_html/admin/`
5. Cliquez sur **Create**

Attendez quelques minutes pour que le DNS se propage.

### 2. Configuration Post-Déploiement

Une fois le workflow GitHub Actions a déployé le code:

#### A. Mettre à jour l'API Admin

Connectez-vous au serveur via SSH:

```bash
ssh ynukalab@205.209.109.3
```

Éditez le fichier API:

```bash
nano /home/ynukalab/public_html/admin/api.php
```

Remplacez les placeholders:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');
define('JWT_SECRET', 'votre-clé-secrète-longue-aléatoire-au-moins-32-caractères');
define('ALLOWED_ORIGIN', 'https://admin.ynukalabs.com');
```

Sauvegardez avec `Ctrl+O`, `Enter`, `Ctrl+X`.

#### B. Créer les Tables Admin (si première installation)

```bash
mysql -u ynukalab_admin-jacques -p ynukalab_database_website < /home/ynukalab/public_html/admin/setup.sql
```

(Entrez le mot de passe: `Admin-Jacques.ynuka_db`)

#### C. Créer un Administrateur Initial

Créez un script temporaire pour insérer un admin:

```bash
cat > /tmp/create-admin.php << 'EOF'
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');

$pdo = new PDO(
    'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME,
    DB_USER, DB_PASS
);

// Insérer un utilisateur admin
$email = 'admin@ynukalabs.com';
$password = 'changez-moi-asap'; // À CHANGER IMMÉDIATEMENT
$hashed = password_hash($password, PASSWORD_BCRYPT);

$stmt = $pdo->prepare('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)');
$stmt->execute([$email, $hashed]);

echo "Admin créé: $email\n";
?>
EOF

php /tmp/create-admin.php
rm /tmp/create-admin.php
```

### 3. Tester l'Accès

Ouvrez dans votre navigateur:
- `https://admin.ynukalabs.com` → Doit afficher le panel admin
- `https://admin.ynukalabs.com/api.php?action=health` → Doit retourner un JSON

## 🔐 Sécurité

⚠️ **Important**:
- Changez `JWT_SECRET` par une longue chaîne aléatoire (32+ caractères)
- Changez le mot de passe du premier admin immédiatement après la création
- Restreignez `ALLOWED_ORIGIN` à `https://admin.ynukalabs.com`
- Maintenez les credentials de BDD sécurisés

## 📡 Déploiement Automatique

Le workflow GitHub Actions (`.github/workflows/deploy-ssh.yml`) va maintenant:
1. Compiler le frontend principal → `/public_html/`
2. Compiler le panel admin → `/public_html/admin/`
3. Copier les API PHP correspondantes

À chaque push sur `main`, le déploiement se fera automatiquement.

## 🐛 Dépannage

### Le subdomain ne répond pas
- Vérifiez que le DNS a bien propagé (peut prendre 24h)
- Vérifiez dans DirectAdmin que le subdomain est bien créé
- Vérifiez dans `/public_html/admin/` que les fichiers sont présents

### L'API ne répond pas
- Vérifiez `https://admin.ynukalabs.com/api.php` → doit retourner du JSON
- Vérifiez les logs: `tail -f /home/ynukalab/logs/error_log`
- Vérifiez les credentials MySQL dans `api.php`

### Les routes du panel ne fonctionnent pas
- Vérifiez que `.htaccess` est présent dans `/public_html/admin/`
- Vérifiez que `mod_rewrite` est activé sur Apache
- Testez une URL directe: `https://admin.ynukalabs.com/login` doit afficher le panel

## 📚 API Admin Endpoints

L'API admin supporte les opérations CRUD sur les tables blanch-listées:

```bash
# Lister les données
curl -H "Authorization: Bearer $TOKEN" https://admin.ynukalabs.com/api.php?action=select&table=blog_posts

# Insérer
curl -X POST -H "Content-Type: application/json" \
  https://admin.ynukalabs.com/api.php?action=insert \
  -d '{"table":"blog_posts","data":{"title":"Mon Post","content":"..."}}'

# Mettre à jour
curl -X POST -H "Content-Type: application/json" \
  https://admin.ynukalabs.com/api.php?action=update \
  -d '{"table":"blog_posts","id":1,"data":{"title":"Nouveau Titre"}}'

# Supprimer
curl -X POST https://admin.ynukalabs.com/api.php?action=delete&table=blog_posts&id=1
```

Se connecter d'abord pour obtenir le token JWT via `/api.php?action=login`.
