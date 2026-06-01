# Système de Notifications - Panel Admin Ynuka Labs

## Vue d'ensemble

Le système de notifications fournit un panel de notifications élégant et premium accessible depuis la sidebar, affichant les activités du panel admin en temps réel. Les notifications sont stockées dans une base de données MySQL et récupérées via une API PHP, garantissant la persistance et la synchronisation entre les sessions.

## Architecture

- **Base de données**: Table `admin_activities` dans MySQL
- **API PHP**: `api/activities.php` pour la gestion des activités
- **Client TypeScript**: `src/lib/activities.ts` pour les appels API
- **Interface utilisateur**: `NotificationPanel.tsx` et `NotificationBell.tsx`
- **Utilitaires**: `src/lib/notifications.ts` pour l'envoi simplifié de notifications

## Configuration de la base de données

### 1. Créer la table

Exécutez le fichier SQL fourni:

```bash
mysql -u votre_utilisateur -p votre_base_de_donnees < api/create_activities_table.sql
```

Ou importez `api/create_activities_table.sql` via phpMyAdmin.

### 2. Vérifier la configuration

Assurez-vous que `api/config.php` contient les bonnes informations de connexion:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'votre_base_de_donnees');
define('DB_USER', 'votre_utilisateur');
define('DB_PASS', 'votre_mot_de_passe');
```

Pour plus de détails, voir `api/README_ACTIVITIES.md`.

## Composants

### 1. NotificationPanel (`src/components/NotificationPanel.tsx`)

Composant principal qui affiche un panel latéral premium avec:
- Design élégant avec dégradés et effets de flou
- Header avec compteur de notifications non lues
- Filtres (Toutes / Non lues)
- Actions groupées (Tout lire, Tout effacer)
- Cartes de notifications avec icônes colorées
- Actions au survol (marquer comme lu, supprimer)
- Footer avec lien vers les activités complètes
- Animation et transitions fluides
- Backdrop avec effet de flou

### 2. NotificationBell (`src/components/NotificationBell.tsx`)

Composant alternatif de cloche de notification avec dropdown compact:
- Badge de compteur pour les notifications non lues
- Dropdown avec la liste des notifications
- Actions pour marquer comme lu et supprimer
- Icônes colorées selon le type de notification
- Timestamps relatifs (ex: "Il y a 5 min")

### 3. Utilitaires de notifications (`src/lib/notifications.ts`)

Fichier utilitaire qui fournit des fonctions prédéfinies pour envoyer des notifications:
- `notifications.login(user)` - Notification de connexion
- `notifications.register(user)` - Notification d'inscription
- `notifications.message(user, message)` - Notification de message
- `notifications.alert(message)` - Notification d'alerte système
- `notifications.notification(message)` - Notification générale
- `notifications.newsletter(email)` - Notification d'abonnement newsletter
- `notifications.contactMessage(name, subject)` - Notification de message de contact
- `notifications.blogComment(author)` - Notification de commentaire de blog
- `notifications.donation(donor, amount)` - Notification de don
- `notifications.eventRegistration(name)` - Notification d'inscription événement

## Intégration

### Dans la Sidebar

Le bouton Notifications est intégré dans le `AppSidebar.tsx` dans le footer, avant les autres liens. Cliquez sur "Notifications" pour ouvrir le panel premium.

### Dans le PageHeader

Le composant `PageHeader` inclut une option `showNotification` (activée par défaut) pour afficher la cloche de notification compacte.

Pour désactiver la notification dans un PageHeader spécifique:

```tsx
<PageHeader
  title="Ma Page"
  description="Description"
  showNotification={false}  // Désactive la cloche
  actions={...}
/>
```

## Utilisation

### Envoyer une notification depuis n'importe quel composant

```tsx
import { notifications } from "@/lib/notifications";

// Notification de connexion
notifications.login("user@example.com");

// Notification d'inscription
notifications.register("newuser@example.com");

// Notification de message
notifications.message("user@example.com", "Nouveau message reçu");

// Notification d'alerte
notifications.alert("Mise à jour du système disponible");

// Notification générale
notifications.notification("Rapport quotidien généré");

// Notification newsletter
notifications.newsletter("email@example.com");

// Notification message de contact
notifications.contactMessage("Jean Kiyana", "Demande d'information");

// Notification commentaire de blog
notifications.blogComment("Auteur");

// Notification don
notifications.donation("Donateur", "25$");

