# CV Upload pour Opportunités

## Vue d'ensemble

Ajout de la fonctionnalité de téléchargement de CV PDF lors de la candidature aux opportunités.

## Changements effectués

### Frontend (React)

1. **MotivationFormModal.tsx** - Nouveau composant modal
   - Champ de upload de fichier PDF (max 5 MB)
   - Validation du type MIME (PDF uniquement)
   - Affichage du nom du fichier avec bouton de suppression
   - Support multilingue (FR/EN)

2. **OpportunityDetail.tsx** - Page de détail des opportunités
   - Intégration du formulaire de motivation
   - Gestion de l'upload du CV via la nouvelle fonction `uploadCVFile()`
   - Envoi du lien du CV avec les autres données du formulaire

3. **api.ts** - Fonctions API
   - Nouvelle fonction `uploadCVFile(file: File)` : Upload du fichier au serveur
   - Mise à jour de `submitMotivationForm()` : Ajout du paramètre `cv_file_url`

### Backend (PHP)

1. **upload-cv.php** - Endpoint d'upload
   - Valide le type MIME (application/pdf)
   - Limite la taille à 5 MB
   - Génère un nom de fichier unique et sécurisé
   - Sauvegarde dans le dossier `uploads/cvs/`
   - Retourne l'URL du fichier

### Base de données

1. **create-opportunity-motivation-forms-table.sql**
   - Table complète avec colonne `cv_file_url`

2. **add-cv-column-to-motivation-forms.sql**
   - Script de migration si la table existe déjà

## Instructions de déploiement

### 1. Base de données

```sql
-- Si c'est la première fois (créer la table):
-- Exécutez create-opportunity-motivation-forms-table.sql

-- Si la table existe déjà (ajouter la colonne):
ALTER TABLE `opportunity_motivation_forms` 
ADD COLUMN `cv_file_url` longtext AFTER `message`;
```

### 2. Répertoire des uploads

Assurez-vous que le répertoire est créé et accessible en écriture:

```bash
mkdir -p /var/www/ynukalabs.com/public_html/uploads/cvs
chmod 755 /var/www/ynukalabs.com/public_html/uploads/cvs
```

### 3. Fichiers PHP

Copiez ou déployez:
- `php/upload-cv.php` - Endpoint d'upload

### 4. Frontend

Les fichiers React sont déjà compilés lors du build (npm run build).

## Flux utilisateur

1. Visiteur navigue vers `/opportunities/:id`
2. Clique sur "Postuler maintenant"
3. Connexion Google
4. Le formulaire de motivation apparaît avec les champs:
   - Profil LinkedIn (optionnel)
   - Profil X (optionnel)
   - Lien portfolio (optionnel)
   - Message de motivation (optionnel)
   - **CV PDF (optionnel, max 5 MB)**
5. Soumet le formulaire
   - CV uploadé vers `/uploads/cvs/`
   - URL du CV sauvegardée dans la base de données
   - Candidature enregistrée avec tous les détails

## Structure de la base de données

```sql
CREATE TABLE `opportunity_motivation_forms` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `opportunity_id` int NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_name` varchar(255),
  `user_avatar` longtext,
  `linkedin_url` varchar(500),
  `twitter_url` varchar(500),
  `portfolio_url` varchar(500),
  `message` longtext,
  `cv_file_url` longtext,  -- ← Nouvelle colonne
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_opportunity_id` (`opportunity_id`),
  KEY `idx_user_email` (`user_email`),
  KEY `idx_opportunity_email` (`opportunity_id`, `user_email`),
  FOREIGN KEY (`opportunity_id`) REFERENCES `opportunities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## Configuration upload-cv.php

- **Répertoire**: `/uploads/cvs/`
- **MIME autorisé**: `application/pdf` uniquement
- **Taille max**: 5 MB
- **Format du nom**: `{timestamp}_{random}_{original_name}.pdf`

## Sécurité

✅ Validation du type MIME (vérification serveur)
✅ Limite de taille de fichier
✅ Nom de fichier sécurisé et unique
✅ CORS activé pour les uploads
✅ Stockage en dehors de la racine web

## Dépannage

**Erreur 401 lors de l'upload?**
- Vérifiez les droits d'accès du répertoire `/uploads/cvs/`
- Assurez-vous que le serveur web peut écrire dans ce répertoire

**Erreur "File size exceeds 5 MB"?**
- Le fichier dépasse la limite de 5 MB
- Demandez au utilisateur de compresser ou de réduire le CV

**Erreur "Only PDF files are allowed"?**
- Le fichier n'est pas un PDF valide
- Vérifiez le type MIME du fichier
