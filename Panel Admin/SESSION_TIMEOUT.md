# Session Timeout - Expiration de Session

## Fonctionnalité

Le panel admin dispose désormais d'un système d'expiration de session automatique après **1 heure d'inactivité**.

## Comportement

- **Durée d'inactivité** : 1 heure (60 minutes)
- **Vérification** : Toutes les minutes
- **Activité surveillée** : Clics, mouvements de souris, touches, scroll, touch

## Ce qui se passe

1. L'activité de l'utilisateur est trackée en temps réel
2. Si l'utilisateur est inactif pendant plus de 1 heure, sa session expire
3. Une notification toast apparaît : "Votre session a expiré. Veuillez vous reconnecter."
4. L'utilisateur est redirigé automatiquement vers la page de connexion
5. Le token et le timestamp d'activité sont supprimés du localStorage

## Cas d'utilisation

- **Onglet inactif** : Si l'utilisateur laisse l'onglet ouvert sans activité pendant 1 heure
- **Navigation away** : Si l'utilisateur va sur un autre onglet et revient après 1 heure
- **Focus perdu** : Si l'utilisateur minimise le navigateur et revient après 1 heure

## Configuration

Pour modifier la durée d'expiration, éditez `src/hooks/useSessionTimeout.ts` :

```typescript
const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 heure en millisecondes
```

Exemples :
- 30 minutes : `30 * 60 * 1000`
- 2 heures : `2 * 60 * 60 * 1000`
- 15 minutes : `15 * 60 * 1000`

## Fichiers modifiés

- `src/hooks/useSessionTimeout.ts` (nouveau) - Hook de gestion du timeout
- `src/routes/admin.tsx` - Intégration du hook dans le layout admin
- `src/lib/php-auth.ts` - Nettoyage du timestamp lors de la déconnexion

## Mode développement

Le système est désactivé en mode développement (`localhost` ou `127.0.0.1`) pour faciliter les tests.
