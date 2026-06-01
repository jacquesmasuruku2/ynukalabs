# Système d'Activités et Notifications

## Configuration de la base de données

1. Exécutez le fichier SQL pour créer la table des activités:
```bash
mysql -u votre_utilisateur -p votre_base_de_donnees < api/create_activities_table.sql
```

Ou via phpMyAdmin:
- Importez le fichier `api/create_activities_table.sql`

## Structure de la table `admin_activities`

| Champ | Type | Description |
|-------|------|-------------|
| id | INT | Identifiant unique (auto-increment) |
| type | ENUM | Type d'activité: login, register, message, notification, alert |
| user | VARCHAR(255) | Utilisateur concerné |
| message | TEXT | Message principal de l'activité |
| details | TEXT | Description détaillée (optionnel) |
| metadata | JSON | Métadonnées additionnelles (optionnel) |
| read | BOOLEAN | Statut de lecture (false par défaut) |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Date de dernière mise à jour |

## API PHP

L'API est accessible via `api/activities.php` et utilise le même style que l'API existante `php-api/api.php`.

### Endpoints

#### GET /activities.php?action=ping
Diagnostic de l'API et vérification de la table

#### GET /activities.php?action=list
Récupère toutes les activités
- Query params:
  - `filter`: "all" ou "unread" (défaut: "all")
  - `limit`: nombre maximum de résultats (défaut: 50, max 200)
  - `offset`: décalage pour pagination (défaut: 0)

#### GET /activities.php?action=unread-count
Récupère le nombre de notifications non lues

#### POST /activities.php?action=create
Crée une nouvelle activité
- Body (JSON):
```json
{
  "type": "login",
  "user": "user@example.com",
  "message": "Nouvelle connexion détectée",
  "details": "Description détaillée...",
  "metadata": {
    "ip": "192.168.1.100",
    "location": "Paris, France"
  }
}
```

#### POST /activities.php?action=mark-read&id={id}
Marque une activité comme lue

#### POST /activities.php?action=mark-all-read
Marque toutes les activités comme lues

#### POST /activities.php?action=delete&id={id}
Supprime une activité

#### POST /activities.php?action=delete-all
Supprime toutes les activités

## Intégration dans le Panel Admin

### Envoi de notifications

Utilisez le système de notifications existant dans `src/lib/notifications.ts`:

```typescript
import { notifications } from "@/lib/notifications";

// Notification de connexion
await notifications.login("user@example.com");

// Notification d'inscription
await notifications.register("user@example.com");

// Notification de message
await notifications.message("user@example.com", "Nouveau message reçu");

// Notification d'alerte
await notifications.alert("Mise à jour disponible");

// Notification générale
await notifications.notification("Rapport généré");
```

### Notification personnalisée

```typescript
import { sendNotification } from "@/lib/notifications";

await sendNotification({
  type: "login",
  user: "user@example.com",
  message: "Message personnalisé",
  details: "Description détaillée...",
  metadata: {
    ip: "192.168.1.100",
    location: "Paris, France",
    browser: "Chrome 120.0"
  }
});
```

## Points d'intégration existants

Les notifications sont déjà intégrées dans:
- `src/routes/login.tsx` - Connexion et inscription utilisateur
- `src/components/NotificationPanel.tsx` - Panel de notifications premium
- `src/routes/admin.diagnostic.tsx` - Page des activités

## Configuration requise

L'API utilise la même configuration de base de données que l'API existante:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');
```

## Test de l'API

Vous pouvez tester l'API avec curl:

```bash
# Diagnostic
curl "https://admin.ynukalabs.com/api/activities.php?action=ping"

# Créer une activité
curl -X POST "https://admin.ynukalabs.com/api/activities.php?action=create" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "login",
    "user": "test@example.com",
    "message": "Test notification"
  }'

# Récupérer les activités
curl "https://admin.ynukalabs.com/api/activities.php?action=list&filter=all&limit=50"

# Marquer comme lu
curl -X POST "https://admin.ynukalabs.com/api/activities.php?action=mark-read&id=1"
```

## Sécurité

- L'API utilise PDO avec des requêtes préparées pour éviter les injections SQL
- Les types d'activités sont validés côté serveur
- Les champs requis sont vérifiés avant insertion
- Utilise la même configuration CORS que l'API existante
- Gestion des erreurs avec logging

## Maintenance

Pour nettoyer les anciennes activités, vous pouvez utiliser:

```sql
DELETE FROM admin_activities WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

Ou créer un cron job pour le faire automatiquement.
