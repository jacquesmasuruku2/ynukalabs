# Migration CockroachDB Ynuka Labs

## 1. Schema public du site

Le fichier `cockroach-full-schema.sql` crée les tables snake_case utilisées par l'API PHP publique : accueil, blog, événements, projets, opportunités, équipe, ressources, galerie, partenaires, newsletter, contacts, dons et candidatures.

À exécuter une fois sur la base CockroachDB cible :

```bash
cockroach sql --url "$DATABASE_URL" --file cockroach-full-schema.sql
```

Ne mettez jamais `DATABASE_URL` dans Git ou dans le bundle du site public.

## 2. Schema Prisma du panel

Le panel Next.js utilise les modèles de `schema.prisma`, notamment `TeamMember`, `Article`, `BlogPost`, `JobOffer`, `AdminUser` et les tables liées. Déployez ses migrations avec :

```bash
cd admin-panel
npx prisma generate
npx prisma migrate deploy
```

La variable `DATABASE_URL` doit être configurée dans Vercel pour le projet `admin-panel`.

## 3. Connexion du site public

Configurez dans Vercel pour le projet du site :

```text
VITE_ADMIN_API_URL=https://<votre-panel-admin>.vercel.app
```

Le site utilise cette URL pour lire les membres publiés par le panel, notamment :

```text
GET /api/team-members
GET /api/team-members?slug=jacques-masuruku
```

## 4. Point important sur l'API PHP

Le fichier `php/api.php` historique contient des requêtes MySQL spécifiques (`SHOW COLUMNS`, backticks et conventions MySQL). Avant de remplacer sa base MySQL par CockroachDB, il faut porter ces requêtes vers PostgreSQL/CockroachDB. Le script SQL crée la structure compatible, mais ne convertit pas automatiquement le code PHP.

## 5. Migration des données existantes

Le script crée uniquement la structure. Pour migrer les données MySQL :

1. exporter les tables existantes ;
2. convertir les types (`DATETIME` vers `TIMESTAMPTZ`, `LONGTEXT` vers `STRING`, JSON vers `JSONB`) ;
3. importer les données après création des tables ;
4. vérifier les clés étrangères et les doublons de slug/email ;
5. tester `/events`, `/blog`, `/projects`, `/opportunities`, `/team` et les formulaires.
