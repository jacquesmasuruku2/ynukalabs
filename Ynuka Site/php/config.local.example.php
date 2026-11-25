<?php
// Copier ce fichier en "config.local.php" SUR LE SERVEUR (à côté de config.php)
// et remplir les vraies valeurs. config.local.php ne doit jamais être commité.

define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'CHANGER');
define('DB_PASS', 'CHANGER');

// Clé de signature des jetons de l'API (64 caractères aléatoires minimum).
// Générer avec : php -r "echo bin2hex(random_bytes(32));"
define('JWT_SECRET', 'CHANGER');

// Origines autorisées à appeler l'API depuis un navigateur.
define('ALLOWED_ORIGINS', 'https://ynukalabs.com,https://www.ynukalabs.com,https://admin.ynukalabs.com');

// Google OAuth (Google Cloud Console > Identifiants)
define('GOOGLE_CLIENT_ID', 'CHANGER.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', 'CHANGER');
