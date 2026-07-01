# Guide d'installation du système de Newsletter

## 📋 Vue d'ensemble

Ce système complet de gestion de newsletter permet de :
- Créer et éditer des newsletters avec un éditeur WYSIWYG
- Envoyer des newsletters aux abonnés via l'API Brevo v3
- Gérer l'historique des envois
- Permettre le désabonnement automatique

## 🗄️ Étape 1 : Base de données

### Exécuter le script SQL

Ouvrez phpMyAdmin ou votre outil de gestion MySQL et exécutez le fichier :

```sql
-- Fichier : create_newsletters_table.sql
CREATE TABLE IF NOT EXISTS `newsletters` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `subject` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `status` ENUM('draft', 'sending', 'sent') NOT NULL DEFAULT 'draft',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `sent_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Vérifier la table existante

La table `newsletter_subscribers` devrait déjà exister avec cette structure :
- `id` (INT, AUTO_INCREMENT)
- `email` (VARCHAR)
- `name` (VARCHAR)
- `active` (INT: 1=actif, 0=désabonné)
- `subscribed_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔧 Étape 2 : Configuration

### Modifier config.php

Ouvrez le fichier `Panel Admin/php/config.php` et modifiez les constantes :

```php
// Configuration de la base de données (déjà configurée)
define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');

// Configuration Brevo - IMPORTANT : Remplacez par votre clé API
define('BREVO_API_KEY', 'YOUR_BREVO_API_KEY');
```

### Obtenir votre clé API Brevo

1. Connectez-vous à votre compte Brevo (anciennement Sendinblue)
2. Allez dans : Account > SMTP & API
3. Cliquez sur "API Keys"
4. Créez une nouvelle clé API avec les droits "Transactional emails"
5. Copiez la clé et collez-la dans `config.php`

## 📧 Étape 3 : Intégration Brevo v3

### Option A : Utiliser l'API directe (déjà implémentée)

Le système utilise déjà l'API REST Brevo v3 directement via cURL. Aucune installation supplémentaire n'est requise.

### Option B : Utiliser la librairie PHP officielle

Si vous préférez utiliser la librairie officielle Brevo :

1. Téléchargez la librairie : https://github.com/sendinblue/APIv3-php-library
2. Placez-la dans `Panel Admin/php/APIv3-php-library/`
3. Modifiez `save_and_send.php` pour utiliser la librairie :

```php
require_once(__DIR__ . "/APIv3-php-library/autoload.php");

use Brevo\Client\Api\TransactionalEmailsApi;
use Brevo\Client\Configuration;

$config = Configuration::getDefaultConfiguration()
    ->setApiKey('api-key', BREVO_API_KEY);

$apiInstance = new TransactionalEmailsApi(null, $config);
```

## 🎨 Étape 4 : Intégration dans le Panel Admin

### Modifier le lien dans le sidebar

Dans votre application React Panel Admin, localisez le composant Sidebar et modifiez le lien "Newsletter" :

```tsx
// Avant
<a href="/newsletter">Newsletter</a>

// Après
<a href="/php/admin_newsletter.php">Newsletter</a>
```

Ou créez une route qui redirige vers le fichier PHP.

### Alternative : Intégration React complète

Si vous préférez une intégration 100% React, vous pouvez :

1. Créer des composants React pour chaque page PHP
2. Utiliser votre API existante (`api.php`) pour les opérations CRUD
3. Conserver la logique d'envoi Brevo dans le backend PHP

## 🚀 Étape 5 : Test du système

### 1. Tester la connexion DB

Accédez à : `https://admin.ynukalabs.com/php/admin_newsletter.php`

Vous devriez voir la page de gestion des newsletters.

### 2. Créer un brouillon

1. Cliquez sur "Rédiger une newsletter"
2. Remplissez le sujet et le contenu
3. Cliquez sur "Enregistrer le brouillon"
4. Vérifiez que le brouillon apparaît dans la liste

### 3. Tester l'envoi (avec un seul abonné)

1. Ajoutez votre email personnel dans `newsletter_subscribers` avec `active = 1`
2. Créez une newsletter de test
3. Cliquez sur "Enregistrer et Diffuser"
4. Vérifiez que vous recevez l'email

### 4. Tester le désabonnement

1. Dans l'email reçu, cliquez sur le lien "Se désabonner"
2. Vérifiez que la page de désabonnement s'affiche
3. Confirmez le désabonnement
4. Vérifiez dans la base de données que `active = 0`

## 📁 Structure des fichiers créés

```
Panel Admin/php/
├── config.php                      # Configuration DB et Brevo
├── header.php                      # Header commun avec design
├── footer.php                      # Footer commun avec scripts
├── create_newsletters_table.sql    # Script SQL pour la table
├── admin_newsletter.php            # Page principale (liste)
├── newsletter_form.php             # Formulaire avec TinyMCE
├── save_and_send.php               # Backend d'envoi Brevo
├── newsletter_view.php             # Visualisation
├── newsletter_delete.php           # Suppression
└── unsubscribe.php                 # Page publique désabonnement
```

## 🔐 Sécurité

### Protection des pages admin

Les pages PHP actuelles utilisent une vérification de session basique. Pour renforcer la sécurité :

1. Intégrez votre système d'authentification JWT existant
2. Ajoutez une vérification du token dans chaque page PHP
3. Utilisez HTTPS obligatoirement

### Protection contre les abus

1. Limitez le nombre d'envois par jour
2. Ajoutez une confirmation supplémentaire avant l'envoi massif
3. Implémentez un système de queue pour les gros envois

## 🎯 Personnalisation

### Modifier le design

Les fichiers `header.php` et `footer.php` utilisent Tailwind CSS avec un thème sombre/clair. Vous pouvez modifier :

- Les couleurs dans les variables CSS (`--primary`, `--dark-bg`, etc.)
- La structure du sidebar
- Les classes Tailwind pour adapter le design

### Personnaliser l'email

Le contenu de l'email envoyé est personnalisé dans `save_and_send.php`. Vous pouvez modifier :

- Le footer avec le lien de désabonnement
- Le nom de l'expéditeur
- Le style HTML par défaut

## 🐛 Dépannage

### Erreur de connexion DB

Vérifiez les identifiants dans `config.php` et que la base de données est accessible.

### Erreur API Brevo

1. Vérifiez que votre clé API est correcte
2. Vérifiez que vous avez les droits "Transactional emails"
3. Consultez les logs d'erreur du serveur

### TinyMCE ne s'affiche pas

1. Vérifiez que vous avez une connexion internet (CDN)
2. Vérifiez qu'il n'y a pas de conflit JavaScript
3. Essayez d'utiliser une version locale de TinyMCE

## 📞 Support

Pour toute question ou problème, consultez la documentation Brevo :
https://developers.brevo.com/docs/how-to-use-your-api-keys

---

**Note importante** : Ce système est conçu pour fonctionner avec votre infrastructure existante. Assurez-vous de tester complètement avant de l'utiliser en production.
