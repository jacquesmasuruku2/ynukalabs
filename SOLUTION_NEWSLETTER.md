# ✅ Solution Formulaire Newsletter

## Problème identifié

Le formulaire de newsletter utilisait une **URL hardcodée** différente de celle du formulaire de contact:

**Footer.tsx (avant):**
```javascript
const apiUrl = `${window.location.origin}/php/api.php?action=create&resource=newsletter_subscribers`;
```

**Contact.tsx (déjà correct):**
```javascript
await strapiFetch("/api/contact-messages", { ... });
```

### Conséquence

- Formulaire contact → utilisait `VITE_API_URL` → `https://admin.ynukalabs.com/api/api.php` ✅
- Formulaire newsletter → utilisait URL hardcodée → `https://ynukalabs.com/php/api.php` ❌

Quand l'API a été déplacée de `/php/api.php` vers `/api/api.php`, le formulaire de newsletter a cessé de fonctionner.

## Solution appliquée

Modifié `Footer.tsx` pour utiliser `strapiFetch` comme le formulaire de contact:

**Footer.tsx (après):**
```javascript
await strapiFetch("/api/newsletter-subscribers", {
  method: "POST",
  body: JSON.stringify({
    data: {
      email: newsletterEmail,
      name: newsletterName || "Anonymous",
      active: 1,
      subscribed_at: new Date().toISOString(),
    },
  }),
});
```

## Avantages

1. **Unification** - Tous les formulaires utilisent maintenant `strapiFetch`
2. **Configuration centralisée** - Une seule API URL dans `.env`
3. **Maintenance simplifiée** - Changement d'API = modification d'une seule ligne
4. **Gestion d'erreur améliorée** - Utilise le même système d'erreur que le contact
5. **Format compatible** - Utilise le format Strapi-like

## 📋 Actions requises

### 1. Déployez le nouveau build

Le build est terminé. Déployez le dossier `dist/` vers `public_html/` sur le serveur.

### 2. Testez

- Formulaire de contact → devrait continuer de fonctionner ✅
- Formulaire de newsletter → devrait maintenant fonctionner ✅

## 📊 Architecture finale

```
Tous les formulaires (contact, newsletter, etc.)
    ↓ strapiFetch()
    ↓
VITE_API_URL (dans .env)
    ↓
https://admin.ynukalabs.com/api/api.php
    ↓
Base de données MySQL
```

## 🔧 Configuration actuelle

```env
# Ynuka Site/.env
VITE_API_URL=https://admin.ynukalabs.com/api/api.php
```

Aucune modification nécessaire - tous les formulaires utilisent maintenant cette URL.

## ✅ Vérification

Après déploiement, testez:
1. Page `/contact` - Formulaire de contact
2. Footer - Formulaire de newsletter
3. Les deux devraient fonctionner et enregistrer les données dans la base
