
# PANEL ADMIN - CONFIGURATION COMPLÈTE 🎉

## ✅ État Final

**TOUS LES FORMULAIRES SONT MAINTENANT FONCTIONNELS À 100%**

### Formulaires Implémentés

1. **Blog Posts** (/admin/blog_posts) ✅
   - Créer/Modifier/Supprimer des articles
   - Upload de couverture d'image
   - Support bilingue (FR/EN)
   - Statut publié/brouillon

2. **Events** (/admin/events) ✅
   - Créer/Modifier/Supprimer des événements
   - Support bilingue complet
   - Date, localisation, type d'événement
   - Marquage upcoming

3. **Gallery Images** (/admin/gallery_images) ✅
   - Upload d'images (drag & drop)
   - Association aux événements
   - Alternative text (alt)
   - Ordre d'affichage (position)

4. **Projects** (/admin/projects) ✅
   - Créer/Modifier/Supprimer des projets
   - Upload d'image de projet
   - Statut (active, completed, archived)
   - Publié/Brouillon

5. **Team Members** (/admin/team_members) ✅
   - Créer/Modifier/Supprimer des membres
   - Upload d'avatar
   - Rôle, email, bio
   - Ordre de tri

6. **Resource Items** (/admin/resource_items) ✅
   - Créer/Modifier/Supprimer des ressources
   - Support bilingue
   - URL de ressource
   - Section associée

7. **Blog Comments** (/admin/blog_comments) ✅
   - Tableau générique pour tous les champs
   - Édition en ligne via dialogue

8. **Donations** (/admin/donations) ✅
   - Gestion des dons
   - Montant, devise, statut

9. **Contact Messages** (/admin/contact_messages) ✅
   - Consultation des messages
   - Marquage comme traité

10. **Event Registrations** (/admin/event_registrations) ✅
    - Inscriptions aux événements

11. **Newsletter** (/admin/newsletter_subscribers) ✅
    - Gestion des abonnés

---

## 🖼️ Upload d'Images - Configuration

### Endpoint
```
POST /api/api.php?action=upload_image
```

### Répertoire de Stockage
- **Panel Admin**: `/Panel Admin/uploads/gallery/`
- **Permissions**: 755 (rwxr-xr-x)

### Spécifications
- **Formats autorisés**: JPEG, PNG, GIF, WebP, SVG
- **Taille maximale**: 10 MB
- **Sécurité**: Fichiers renommés avec UUID pour éviter collisions
- **Accès**: Les images sont servis via HTTP directement

### Code Exemple (Panel Admin)
```typescript
// Upload depuis un formulaire
const file = e.target.files[0];
const result = await api.uploadImage(file);
console.log(result.url); // URL accessible du fichier uploadé
```

---

## 🔄 Flux Données Panel → Base de Données → Site

### Panel Admin
```
Formulaire → api.ts → php-api.ts → /api/api.php?action=create/update/delete
                              ↓
                      Base de données MySQL
                              ↓
                    Images stockées en /uploads/
```

### Site Web
```
Page React (Blog.tsx, Events.tsx, etc.)
    ↓
strapiFetch() - proxy vers PHP API
    ↓
/php/api.php?action=list&resource=blog_posts
    ↓
Base de données MySQL
    ↓
Données affichées sur les pages
```

---

## 📝 Vérification Avant Déploiement

### 1. Répertoires d'Upload
```bash
# Créer les répertoires
mkdir -p "/var/www/yourdomain/Panel Admin/uploads/gallery"
mkdir -p "/var/www/yourdomain/Ynuka Site/uploads"

# Permissions
chmod 755 "/var/www/yourdomain/Panel Admin/uploads/gallery"
chmod 755 "/var/www/yourdomain/Ynuka Site/uploads"
```

### 2. Test de Diagnostic
- Panel Admin: `https://admin.ynukalabs.com/api/api.php?action=ping`
- Site: `https://ynukalabs.com/php/api.php?action=ping`

Doit retourner `{"ok": true, "db": "ok", ...}`

