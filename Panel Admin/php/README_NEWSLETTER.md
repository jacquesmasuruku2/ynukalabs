# Système de Newsletter - Ynuka Labs

## 🚀 Installation rapide

### 1. Créer la table MySQL
Exécutez le fichier SQL `create_newsletters_table.sql` dans phpMyAdmin.

### 2. Configurer l'API Brevo
Ouvrez `config.php` et remplacez `YOUR_BREVO_API_KEY` par votre clé API réelle.

### 3. Accéder au système
Ouvrez : `https://admin.ynukalabs.com/php/admin_newsletter.php`

## 📁 Fichiers créés

- `config.php` - Configuration DB et Brevo
- `header.php` - Header avec design sombre/clair
- `footer.php` - Footer avec scripts
- `admin_newsletter.php` - Page principale (liste des newsletters)
- `newsletter_form.php` - Formulaire avec éditeur TinyMCE
- `save_and_send.php` - Backend d'envoi via Brevo API
- `newsletter_view.php` - Visualisation des newsletters
- `newsletter_delete.php` - Suppression de newsletters
- `unsubscribe.php` - Page publique de désabonnement
- `create_newsletters_table.sql` - Script SQL

## ✨ Fonctionnalités

- ✅ Création de newsletters avec éditeur WYSIWYG (TinyMCE)
- ✅ Enregistrement de brouillons
- ✅ Envoi massif via API Brevo v3
- ✅ Historique des envois avec statuts
- ✅ Lien de désabonnement automatique dans les emails
- ✅ Design responsive sombre/clair
- ✅ Statistiques (total, envoyées, brouillons)

## 🔧 Configuration requise

1. **Clé API Brevo** : Remplacez dans `config.php`
2. **Table MySQL** : Exécutez le SQL fourni
3. **Session admin** : Adaptez `checkAdminSession()` si nécessaire

## 📧 Workflow d'utilisation

1. **Créer** : Cliquez sur "Rédiger une newsletter"
2. **Rédiger** : Utilisez l'éditeur TinyMCE pour le contenu
3. **Sauvegarder** : "Enregistrer le brouillon" ou "Enregistrer et Diffuser"
4. **Envoyer** : Le système envoie à tous les abonnés actifs via Brevo
5. **Désabonnement** : Les utilisateurs peuvent se désabonner via le lien dans l'email

## 🎨 Design

Le système utilise :
- Tailwind CSS (CDN)
- Font Awesome (CDN)
- TinyMCE (CDN)
- Thème sombre par défaut avec toggle clair
- Couleur primaire : #ffb800 (orange Ynuka Labs)

## 📞 Support

Pour la configuration détaillée, voir `NEWSLETTER_SETUP_GUIDE.md`.
