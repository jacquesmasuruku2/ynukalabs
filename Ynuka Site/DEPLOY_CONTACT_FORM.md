# Guide de Déploiement - Formulaire de Contact

## ✅ Correction effectuée

Le fichier `.env` a été corrigé pour pointer vers la bonne API:
- **Avant**: `VITE_API_URL=https://admin.ynukalabs.com/api/api.php`
- **Après**: `VITE_API_URL=https://ynukalabs.com/php/api.php`

## 📋 Étapes pour rendre le formulaire de contact fonctionnel

### 1. Déployer les fichiers PHP sur le serveur

Via FTP (FileZilla) ou DirectAdmin, uploadez les fichiers suivants vers `public_html/php/`:

- `config.php`
- `api.php`
- `database.php` (optionnel)
- `google-oauth.php` (optionnel)
- `test-contact.php` (pour tester)

### 2. Créer les tables de la base de données

Via phpMyAdmin dans DirectAdmin:

1. Connectez-vous à phpMyAdmin
2. Sélectionnez la base `ynukalab_database_website`
3. Cliquez sur l'onglet **SQL**
4. Exécutez le contenu de `php/tables-complete.sql`
5. Vérifiez que la table `contact_messages` existe

### 3. Tester l'API

Depuis votre navigateur ou avec cURL:

```bash
# Test de connexion à la base de données
curl "https://ynukalabs.com/php/api.php?action=ping"

# Test du formulaire de contact
php php/test-contact.php
```

Réponse attendue pour le ping:
```json
{
  "status": "ok",
  "database": "ynukalab_database_website",
  "tables": [...],
  "timestamp": "..."
}
```

### 4. Tester le formulaire depuis le site

1. Rebuild le frontend avec la nouvelle config:
   ```bash
   cd "Ynuka Site"
   npm run build
   ```

2. Déployez le dossier `dist/` vers `public_html/`

3. Ouvrez `https://ynukalabs.com/contact`

4. Remplissez le formulaire et soumettez

5. Vérifiez dans phpMyAdmin que le message a été inséré dans `contact_messages`

## 🔍 Vérification

Si le formulaire ne fonctionne toujours pas:

1. **Ouvrez la console du navigateur** (F12) et regardez les erreurs réseau
2. **Vérifiez que l'API répond**: `https://ynukalabs.com/php/api.php?action=ping`
3. **Vérifiez les permissions**: Les fichiers PHP doivent avoir les permissions 644
4. **Vérifiez CORS**: L'API doit accepter les requêtes depuis `ynukalabs.com`

## 📊 Structure de la table contact_messages

```sql
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `subject` VARCHAR(255),
  `message` LONGTEXT NOT NULL,
  `status` VARCHAR(50) DEFAULT 'new',
  `read_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Le formulaire envoie: `name`, `email`, `subject`, `message`
