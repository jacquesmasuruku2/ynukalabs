# ✅ CONFIGURATION COMPLÈTE DE L'API YNUKA LABS

## 📋 Résumé des changements apportés

J'ai corrigé et amélioré votre `api.php` pour résoudre les problèmes d'envoi de données. Voici ce qui a été fait:

### 🔧 Améliorations du fichier api.php

1. **Vérification de connexion DB**
   - L'API vérifie maintenant si la connexion MySQL est établie au démarrage
   - Retourne une erreur JSON appropriée en cas d'échec
   - Empêche les erreurs de requête NULL

2. **Améliorations CREATE (POST)**
   - Meilleure gestion des erreurs avec messages détaillés
   - Timestamps automatiques (created_at, updated_at)
   - Support des tables publiques sans authentification:
     - `newsletter_subscribers` ✅
     - `contact_messages` ✅
     - `event_registrations` ✅
     - `donations` ✅
   - Réponses JSON cohérentes (compatible Strapi)

3. **Gestion d'erreurs robuste**
   - Try/catch pour toutes les opérations
   - Messages d'erreur détaillés sans exposer les secrets
   - Logging proper des erreurs

4. **Support des tables manquantes**
   - Vous pouvez maintenant envoyer des données pour TOUTES les tables listées dans api.php

---

## 🚀 ÉTAPES D'INSTALLATION

### Étape 1: Créer les tables de base de données

⚠️ **IMPORTANT**: Exécutez ce script SQL pour créer TOUTES les tables requises:

**Sur votre serveur (SSH):**
```bash
mysql -u ynukalab_admin-jacques -p ynukalab_database_website < /chemin/vers/php/tables-complete.sql
```

**Ou via phpMyAdmin:**
1. Allez sur phpMyAdmin
2. Sélectionnez la base `ynukalab_database_website`
3. Allez sur l'onglet "SQL"
4. Copiez le contenu de `php/tables-complete.sql`
5. Exécutez

### Étape 2: Vérifier la configuration

Vérifiez que `php/config.php` contient:
```php
define('DB_HOST', 'localhost');  // ou votre IP serveur
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');
```

### Étape 3: Tester la connexion

**Ouvrez dans votre navigateur:**
```
http://votresite.com/php/diagnostic.php
```

Vous devriez voir:
- ✅ Database connection successful
- ✅ All required tables exist
- ✅ PING endpoint works

### Étape 4: Créer un administrateur (optionnel)

Si vous voulez un compte admin pour le panel:

**Générez un mot de passe hashé:**
```bash
php php/generate-admin.php "VotreMotDePasseSécurisé"
```

**Puis exécutez en SQL:**
```sql
INSERT INTO admin_users (email, password_hash, name) 
VALUES ('admin@ynukalabs.com', 'HASH_RETOURNÉ_CI_DESSUS', 'Admin');
```

### Étape 5: Tester l'API

#### Option A: Interface Web (recommandé)
```
http://votresite.com/php/test-api.html
```
Utilisez cette page pour tester tous les endpoints.

#### Option B: Ligne de commande
```bash
curl "http://votresite.com/php/api.php?action=ping"
```

#### Option C: Script Bash
```bash
bash php/test-api.sh
```

---

## 📊 VÉRIFICATION: Les données arrivent-elles bien?

### Test 1: Vérifiez la newsletter
```bash
curl "http://votresite.com/php/api.php?action=list&resource=newsletter_subscribers"
```

### Test 2: Vérifiez les messages de contact
```bash
curl "http://votresite.com/php/api.php?action=list&resource=contact_messages"
```

### Test 3: Vérifiez les inscriptions aux événements
```bash
curl "http://votresite.com/php/api.php?action=list&resource=event_registrations"
```

---

## 📁 Fichiers créés/modifiés

### ✅ Fichiers créés:
- `php/tables-complete.sql` - Schéma complet de BD (IMPORTANT!)
- `php/diagnostic.php` - Outil de diagnostic
- `php/test-api.html` - Interface de test web
- `php/test-api.sh` - Tests en ligne de commande
- `php/API_DOCUMENTATION.md` - Documentation complète

### ✅ Fichiers modifiés:
- `php/api.php` - Corrections et améliorations

---

## 🔐 Points de sécurité importants

⚠️ **À faire en PRODUCTION:**

1. **Changez le secret JWT** dans `api.php`:
```php
function jwt_secret() {
    return 'CHANGE_THIS_TO_A_VERY_LONG_RANDOM_STRING_AT_LEAST_32_CHARS';
}
```

2. **Limitez CORS** si nécessaire (actuellement `*`):
```php
header('Access-Control-Allow-Origin: https://votresite.com');
```

3. **Désactivez les erreurs** dans `config.php`:
```php
ini_set('display_errors', 0);  // Mettre à 0 en production
```

4. **Changez les credentials** par défaut

---

## 🐛 Dépannage

### "Database connection failed"
```bash
php php/diagnostic.php
```
Vérifiez les credentials dans `config.php`

### "Table 'xxx' doesn't exist"
```bash
mysql -u ynukalab_admin-jacques -p ynukalab_database_website < php/tables-complete.sql
```

### "Unauthorized (401)"
Vous tentez une opération protégée. Authentifiez-vous ou utilisez une table publique.

### CORS errors dans navigateur
1. Vérifiez le header Content-Type
2. Vérifiez que l'URL de l'API est correcte
3. Utilisez test-api.html pour vérifier

### Les données ne s'enregistrent pas
1. Ouvrez `php/diagnostic.php`
2. Vérifiez que les tables existent (✅ symboles)
3. Vérifiez les logs MySQL: `tail -f /var/log/mysql/error.log`
4. Testez avec test-api.html

---

## 🧪 Exemples de requêtes (cURL)

### Newsletter
```bash
curl -X POST "http://localhost/php/api.php?action=create&resource=newsletter_subscribers" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "active": 1,
    "subscribed_at": "2024-01-15T10:30:00Z"
  }'
```

### Contact
```bash
curl -X POST "http://localhost/php/api.php?action=create&resource=contact_messages" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello!"
  }'
```

### Event Registration
```bash
curl -X POST "http://localhost/php/api.php?action=create&resource=event_registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "full_name": "John Doe",
    "email": "john@example.com"
  }'
```

---

## 📞 Support

1. **Diagnostic automatique**: `http://votresite.com/php/diagnostic.php`
2. **Test interactif**: `http://votresite.com/php/test-api.html`
3. **Documentation**: Lire `php/API_DOCUMENTATION.md`

---

## ✅ Checklist finale

- [ ] `tables-complete.sql` exécuté
- [ ] `diagnostic.php` retourne tous les ✅
- [ ] `test-api.html` montre les réponses
- [ ] Les formulaires du site envoient les données
- [ ] Le panel admin peut lire les données
- [ ] JWT secret changé (si production)
- [ ] CORS configuré (si production)

---

**Configuration complétée!** 🎉

Vos visiteurs peuvent maintenant envoyer des données et votre panel admin peut les lire.

**Date**: 30-05-2026
