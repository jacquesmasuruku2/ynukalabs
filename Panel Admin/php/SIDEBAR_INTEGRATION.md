# Intégration du système Newsletter dans le Sidebar React

## 📍 Localisation du Sidebar

Le sidebar se trouve probablement dans :
- `Panel Admin/src/components/Sidebar.tsx` ou
- `Panel Admin/src/layout/Sidebar.tsx` ou
- `Panel Admin/src/components/layout/Sidebar.tsx`

## 🔧 Méthode 1 : Lien direct vers PHP (recommandée pour commencer)

### Modifier le composant Sidebar

Trouvez l'élément de menu "Newsletter" et modifiez le lien :

```tsx
// Dans votre fichier Sidebar.tsx
const menuItems = [
  // ... autres items
  {
    title: 'Newsletter',
    icon: <Envelope className="w-5 h-5" />,
    href: '/php/admin_newsletter.php', // Modification ici
    badge: 'Nouveau'
  },
  // ... autres items
];
```

### Utiliser un lien externe

Si votre sidebar utilise des liens internes React Router, vous pouvez utiliser un lien externe :

```tsx
<a 
  href="/php/admin_newsletter.php" 
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
>
  <Envelope className="w-5 h-5" />
  <span>Newsletter</span>
</a>
```

## 🔧 Méthode 2 : Intégration React complète

Si vous préférez une intégration 100% React, créez des composants React qui utilisent votre API existante.

### Étape 1 : Créer les endpoints API dans api.php

Ajoutez ces actions dans votre `Panel Admin/php-api/api.php` :

```php
// Lister les newsletters
case 'list_newsletters': {
    require_auth();
    $stmt = db()->query("SELECT * FROM newsletters ORDER BY created_at DESC");
    json_out(['newsletters' => $stmt->fetchAll()]);
}

// Créer une newsletter
case 'create_newsletter': {
    require_auth();
    $subject = trim($body['subject'] ?? '');
    $content = $body['content'] ?? '';
    
    if (empty($subject) || empty($content)) {
        err('Missing required fields', 400);
    }
    
    $stmt = db()->prepare("INSERT INTO newsletters (subject, content, status) VALUES (?, ?, 'draft')");
    $stmt->execute([$subject, $content]);
    
    json_out(['success' => true, 'id' => db()->lastInsertId()]);
}

// Mettre à jour une newsletter
case 'update_newsletter': {
    require_auth();
    $id = $_GET['id'] ?? null;
    $subject = trim($body['subject'] ?? '');
    $content = $body['content'] ?? '';
    $status = $body['status'] ?? 'draft';
    
    if (!$id || empty($subject) || empty($content)) {
        err('Missing required fields', 400);
    }
    
    $stmt = db()->prepare("UPDATE newsletters SET subject = ?, content = ?, status = ? WHERE id = ?");
    $stmt->execute([$subject, $content, $status, $id]);
    
    json_out(['success' => true]);
}

// Envoyer une newsletter
case 'send_newsletter': {
    require_auth();
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        err('Missing newsletter ID', 400);
    }
    
    // Logique d'envoi via Brevo (à adapter depuis save_and_send.php)
    // ...
    
    json_out(['success' => true]);
}

// Supprimer une newsletter
case 'delete_newsletter': {
    require_auth();
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        err('Missing newsletter ID', 400);
    }
    
    $stmt = db()->prepare("DELETE FROM newsletters WHERE id = ?");
    $stmt->execute([$id]);
    
    json_out(['success' => true]);
}
```

### Étape 2 : Créer les composants React

Créez `Panel Admin/src/pages/Newsletter.tsx` :

```tsx
import { useState, useEffect } from 'react';
import { fetchFromApi } from '@/lib/api';

export default function Newsletter() {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const data = await fetchFromApi('list_newsletters');
      setNewsletters(data.newsletters || []);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Gestion des Newsletters</h1>
      
      {/* Liste des newsletters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
        {/* ... */}
      </div>
    </div>
  );
}
```

### Étape 3 : Ajouter la route

Dans votre fichier de routes (`Panel Admin/src/App.tsx` ou similaire) :

```tsx
import Newsletter from '@/pages/Newsletter';

// Dans vos routes
<Route path="/newsletter" element={<Newsletter />} />
```

### Étape 4 : Mettre à jour le sidebar

```tsx
{
  title: 'Newsletter',
  icon: <Envelope className="w-5 h-5" />,
  href: '/newsletter', // Lien React interne
  badge: 'Nouveau'
}
```

## 🎯 Recommandation

**Pour commencer** : Utilisez la Méthode 1 (lien direct PHP) pour tester le système rapidement.

**Pour la production** : Migrez vers la Méthode 2 (intégration React complète) pour une expérience utilisateur cohérente.

## 📝 Notes importantes

1. **Authentification** : Les pages PHP utilisent une vérification de session basique. Vous devrez peut-être l'adapter à votre système JWT existant.

2. **Design** : Les pages PHP utilisent Tailwind CSS avec un thème similaire à votre Panel Admin React.

3. **API Brevo** : La clé API doit être configurée dans `config.php`.

4. **Transition** : Vous pouvez utiliser les deux méthodes en parallèle pendant la transition.

## 🔗 Liens utiles

- Page PHP : `/php/admin_newsletter.php`
- Formulaire : `/php/newsletter_form.php`
- API Documentation : Voir `NEWSLETTER_SETUP_GUIDE.md`
