# Guide de test du système de notifications

## Problème identifié
Les notifications ne s'affichent pas lors de la connexion. Cela peut être dû à:
1. L'URL de l'API incorrecte (corrigé)
2. La table `admin_activities` n'existe pas dans la base de données
3. L'API PHP a une erreur
4. Le fichier `activities.php` n'est pas déployé sur le serveur

## Étapes de diagnostic

### 1. Vérifier si le fichier activities.php est déployé

Accédez à cette URL dans votre navigateur:
```
https://admin.ynukalabs.com/api/test_activities.php
```

Ce script de test vérifiera:
- Si le fichier `activities.php` existe
- Si l'endpoint ping fonctionne
- Si la connexion à la base de données fonctionne
- Si la table `admin_activities` existe
- Le nombre d'enregistrements dans la table

### 2. Tester l'API directement

Testez l'endpoint ping:
```
https://admin.ynukalabs.com/api/activities.php?action=ping
```

Vous devriez recevoir une réponse JSON comme:
```json
{
  "ok": true,
  "php_version": "8.x.x",
  "time": "2024-06-01T...",
  "config": {
    "db_host": "localhost",
    "db_name": "ynukalab_database_website",
    "db_user_set": true
  },
  "db": "ok",
  "activities_table": true,
  "activities_count": 0
}
```

### 3. Créer la table si elle n'existe pas

Si le test indique que la table n'existe pas, exécutez le script SQL:
```bash
mysql -u ynukalab_admin-jacques -p ynukalab_database_website < api/create_activities_table.sql
```

Ou via phpMyAdmin:
1. Connectez-vous à phpMyAdmin
2. Sélectionnez la base `ynukalab_database_website`
3. Cliquez sur "SQL"
4. Copiez le contenu de `api/create_activities_table.sql`
5. Cliquez sur "Exécuter"

### 4. Insérer une notification de test

Pour vérifier que l'insertion fonctionne, exécutez:
```bash
mysql -u ynukalab_admin-jacques -p ynukalab_database_website < api/insert_test_activity.sql
```

Ou via phpMyAdmin:
1. Cliquez sur "SQL"
2. Copiez le contenu de `api/insert_test_activity.sql`
3. Cliquez sur "Exécuter"

### 5. Vérifier les logs du navigateur

1. Ouvrez le Panel Admin
2. Appuyez sur F12 pour ouvrir la console
3. Connectez-vous avec votre compte
4. Regardez les logs console:
   - "Envoi de notification:" avec les données
   - "Notification envoyée avec succès:" si ça fonctionne
   - "Erreur lors de l'envoi de la notification:" si ça échoue

### 6. Tester le panel de notifications

1. Connectez-vous au Panel Admin
2. Cliquez sur le bouton "Notifications" dans la sidebar
3. Regardez les logs console:
   - "Chargement des notifications avec filtre: all"
   - "Notifications reçues:" avec les données
   - "Erreur lors du chargement des notifications:" si ça échoue

## Correction de l'URL de l'API

Le problème principal était que l'URL de l'API était incorrecte:
- **Avant**: `https://admin.ynukalabs.com/api/api.php/activities.php` (incorrect)
- **Après**: `https://admin.ynukalabs.com/api/activities.php` (correct)

Cela a été corrigé dans `src/lib/activities.ts` avec la fonction `getActivitiesUrl()`.

## Rebuild et déploiement

Après les corrections, rebuild le Panel Admin:
```bash
cd "Panel Admin"
npm run build
```

Puis uploadez le dossier `dist/` sur le serveur.

## Vérification finale

1. Testez l'API: `https://admin.ynukalabs.com/api/activities.php?action=ping`
2. Connectez-vous au Panel Admin
3. Vérifiez les logs console
4. Ouvrez le panel de notifications
5. Si vous avez inséré une notification de test, elle devrait apparaître

## Si ça ne fonctionne toujours pas

Vérifiez:
1. Le fichier `api/activities.php` est bien uploadé sur le serveur
2. La table `admin_activities` existe dans la base de données
3. Les identifiants de base de données dans `api/activities.php` sont corrects
4. CORS est configuré correctement (ALLOWED_ORIGIN)
5. Il n'y a pas d'erreur dans les logs du serveur PHP
