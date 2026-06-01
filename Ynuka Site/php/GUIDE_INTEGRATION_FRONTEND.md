# 📚 GUIDE D'INTÉGRATION FRONTEND - LECTURE DES DONNÉES PUBLIQUES

## 🎯 Vue d'ensemble

Ce guide montre comment faire fonctionner CHAQUE page du site pour lire les données depuis l'API et les afficher au public.

---

## 1️⃣ BLOG POSTS (Article de Blog)

### État actuel: ✅ FONCTIONNEL

Le composant `BlogPostsSection.tsx` lit déjà les articles:

```javascript
// src/components/BlogPostsSection.tsx (déjà implémenté)
const fetchPosts = async () => {
  const response = await strapiFetch(
    "/api/blog-posts?filters[published][$eq]=true&sort=createdAt:desc&pagination[pageSize]=100"
  );
  // Affiche les posts publiés
};
```

**API convertit en:**
```
GET /php/api.php?action=list&resource=blog_posts&search=published=1&limit=100
```

**Base de données:**
```sql
SELECT * FROM blog_posts WHERE published = 1 ORDER BY created_at DESC
```

---

## 2️⃣ PROJECTS (Projets)

### État actuel: ⚠️ HARDCODED (doit être migré)

**Situation actuelle:**
- Les projets sont en dur dans `src/pages/Projects.tsx`
- Ne vient pas de la BD

**À faire:** Modifier Projects.tsx pour lire de l'API

```javascript
// AVANT (hardcoded)
const projectShowcases: ProjectShowcase[] = [
  { slug: "onboarding-program", title: "Onboarding Program", ... }
];

// APRÈS (depuis l'API)
import { useEffect, useState } from 'react';
import { strapiFetch } from '@/lib/strapi';

const Projects = () => {
  const [projects, setProjects] = useState<ProjectShowcase[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await strapiFetch('/api/projects?filters[status][$eq]=active');
        // Mapper les données BD au format ProjectShowcase
        const mapped = response.data.map((p: any) => ({
          slug: p.slug,
          title: p.title,
          category: p.category || 'Tous',
          shortPresentation: p.description,
          imageUrl: p.featured_image || '/projects/default.jpg',
          exploreUrl: p.live_url || p.repository_url,
          external: !!p.live_url
        }));
        setProjects(mapped);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        // Fallback aux données hardcoded si erreur
      }
    };
    fetchProjects();
  }, []);

  // Reste du code identique...
};
```

**API convertit en:**
```
GET /php/api.php?action=list&resource=projects&search=status=active
```

**Base de données:**
```sql
SELECT * FROM projects WHERE status = 'active'
```

---

## 3️⃣ EVENTS (Événements)

### État actuel: ⚠️ PARTIEL

Le modal d'inscription `EventRegistrationModal.tsx` existe mais les événements ne sont pas affichés.

**À faire:** Créer une page Events qui lit et affiche les événements

```javascript
// src/pages/Events.tsx (À créer)
import { useEffect, useState } from 'react';
import { strapiFetch } from '@/lib/strapi';

interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  featured_image: string;
  type: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Récupère les événements futurs
        const response = await strapiFetch('/api/events?sort=start_date:asc');
        
        // Filtre pour garder seulement les futurs
        const now = new Date();
        const futureEvents = response.data.filter((e: Event) => 
          new Date(e.start_date) > now
        );
        
        setEvents(futureEvents);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <section>
      <h2>Événements</h2>
      <div className="events-grid">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
```

**API convertit en:**
```
GET /php/api.php?action=list&resource=events
```

**Base de données:**
```sql
SELECT * FROM events ORDER BY start_date ASC
```

---

## 4️⃣ GALLERY IMAGES (Galerie)

### État actuel: ⚠️ À VÉRIFIER

**À faire:** S'assurer que la galerie lit de l'API