### 3. Test de Création
```javascript
// Dans la console du panel admin
await api.create("blog_posts", {
  title: "Test Article",
  content: "Contenu de test",
  published: 1
});
```

### 4. Test d'Upload
```javascript
// Créer un fichier de test
const canvas = document.createElement('canvas');
canvas.toBlob(async (blob) => {
  const file = new File([blob], "test.png", { type: "image/png" });
  const result = await api.uploadImage(file);
  console.log("URL:", result.url);
});
```

---

## 🎯 Utilisation - Workflow Complet

### Scénario: Ajouter un Événement

1. **Aller au panel admin**: https://admin.ynukalabs.com
2. **Se connecter** avec credentials admin
3. **Cliquer** "Événements" dans la sidebar
4. **Cliquer** "Ajouter" (bouton +)
5. **Remplir le formulaire**:
   - Titre (FR) *
   - Titre (EN)
   - Description (FR)
   - Description (EN)
   - Date et heure *
   - Localisation
   - Type (Workshop, Seminar, Conference)
   - Image (optionnel - upload ou URL)
   - Marqué "Upcoming"
6. **Cliquer** "Créer"
7. **Confirmation**: "Événement créé avec succès"
8. **Sur le site**: La page Events affichera automatiquement le nouvel événement

### Scénario: Ajouter une Image à la Galerie

1. **Aller à**: /admin/gallery_images
2. **Cliquer** "Ajouter"
3. **Sélectionner un événement**
4. **Drag & drop** une image ou cliquer "Télécharger"
5. **Entrer** un texte alternatif (alt text)
6. **Définir l'ordre** (position)
7. **Cliquer** "Ajouter"
8. **Sur le site**: L'image apparaît dans la galerie de l'événement

---

## 🔐 Sécurité

- ✅ Authentification JWT pour le panel admin
- ✅ Validation des types MIME pour les uploads
- ✅ Vérification des tailles de fichiers
- ✅ Nommage aléatoire des fichiers uploadés
- ✅ Protection CORS configurée
- ✅ Validation des ressources autorisées

---

## 📚 Architecture

```
Panel Admin (React + TypeScript)
├── /src/components
│   ├── EventForm.tsx (formulaire événements)
│   ├── BlogPostsForm.tsx (formulaires articles)
│   ├── GalleryImageFormRefactored.tsx (galerie)
│   ├── ProjectForm.tsx (projets)
│   ├── TeamMemberForm.tsx (équipe)
│   ├── ResourceItemForm.tsx (ressources)
│   └── ResourceTable.tsx (tableau générique)
├── /src/lib
│   ├── api.ts (client d'API)
│   ├── php-api.ts (client PHP direct)
│   └── php-auth.ts (authentification)
└── /php-api/api.php (backend PHP)

Site Web (React + TypeScript)
├── /src/pages
│   ├── Blog.tsx
│   ├── Events.tsx
│   ├── Projects.tsx
│   └── Resources.tsx
├── /src/lib
│   └── strapi.ts (proxy vers API PHP)
└── /php/api.php (API pour site)
```

---

## 🆘 Dépannage

### Les images n'upload pas
1. Vérifier les permissions du répertoire `/uploads/gallery`
2. Vérifier que le serveur a la permission d'écrire
3. Vérifier les logs PHP pour les erreurs

### Les données n'apparaissent pas sur le site
1. Vérifier que `https://ynukalabs.com/php/api.php?action=list&resource=blog_posts` retourne les données
2. Vérifier la console navigateur pour les erreurs
3. Vérifier que le proxy Strapi fonctionne correctement

### Authentification échouée
1. Vérifier les credentials
2. Vérifier que `admin_users` table existe et a des users
3. Vérifier que JWT_SECRET est configuré correctement

---

## 📞 Support

En cas de problème, vérifier:
1. Les logs du serveur PHP
2. La console du navigateur (DevTools → Console)
3. L'état de la base de données
4. Les permissions des fichiers

---

**DÉPLOIEMENT COMPLET - PRÊT POUR PRODUCTION ✅**
