# API REST Ynuka Labs - Documentation Complète

## 📋 Vue d'ensemble

L'API REST `api.php` gère toutes les opérations CRUD (Create, Read, Update, Delete) pour votre site et panel admin.

### Fonctionnalités
- ✅ Authentification par JWT
- ✅ Opérations CRUD complètes
- ✅ Support CORS pour requests cross-origin
- ✅ Gestion des erreurs JSON
- ✅ Timestamps automatiques (created_at, updated_at)
- ✅ Pagination et recherche

---

## 🚀 Installation Initiale

### 1️⃣ Créer la structure de base de données

Exécutez le fichier SQL complet:

```bash
mysql -u ynukalab_admin-jacques -p ynukalab_database_website < php/tables-complete.sql
```

### 2️⃣ Vérifier la configuration

Vérifiez que `php/config.php` contient les bonnes credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');
```

### 3️⃣ Créer un administrateur

Générez un hash de mot de passe:

```bash
php php/generate-admin.php "VotreMotDePasse"
```

Puis insérez dans la base de données:

```sql
INSERT INTO admin_users (email, password_hash, name) 
VALUES ('admin@ynukalabs.com', 'HASH_ICI', 'Admin');
```

### 4️⃣ Tester la connexion

Allez à: `http://votresite.com/php/diagnostic.php`

---

## 🔗 Endpoints Disponibles

### Public (Sans authentification)

#### Newsletter Subscription
```bash
POST /php/api.php?action=create&resource=newsletter_subscribers
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "active": 1,
  "subscribed_at": "2024-01-15T10:30:00Z"
}
```

#### Contact Messages
```bash
POST /php/api.php?action=create&resource=contact_messages
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+33612345678",
  "subject": "Question about services",
  "message": "I would like to know more about..."
}
```

#### Event Registration
```bash
POST /php/api.php?action=create&resource=event_registrations
Content-Type: application/json

{
  "event_id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+33612345678",
  "organization": "My Company",
  "message": "Looking forward to attend"
}
```

#### Donation
```bash
POST /php/api.php?action=create&resource=donations
Content-Type: application/json

{
  "donor_name": "John Doe",
  "donor_email": "john@example.com",
  "amount": 50.00,
  "currency": "EUR",
  "payment_method": "credit_card",
  "message": "Support your great work!"
}
```

### Authentifiées (Avec JWT Token)

#### Se connecter
```bash
POST /php/api.php?action=login
Content-Type: application/json

{
  "email": "admin@ynukalabs.com",
  "password": "VotreMotDePasse"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@ynukalabs.com",
    "name": "Admin"
  }
}
```

#### Obtenir l'utilisateur courant
```bash
GET /php/api.php?action=me
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Lister les enregistrements
```bash
GET /php/api.php?action=list&resource=newsletter_subscribers&page=1&limit=25
```

#### Rechercher
```bash
GET /php/api.php?action=list&resource=newsletter_subscribers&search=active=true
```

#### Obtenir un enregistrement
```bash
GET /php/api.php?action=get&resource=newsletter_subscribers&id=1
```

#### Modifier
```bash
PUT /php/api.php?action=update&resource=newsletter_subscribers&id=1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Jane Doe",
  "active": 0
}
```

#### Supprimer
```bash
DELETE /php/api.php?action=delete&resource=newsletter_subscribers&id=1
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📊 Tables et Schéma

### newsletter_subscribers
```sql
id (PRIMARY KEY)
email (UNIQUE)
name
active
subscribed_at
updated_at
```

### contact_messages
```sql
id (PRIMARY KEY)
name
email
phone
subject
message
status
read_at
created_at
updated_at
```

### event_registrations
```sql
id (PRIMARY KEY)
event_id (FOREIGN KEY → events)
full_name
email
phone
organization
message
status
created_at
updated_at
```

### donations
```sql
id (PRIMARY KEY)
donor_name
donor_email
amount
currency
payment_method
transaction_id
status
message
created_at
updated_at
```

---

## 🔧 Dépannage

### La base de données ne se connecte pas
1. Vérifiez que MySQL est en cours d'exécution
2. Vérifiez les credentials dans `config.php`
3. Exécutez: `php php/diagnostic.php`

### Les tables n'existent pas
```bash
mysql -u ynukalab_admin-jacques -p ynukalab_database_website < php/tables-complete.sql
```

### L'erreur "Table 'xxx' doesn't exist"
Les tables ont été supprimées ou mal créées. Ré-exécutez tables-complete.sql

### Les requêtes POST retournent une erreur 400
1. Vérifiez que les données sont en JSON valide
2. Vérifiez que les colonnes requises sont présentes
3. Vérifiez les logs: `tail -f /var/log/mysql/error.log`

### CORS errors
L'API a `Access-Control-Allow-Origin: *` activé. Si vous avez toujours des erreurs:
1. Vérifiez que le header Content-Type est défini
2. Vérifiez que l'URL de l'API est correcte

---

## 📝 Exemples d'intégration (JavaScript/React)

### Envoyer une soumission de formulaire de contact
```javascript
async function submitContactForm(formData) {
  const response = await fetch('/php/api.php?action=create&resource=contact_messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message
    })
  });
  
  const result = await response.json();
  if (result.success) {
    alert('Message envoyé avec succès!');
  } else {
    alert('Erreur: ' + result.error);
  }
}
```

### S'abonner à la newsletter
```javascript
async function subscribeNewsletter(email, name) {
  const response = await fetch('/php/api.php?action=create&resource=newsletter_subscribers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      name: name || 'Anonymous',
      active: 1,
      subscribed_at: new Date().toISOString()
    })
  });
  
  const result = await response.json();
  return result;
}
```

### Panel Admin: Récupérer les messages de contact
```javascript
async function getContactMessages(token) {
  const response = await fetch('/php/api.php?action=list&resource=contact_messages', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  const result = await response.json();
  return result.data;
}
```

---

## 🔐 Sécurité

### Points importants
- ✅ Les tables publiques n'acceptent pas tout - vérifiez la liste whitelist
- ✅ Les opérations UPDATE/DELETE nécessitent une authentification
- ✅ Le mot de passe JWT secret doit être changé en production
- ✅ Les erreurs de base de données ne révèlent pas les détails sensibles
- ✅ CORS est activé mais limitez selon vos domaines en production

### À faire en production
1. Changez le secret JWT dans `api.php`
2. Limitez CORS à vos domaines spécifiques
3. Activez HTTPS
4. Désactivez display_errors dans config.php
5. Changez les credentials par défaut

---

## 📞 Support

Pour les problèmes:
1. Exécutez `php diagnostic.php`
2. Vérifiez les logs MySQL
3. Vérifiez la console navigateur (DevTools)
4. Testez avec `curl` ou Postman

---

**Dernière mise à jour:** 30-05-2026
