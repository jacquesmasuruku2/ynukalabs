# ⚠️ Correction nécessaire: Champs des tables de la base de données

## Problème identifié

Le panel admin utilise des noms de champs différents de ceux définis dans le schéma SQL initial:

### Blog Posts
| Panel Admin | Table SQL (actuel) | Action requise |
|-------------|-------------------|----------------|
| `cover_url` | `featured_image` | Renommer en `cover_url` |
| `title_fr` | Non existant | Ajouter |
| `excerpt_fr` | Non existant | Ajouter |
| `category` | Non existant | Ajouter |

### Events
| Panel Admin | Table SQL (actuel) | Action requise |
|-------------|-------------------|----------------|
| `image_url` | `featured_image` | Renommer en `image_url` |
| `title_fr` | Non existant | Ajouter |
| `description_fr` | Non existant | Ajouter |
| `upcoming` | Non existant | Ajouter |

### Projects
| Panel Admin | Table SQL (actuel) | Action requise |
|-------------|-------------------|----------------|
| `image_url` | `featured_image` | Renommer en `image_url` |

## Pourquoi c'est nécessaire

L'API PHP utilise `array_intersect_key($body, array_flip($cols))` pour filtrer les données. Cela signifie:
- **Seuls les champs qui existent dans la table sont sauvegardés**
- Si le panel admin envoie `cover_url` mais que la table a `featured_image`, le champ est **ignoré**
- **L'image ne sera pas sauvegardée dans la base de données**

## Solution immédiate

Exécutez le script SQL `Panel Admin/php-api/alter-tables.sql` sur votre base de données:

```bash
mysql -u ynukalab_admin-jacques -p ynukalab_database_website < "Panel Admin/php-api/alter-tables.sql"
```

Ou via phpMyAdmin:
1. Ouvrez phpMyAdmin
2. Sélectionnez la base `ynukalab_database_website`
3. Cliquez sur l'onglet "SQL"
4. Copiez-collez le contenu de `alter-tables.sql`
5. Cliquez sur "Exécuter"

## Vérification après modification

Après avoir exécuté le script, vérifiez que les champs existent:

```sql
-- Vérifier blog_posts
DESCRIBE blog_posts;

-- Vérifier events
DESCRIBE events;

-- Vérifier projects
DESCRIBE projects;
```

## Une fois les tables modifiées

1. **Déployez l'API modifiée** - Uploadez `Panel Admin/php-api/api.php` vers `public_html/api/api.php`
2. **Déployez le frontend** - Uploadez le dossier `dist/` vers `public_html/`
3. **Testez** - Publiez un article avec image dans le panel admin et vérifiez sur le site public

## Alternative (si vous ne pouvez pas modifier les tables)

Si vous ne pouvez pas modifier la structure des tables, vous devez modifier le panel admin pour utiliser les noms de champs existants:

1. Dans `Panel Admin/src/routes/admin.blog_posts.tsx`: changer `cover_url` en `featured_image`
2. Dans `Panel Admin/src/components/EventForm.tsx`: changer `image_url` en `featured_image`
3. Dans `Panel Admin/src/components/ProjectForm.tsx`: changer `image_url` en `featured_image`
4. Dans `Ynuka Site/src/lib/api.ts`: changer les noms de champs pour correspondre

**Cette alternative est déconseillée car elle nécessite plus de modifications.**
