# Cutover : Panel Admin (Prisma / Cockroach) = source unique

## Prérequis

1. Migration SQL appliquée sur Cockroach :
   ```bash
   cd admin-panel
   npx prisma db execute --file prisma/unlock-schema.sql
   npx prisma db execute --file prisma/migrations/20260321_site_content_models/migration.sql
   npx prisma generate
   ```
2. Admin panel démarré (`npm run dev` ou prod).
3. Site Vite avec `VITE_ADMIN_API_URL` pointant vers le panel :
   - Local : `http://localhost:3000`
   - Prod : `https://admin.ynukalabs.com`

## Migration des données PHP → Cockroach

```bash
cd admin-panel
# test
DRY_RUN=1 node scripts/migrate-php-to-cockroach.mjs
# écriture
ADMIN_API_URL=http://localhost:3000 node scripts/migrate-php-to-cockroach.mjs
```

Variables optionnelles : `PHP_API_URL`, `ADMIN_API_URL`, `DRY_RUN=1`.

## Checklist smoke test

- [ ] `/events` — événements publiés depuis le panel
- [ ] `/projects` + accueil (`showOnHome`)
- [ ] `/blog` — articles Prisma (`publishedAt <= now`)
- [ ] `/opportunities`
- [ ] `/partners` + About
- [ ] `/team` + `/team/:slug`
- [ ] `/catalog` / documentation (`resource-sections`)
- [ ] `/gallery`
- [ ] Contact + newsletter (POST panel)

## Cutover prod

1. Déployer **admin-panel** (API + UI CRUD).
2. Exécuter le script de migration (une fois).
3. Build / deploy **Ynuka Site** avec `VITE_ADMIN_API_URL=https://admin.ynukalabs.com`.
4. Vérifier smoke test.
5. Mettre l’API PHP en lecture seule puis la retirer.

## Base privée / Cockroach

Changer uniquement `DATABASE_URL` dans `admin-panel/.env` :
- Cockroach Cloud (actuel)
- Cockroach self-hosted
- Postgres compatible (éventuellement `provider = "postgresql"` dans `schema.prisma`)

Aucune autre config côté site : il parle uniquement à `${VITE_ADMIN_API_URL}/api/*`.
