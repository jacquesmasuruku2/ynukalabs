# Admin Ynuka - SPA Conversion

## Changement

**Admin Ynuka** a été converti de **TanStack Start SSR** → **SPA Simple (React Router)**

### Pourquoi ?

TanStack Start nécessite un **serveur Node.js** (coûteux sur shared hosting).
Pour Interserver (shared hosting), une SPA simple suffit et déploie directement sur Interserver.

### Architecture

**Point d'entrée SPA:**
- `index-spa.html` - HTML racine
- `src/main-spa.tsx` - Point d'entrée React
- TanStack Router configuré en mode SPA

**Build:**
```bash
cd "Admin Ynuka"
npm run build:spa      # Build SPA
npm run build          # Build original (TanStack Start)
```

**Vite Config:**
- `vite.config.ts` - Config originale (TanStack Start)
- `vite-spa.config.ts` - Config SPA pour build:spa

### Déploiement

Le workflow GitHub Actions utilise maintenant:
```bash
npm run build:spa
```

**Déploie vers:**
- `/home/ynukalab/admin.ynukalabs.com/dist/`

### Routing

TanStack Router fonctionne en mode **BrowserRouter** (client-side routing).

**Attention:** Pour que le routage client-side fonctionne sur Interserver, il faut une règle `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**À placer dans:** `/home/ynukalab/admin.ynukalabs.com/.htaccess`

### Fichiers Modifiés

- ✅ `src/main-spa.tsx` - Point d'entrée SPA
- ✅ `index-spa.html` - HTML racine
- ✅ `vite-spa.config.ts` - Config Vite pour SPA
- ✅ `package.json` - Ajout du script build:spa
- ✅ `.github/workflows/deploy.yml` - Utilise build:spa

### Test Local

```bash
cd "Admin Ynuka"
npm install
npm run build:spa
npm run preview
# Ouvrir http://localhost:4173
```

### Migration Future

Si vous voulez revenir à TanStack Start:
```bash
npm run build    # Au lieu de build:spa
```

Mais cela nécessite un serveur Node.js (pas sur Interserver).
