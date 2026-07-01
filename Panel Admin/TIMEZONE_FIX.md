# Correction des Problèmes de Fuseau Horaire

## Vue d'ensemble

Ce document décrit les corrections apportées pour résoudre définitivement les problèmes de fuseau horaire dans l'ensemble du projet.

## Contexte

- **Hébergement**: InterServer (mutualisé)
- **Serveur MySQL**: UTC-4 par défaut
- **Localisation**: République Démocratique du Congo (Goma/Lubumbashi, UTC+2)
- **Objectif**: Toutes les dates affichées doivent être en heure locale de Goma/Lubumbashi

## Modifications Effectuées

### 1. Base de Données MySQL

#### Fichiers modifiés:
- `d:\Site-Ynukalabs\Ynuka Site\php\config.php`
- `d:\Site-Ynukalabs\api\activities.php`
- `d:\Site-Ynukalabs\api\test_activities.php`

#### Changement:
Ajout de `SET time_zone = '+02:00'` après chaque connexion MySQL pour garantir que:
- `NOW()` utilise UTC+2
- `CURRENT_TIMESTAMP` utilise UTC+2
- Les colonnes `created_at` et `updated_at` utilisent UTC+2

**Exemple:**
```php
$pdo = new PDO(
    'mysql:host=' . $hostAttempt . ';dbname=' . DB_NAME . ';charset=utf8mb4',
    DB_USER, DB_PASS,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]
);

// Définir le fuseau horaire pour UTC+2 (Afrique/Lubumbashi/Goma)
$pdo->exec("SET time_zone = '+02:00'");
```

### 2. Utilitaire Centralisé de Formatage de Dates

#### Fichier créé:
- `d:\Site-Ynukalabs\Panel Admin\src\lib\dateUtils.ts`

#### Fonctions disponibles:

```typescript
import { 
  formatDate, 
  formatDateTime, 
  formatTime, 
  formatShortDate, 
  formatRelativeTime,
  toISOString,
  createDate,
  now,
  isToday,
  isFuture,
  isPast
} from "@/lib/dateUtils";
```

**Fonctions principales:**

- `formatDate(date, options)` - Formate une date selon le fuseau horaire de Lubumbashi/Goma
- `formatDateTime(date)` - Formate une date et heure complètes
- `formatShortDate(date)` - Formate une date courte (DD/MM/YYYY)
- `formatRelativeTime(date)` - Formate une date relative (ex: "Il y a 5 minutes")
- `formatTime(date)` - Formate uniquement l'heure

**Exemple d'utilisation:**
```typescript
import { formatDateTime, formatShortDate, formatRelativeTime } from "@/lib/dateUtils";

// Date et heure complètes
const fullDate = formatDateTime(new Date());
// Résultat: "vendredi 2 juin 2026, 00:30"

// Date courte
const shortDate = formatShortDate(new Date());
// Résultat: "02/06/2026"

// Temps relatif
const relativeTime = formatRelativeTime(new Date(Date.now() - 300000));
// Résultat: "Il y a 5 minutes"
```

### 3. Mise à jour des Composants React

#### Fichiers modifiés pour utiliser le nouvel utilitaire:

- `src/components/NotificationPanel.tsx`
- `src/components/NotificationBell.tsx`
- `src/routes/admin.blog_posts.tsx`
- `src/routes/admin.diagnostic.tsx`
- `src/components/GalleryImageForm.tsx`
- `src/components/GalleryImageFormRefactored.tsx`
- `src/components/ResourceItemForm.tsx`
- `src/components/ProjectForm.tsx`
- `src/components/EventForm.tsx`

#### Changements:
- Remplacement de `toLocaleDateString("fr-FR")` par `formatShortDate()`
- Remplacement de `toLocaleString("fr-FR", options)` par `formatDateTime()`
- Remplacement des fonctions locales `formatTimestamp` par `formatRelativeTime()`

**Avant:**
```typescript
{new Date(post.created_at).toLocaleDateString("fr-FR")}
```

**Après:**
```typescript
import { formatShortDate } from "@/lib/dateUtils";
{formatShortDate(post.created_at)}
```

## Avantages de cette Solution

1. **Cohérence**: Toutes les dates utilisent le même fuseau horaire (UTC+2)
2. **Centralisation**: Un seul utilitaire pour gérer tous les formatages de dates
3. **Maintenabilité**: Facile à modifier si le fuseau horaire change
4. **Précision**: Les dates sont stockées correctement en base de données
5. **Affichage**: Les dates sont affichées correctement aux utilisateurs

## Utilisation Recommandée

### Pour les nouvelles dates:

```typescript
import { now, formatDateTime } from "@/lib/dateUtils";

// Créer une nouvelle date
const currentDate = now();

// Formater pour l'affichage
const formattedDate = formatDateTime(currentDate);
```

### Pour les dates existantes en base:

```typescript
import { formatShortDate, formatRelativeTime } from "@/lib/dateUtils";

// Date courte pour les tableaux
{formatShortDate(item.created_at)}

// Temps relatif pour les notifications
{formatRelativeTime(notification.timestamp)}
```

### Pour les dates complètes:

```typescript
import { formatDateTime } from "@/lib/dateUtils";

// Date et heure complètes pour les détails
{formatDateTime(selectedNotification.timestamp)}
```

## Vérification

Pour vérifier que les modifications sont correctes:

1. **Base de données:**
   ```sql
   SELECT NOW(), CURRENT_TIMESTAMP;
   -- Devrait afficher l'heure UTC+2
   ```

2. **Frontend:**
   - Vérifier que les dates affichées correspondent à l'heure locale de Goma/Lubumbashi
   - Tester les notifications pour vérifier les timestamps relatifs

3. **API:**
   - Tester l'endpoint `/api/test_activities.php` pour vérifier la connexion et le fuseau horaire

## Notes

- Le fuseau horaire est défini au niveau de la connexion MySQL, donc toutes les requêtes utilisent UTC+2
- L'utilitaire `dateUtils.ts` utilise le timezone `Africa/Lubumbashi` pour le formatage côté client
- Les dates stockées en base sont en UTC+2, donc pas de conversion nécessaire lors de la lecture
- Le formatage côté frontend utilise le même fuseau horaire pour la cohérence

## Support

En cas de problème avec les dates:
1. Vérifier que `SET time_zone = '+02:00'` est bien exécuté après chaque connexion
2. Vérifier que l'utilitaire `dateUtils.ts` est importé correctement
3. Vérifier le fuseau horaire du serveur MySQL avec `SELECT @@session.time_zone;`