// Notification inscription événement
notifications.eventRegistration("Participant");
```

### Envoyer une notification personnalisée

```tsx
import { sendNotification } from "@/lib/notifications";

sendNotification({
  type: "login",
  user: "user@example.com",
  message: "Message personnalisé",
  timestamp: new Date(),
  details: "Description détaillée de la notification",
  metadata: {
    ip: "192.168.1.100",
    location: "Goma, RDC",
    browser: "Chrome 120.0",
  },
});
```

## Types de notifications

- `login` - Connexion d'utilisateur (icône bleue, fond bleu clair)
- `register` - Nouvel utilisateur (icône verte, fond vert clair)
- `message` - Message reçu (icône violette, fond violet clair)
- `notification` - Notification système (icône ambre, fond ambre clair)
- `alert` - Alerte importante (icône rouge, fond rouge clair)

## Fonctionnalités du Panel Premium

- **Design élégant**: Dégradés subtils, ombres, effets de flou backdrop
- **Header sticky**: Reste visible lors du scroll
- **Filtres intelligents**: Voir toutes les notifications ou seulement les non lues
- **Actions groupées**: Tout marquer comme lu, tout effacer
- **Cartes interactives**: Survol pour révéler les actions
- **Badges visuels**: Badge "Nouveau" pour les notifications non lues
- **Vue détaillée**: Cliquez sur une notification pour voir les détails complets
- **Informations étendues**: Description détaillée et métadonnées pour chaque notification
- **Responsive**: S'adapte parfaitement aux différentes tailles d'écran
- **État vide**: Design élégant quand aucune notification
- **Navigation**: Lien vers la page des activités complètes

## Vue détaillée des notifications

En cliquant sur une notification, un panneau latéral s'ouvre affichant:

- **Type de notification** avec badge coloré
- **Utilisateur** à l'origine de la notification
- **Message principal** mis en évidence
- **Description détaillée** avec informations complètes
- **Métadonnées** organisées en grille (IP, localisation, navigateur, etc.)
- **Timestamp complet** avec date et heure formatées
- **Actions** pour supprimer ou fermer la vue

Les notifications sont automatiquement marquées comme lues lors de l'ouverture de la vue détaillée.

## Exemples d'intégration

### Page de login

Les notifications sont déjà intégrées dans `login.tsx`:
- Envoie une notification de connexion quand un utilisateur se connecte
- Envoie une notification d'inscription quand un nouveau compte est créé

### Page de diagnostic

La page `admin.diagnostic.tsx` utilise le système de notifications pour afficher les activités du panel.

### Notifications automatiques pour les ressources

Le système envoie automatiquement des notifications lors de la création d'enregistrements dans les tables suivantes via le Panel Admin:

#### Newsletter Subscribers
- Déclenché lors de la création d'un nouvel abonné
- Type: `notification`
- Message: "Nouvel abonné à la newsletter"
- Métadonnées: email, type

#### Contact Messages
- Déclenché lors de la création d'un nouveau message de contact
- Type: `message`
- Message: "Nouveau message de contact: {sujet}"
- Métadonnées: name, subject, type

#### Blog Comments
- Déclenché lors de la création d'un nouveau commentaire
- Type: `message`
- Message: "Nouveau commentaire sur le blog"
- Métadonnées: author, type

#### Donations
- Déclenché lors de la création d'un nouveau don
- Type: `notification`
- Message: "Nouveau don de {montant}"
- Métadonnées: donor, amount, type

#### Event Registrations
- Déclenché lors de la création d'une nouvelle inscription
- Type: `notification`
- Message: "Nouvelle inscription à un événement"
- Métadonnées: name, type

Ces notifications sont automatiquement envoyées par le composant `ResourceTable` lors de la création d'enregistrements pour ces ressources spécifiques.

## Personnalisation

Pour modifier le comportement ou le style des notifications, éditez:
- `src/components/NotificationPanel.tsx` - Panel premium principal
- `src/components/NotificationBell.tsx` - Cloche compacte alternative
- `src/lib/notifications.ts` - Utilitaires de notification

## Notes

- Les notifications sont maintenant stockées dans une base de données MySQL pour la persistance
- L'API PHP (`api/activities.php`) gère toutes les opérations CRUD
- Le système est entièrement fonctionnel et intégré aux flux existants (login, register)
- Les notifications sont synchronisées entre les différentes sessions utilisateur
- Le panel est accessible depuis le bouton "Notifications" dans la sidebar
- Pour la maintenance, voir `api/README_ACTIVITIES.md`