```javascript
// src/components/GallerySection.tsx (À vérifier/modifier)
import { useEffect, useState } from 'react';
import { strapiFetch } from '@/lib/strapi';

interface GalleryImage {
  id: number;
  title: string;
  description: string;
  image_url: string;
  thumbnail_url: string;
  category: string;
  display_order: number;
}

const GallerySection = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await strapiFetch('/api/gallery-images?sort=display_order:asc');
        setImages(response.data);
      } catch (err) {
        console.error('Failed to fetch gallery:', err);
      }
    };
    fetchGallery();
  }, []);

  return (
    <section>
      <h2>Galerie du Hub</h2>
      <div className="gallery-grid">
        {images.map(img => (
          <img key={img.id} src={img.image_url} alt={img.title} />
        ))}
      </div>
    </section>
  );
};
```

**API convertit en:**
```
GET /php/api.php?action=list&resource=gallery_images
```

**Base de données:**
```sql
SELECT * FROM gallery_images ORDER BY display_order ASC
```

---

## 5️⃣ RESOURCE ITEMS (Ressources)

### État actuel: ⚠️ PARTIEL

La page Resources.tsx utilise des données hardcoded. À migrer vers l'API.

```javascript
// src/pages/Resources.tsx (À modifier)
import { useEffect, useState } from 'react';
import { strapiFetch } from '@/lib/strapi';

interface ResourceItem {
  id: number;
  title: string;
  description: string;
  category: string;
  url: string;
  file_type: string;
}

const Resources = () => {
  const [resources, setResources] = useState<ResourceItem[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        // Récupère toutes les ressources
        const response = await strapiFetch('/api/resource-items');
        setResources(response.data);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
      }
    };
    fetchResources();
  }, []);

  // Grouper par catégorie
  const grouped = resources.reduce((acc, r) => {
    const cat = r.category || 'Autres';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {} as Record<string, ResourceItem[]>);

  return (
    <section>
      <h2>Ressources</h2>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3>{category}</h3>
          <ul>
            {items.map(item => (
              <li key={item.id}>
                <a href={item.url}>{item.title}</a>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
};
```

**API convertit en:**
```
GET /php/api.php?action=list&resource=resource_items
```

**Base de données:**
```sql
SELECT * FROM resource_items
```

---

## 🧪 TESTER CHAQUE ENDPOINT

### Blog Posts
```bash
curl "http://localhost/php/api.php?action=list&resource=blog_posts&search=published=1"
```

### Projects
```bash
curl "http://localhost/php/api.php?action=list&resource=projects&search=status=active"
```

### Events
```bash
curl "http://localhost/php/api.php?action=list&resource=events"
```

### Gallery Images
```bash
curl "http://localhost/php/api.php?action=list&resource=gallery_images"
```

### Resource Items
```bash
curl "http://localhost/php/api.php?action=list&resource=resource_items"
```

---

## 🔌 PATRON À SUIVRE

Pour CHAQUE page/composant qui doit afficher des données publiques:

```javascript
import { useEffect, useState } from 'react';
import { strapiFetch } from '@/lib/strapi';

export default function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Appeler l'API via strapiFetch
        const response = await strapiFetch('/api/ma-ressource?filters[...]');
        
        // 2. Extraire les données
        const items = response.data || [];
        
        // 3. Optionnel: transformer/mapper les données
        const mapped = items.map(item => ({...}));
        
        // 4. État
        setData(mapped);
        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
}
```

---

## 📋 CHECKLIST D'INTÉGRATION

- [ ] Blog Posts: ✅ Déjà fonctionnel
- [ ] Projects: Convertir depuis hardcoded
- [ ] Events: Créer page Events
- [ ] Gallery: Vérifier et migrer si hardcoded
- [ ] Resources: Migrer depuis hardcoded
- [ ] Tester chaque page dans le navigateur
- [ ] Vérifier les données s'affichent
- [ ] Vérifier les filtres fonctionnent
- [ ] Vérifier la pagination fonctionne

---

## ✅ RÉSULTAT FINAL

Une fois toutes les pages migrées:

1. **Admin crée** une ressource (blog, projet, événement, galerie, ressource)
2. **Données sauvegardées** dans MySQL
3. **Site public charge** les données via l'API
4. **Visiteurs voient** les ressources en temps réel ✅

Le flux publication → stockage → lecture → affichage sera **totalement automatisé**.

---

**Date**: 30-05-2026
