# Sécurité — actions à faire après la mise à jour (novembre 2026)

## 1. Changer les secrets qui ont fuité dans Git (URGENT)
Ces valeurs sont dans l'historique Git : elles doivent être considérées comme publiques.
- Mot de passe MySQL `ynukalab_admin-jacques` → le changer dans cPanel.
- Google OAuth Client Secret (`GOCSPX-…`) → Google Cloud Console > Identifiants > réinitialiser le secret.
- Mot de passe admin de jacquesmasuruku2@gmail.com (ancien `admin-users.json`) → le changer.

## 2. Serveur PHP (Interserver) — AVANT de redéployer
Créer `config.local.php` à côté de `config.php` (modèle : `Ynuka Site/php/config.local.example.php`)
avec : DB_*, JWT_SECRET (64 caractères aléatoires), ALLOWED_ORIGINS, GOOGLE_CLIENT_ID/SECRET.
Pour `api/activities.php`, ajouter aussi `define('ACTIVITIES_API_KEY', '…');` (32+ caractères).
Supprimer du serveur : diagnostic.php, generate-admin.php, test-*.php, test-api*.html, test_activities.php.

## 3. Panel admin (Vercel)
- Variable `ALLOWED_ORIGINS` (optionnelle) : origines autorisées, séparées par des virgules.
  Par défaut : https://ynukalabs.com, https://www.ynukalabs.com, https://admin.ynukalabs.com
- Toutes les sessions admin existantes sont invalidées : il faut se reconnecter.
- La connexion Google admin est désactivée (elle n'était pas sécurisée).

## 4. Ce qui reste à faire
- 2FA pour les super-admins.
- Limitation de débit partagée entre instances (Upstash Redis / Vercel KV) : l'actuelle est en mémoire.
- Espace d'échange événements / notifications : l'accès se fait encore avec le seul email.
  À remplacer par un lien signé (jeton) envoyé par email.
- Le formulaire de candidature du site envoie le CV vers `/api/upload`, qui est réservé aux admins :
  prévoir une route d'upload de CV publique dédiée (PDF uniquement, taille limitée).
