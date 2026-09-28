# Guide de Déploiement pour l'Envoi d'Emails Automatiques

## Problème Actuel
Le formulaire de contact affiche l'erreur : `{"error":"Unknown action. Try ?action=ping"}`

## Cause
Le fichier `api.php` sur le serveur n'a pas encore été mis à jour avec les nouveaux handlers pour :
- `subscribe_newsletter` (inscription newsletter avec email automatique)
- `submit_contact_form` (formulaire contact avec email de confirmation)

## Solution : Déployer le fichier api.php modifié

### Étape 1 : Localiser le fichier modifié
**Chemin local :** `c:\Projets Apps\Site-Ynukalabs\Ynuka Site\php\api.php`

### Étape 2 : Déployer sur le serveur

#### Option A : Via FTP/SFTP (Recommandé)
1. Ouvrir votre client FTP (FileZilla, WinSCP, etc.)
2. Se connecter au serveur :
   - Hôte : `admin.ynukalabs.com`
   - Utilisateur : [votre utilisateur FTP]
   - Mot de passe : [votre mot de passe FTP]
3. Naviguer vers le dossier `/api/` ou le dossier contenant `api.php`
4. Télécharger le fichier `api.php` modifié depuis votre ordinateur
5. Remplacer le fichier existant sur le serveur

#### Option B : Via cPanel/Plesk
1. Se connecter au panneau de contrôle
2. Ouvrir le "File Manager"
3. Naviguer vers `/public_html/api/` ou le dossier approprié
4. Télécharger le fichier `api.php` modifié
5. Remplacer le fichier existant

#### Option C : Via SSH
```bash
# Se connecter au serveur
ssh user@admin.ynukalabs.com

# Naviguer vers le dossier API
cd /path/to/api/

# Sauvegarder l'ancien fichier
cp api.php api.php.backup

# Télécharger le nouveau fichier (via scp depuis votre ordinateur)
# Ou utiliser un éditeur pour coller le contenu
```

### Étape 3 : Vérifier le déploiement

1. **Tester via le navigateur :**
   ```
   https://admin.ynukalabs.com/api/api.php?action=ping
   ```
   Devrait retourner : `{"status":"ok",...}`

2. **Tester avec le script de test :**
   - Uploader `test-email-actions.php` dans le même dossier que `api.php`
   - Accéder à : `https://admin.ynukalabs.com/api/test-email-actions.php`
   - Vérifier que les actions `subscribe_newsletter` et `submit_contact_form` sont reconnues

### Étape 4 : Tester les formulaires

1. **Formulaire de newsletter (Footer) :**
   - Aller sur n'importe quelle page du site
   - Remplir le formulaire newsletter dans le footer
   - Vérifier que vous recevez l'email de confirmation

2. **Formulaire de contact (/contact) :**
   - Aller sur `/contact`
   - Remplir le formulaire
   - Vérifier que vous recevez l'email de confirmation

## Configuration de l'envoi d'emails (si nécessaire)

### Si les emails ne s'envoient pas après le déploiement :

#### Option 1 : Vérifier la configuration PHP mail()
```php
<?php
// Créer test-mail.php sur le serveur
if (mail('votre-email@example.com', 'Test', 'Test email')) {
    echo 'Email envoyé avec succès';
} else {
    echo 'Échec de l\'envoi - vérifier la configuration mail()';
}
?>
```

#### Option 2 : Configurer SMTP (Recommandé pour la production)
Modifier `php.ini` sur le serveur :
```ini
[mail function]
SMTP = smtp.gmail.com
smtp_port = 587
sendmail_from = contact@ynukalabs.com
```

Ou utiliser un service SMTP externe :
- SendGrid
- Mailgun
- Amazon SES
- Google Workspace SMTP

#### Option 3 : Installer Postfix/Sendmail
```bash
# Sur Ubuntu/Debian
sudo apt-get update
sudo apt-get install postfix
```

## Solution Temporaire (En attendant le déploiement)

Le formulaire de contact utilise actuellement Strapi (sans email automatique).
Une fois le fichier `api.php` déployé, vous pourrez réactiver l'envoi d'email automatique en modifiant `Contact.tsx` :

```typescript
// Dans src/pages/Contact.tsx
import { submitContactForm } from "@/lib/api";

// Dans handleSubmit
await submitContactForm({
  name: formData.name,
  email: formData.email,
  phone: formData.phone,
  subject: formData.subject,
  message: formData.message,
});
```

## Résumé des Actions

1. ✅ **Déployer** le fichier `api.php` modifié sur le serveur
2. ✅ **Tester** l'accessibilité de l'API
3. ✅ **Tester** les formulaires (newsletter et contact)
4. ✅ **Vérifier** la configuration d'envoi d'emails si nécessaire
5. ✅ **Réactiver** l'envoi d'email automatique dans Contact.tsx après déploiement

## Support

Si vous rencontrez des problèmes :
- Vérifier les logs PHP : `/var/log/php/error.log`
- Vérifier les logs mail : `/var/log/mail.log`
- Contacter l'hébergeur si la configuration mail() est bloquée
