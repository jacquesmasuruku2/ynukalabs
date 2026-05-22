# Script PHP MySQL - Ynuka Labs

Ce dossier contient un système complet PHP pour gérer les données entre votre site et la base de données MySQL existante.

## 📁 Fichiers créés

- **config.php** - Configuration de la connexion à la base de données MySQL (ynukalab_database_website)
- **database.php** - Classe Database avec les méthodes CRUD (Create, Read, Update, Delete)
- **api.php** - API REST pour communiquer avec le frontend
- **example.html** - Exemple d'utilisation de l'API avec vos tables existantes
- **setup.sql** - Documentation de la structure de votre base de données
## 🔧 Configuration

### 1. Modifier config.php si nécessaire

Les informations de connexion sont déjà configurées avec vos données :
- **Hôte** : localhost
- **Base de données** : ynukalab_database_website
- **Utilisateur** : ynukalab
- **Mot de passe** : ZA5!s7Qf

### 2. Vérifier la base de données

Votre base de données `ynukalab_database_website` existe déjà avec les tables suivantes :
- users, user_roles
- blog_posts, blog_comments
- contact_messages
- donations
- events, event_registrations
- gallery_images
- newsletter_subscribers
- projects
- resource_items
- team_members

## 🚀 Utilisation

### Via l'API REST

L'API est accessible via `api.php` avec les actions suivantes :

#### 1. Insérer un message de contact
```javascript
fetch('api.php?action=insert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        table: 'contact_messages',
        data: {
            id: 'uuid-généré',
            name: 'Jacques Masuruku',
            email: 'jacquesmasuruku@gmail.com',
            subject: 'Test',
            message: 'Message de test',
            status: 'new'
        }
    })
})
```

#### 2. Lire les messages de contact
```javascript
fetch('api.php?action=select&table=contact_messages&orderBy=created_at DESC&limit=10')
    .then(res => res.json())
    .then(data => console.log(data))
```

#### 3. Lire les projets
```javascript
fetch('api.php?action=select&table=projects&orderBy=created_at DESC')
    .then(res => res.json())
    .then(data => console.log(data))
```

#### 4. Inscrire à la newsletter
```javascript
fetch('api.php?action=insert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        table: 'newsletter_subscribers',
        data: {
            id: 'uuid-généré',
            email: 'newsletter@gmail.com',
            active: 1
        }
    })
})
```

#### 5. Requête personnalisée
```javascript
fetch('api.php?action=custom', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        sql: 'SELECT * FROM events WHERE upcoming = 1 ORDER BY date DESC',
        params: []
    })
})
```

### Via la classe Database directement

```php
<?php
require_once 'config.php';
require_once 'database.php';

$db = new Database();

// Insérer un message de contact
$db->insert('contact_messages', [
    'id' => generateUUID(),
    'name' => 'Marie',
    'email' => 'marie@example.com',
    'subject' => 'Question',
    'message' => 'Message de test',
    'status' => 'new'
]);

// Lire les projets
$resultats = $db->select('projects', [], 'created_at DESC');

// Mettre à jour un projet
$db->update('projects',
    ['status' => 'idea'],
    ['id' => 'uuid-du-projet']
);

// Supprimer un message
$db->delete('contact_messages', ['id' => 'uuid-du-message']);
```

## 📊 Structure des tables existantes

### contact_messages
- id (CHAR 36, PRIMARY KEY)
- name (VARCHAR 255)
- email (VARCHAR 255)
- subject (VARCHAR 500)
- message (TEXT)
- status (ENUM: new, read)
- created_at (TIMESTAMP)

### projects
- id (CHAR 36, PRIMARY KEY)
- name (VARCHAR 255)
- category (VARCHAR 255)
- description (TEXT)
- status (ENUM: idea, in_progress)
- website_url (VARCHAR 500)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### events
- id (CHAR 36, PRIMARY KEY)
- title (TEXT)
- title_fr (TEXT)
- description (TEXT)
- description_fr (TEXT)
- date (DATETIME)
- location (TEXT)
- type (ENUM: Workshop, Seminar, Conference)
- image_url (TEXT)
- upcoming (TINYINT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### newsletter_subscribers
- id (CHAR 36, PRIMARY KEY)
- email (VARCHAR 255, UNIQUE)
- subscribed_at (TIMESTAMP)
- active (TINYINT)

### blog_posts
- id (CHAR 36, PRIMARY KEY)
- title (TEXT)
- title_fr (TEXT)
- content (TEXT)
- content_fr (TEXT)
- excerpt (TEXT)
- excerpt_fr (TEXT)
- category (VARCHAR 255)
- image_url (TEXT)
- published (TINYINT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### donations
- id (CHAR 36, PRIMARY KEY)
- method (ENUM: mobile_money, card, bank_transfer)
- provider (VARCHAR 255)
- network (VARCHAR 255)
- status (ENUM: pending, completed, failed)
- amount (DECIMAL 18,2)
- currency (VARCHAR 16)
- tx_ref (VARCHAR 255)
- transaction_id (VARCHAR 255)
- tx_hash (VARCHAR 255)
- wallet_address (TEXT)
- donor_name (VARCHAR 255)
- donor_email (VARCHAR 255)
- donor_phone (VARCHAR 255)
- note (TEXT)
- donation_context (VARCHAR 255)
- raw_payload (JSON)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## 🔒 Sécurité

- Les requêtes utilisent des statements préparés pour prévenir les injections SQL
- Le mot de passe est stocké dans config.php (à déplacer en variables d'environnement en production)
- CORS est configuré pour autoriser les requêtes depuis votre frontend

## 🌐 Déploiement

1. Uploadez le dossier `php` sur votre serveur via FTP (205.209.109.3)
2. Assurez-vous que PHP est activé sur votre hébergement DirectAdmin
3. Configurez les permissions des fichiers (644) et dossiers (755)
4. Testez l'accès à `example.html` pour vérifier le fonctionnement

## 📋 Prochaines étapes

1. **Tester localement** : Ouvrez `php/example.html` dans votre navigateur pour tester l'API
2. **Uploader sur le serveur** : Transférez le dossier `php` via FTP vers votre hébergement
3. **Intégrer avec React** : Utilisation des exemples d'appels fetch dans mon frontend React
4. **Sécuriser** : En production, déplacez les identifiants dans des variables d'environnement

## 🔗 Intégration avec votre projet React

Depuis votre application React, vous pouvez appeler l'API PHP :

```typescript
// Exemple dans un composant React
const submitContactForm = async (formData: any) => {
  const response = await fetch('/php/api.php?action=insert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      table: 'contact_messages',
      data: {
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: 'new'
      }
    })
  });
  const result = await response.json();
  return result;
};
```

## 📞 Support

Pour toute question, contactez l'administrateur du système.
