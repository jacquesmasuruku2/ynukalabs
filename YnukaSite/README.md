# Welcome to GOMA HUB WEB3 Project

## Project info

**URL du site quand le domaine sera acheté**: https://gomahub.com

**Project**: GOMA HUB WEB3 - Innovation Center in DR Congo

**Development Team**:
- **Lead Developer**: Jacques MASURUKU
- **Collaboration**: Olivier MWATSIMULAMO
- **Coordination**: Martin MUSAGARA & Boaz BANDU BALUME

## How can I edit this code?

There are several ways of editing your GOMA HUB WEB3 application.

**Work with our development team**

Contact our development team led by Jacques MASURUKU in collaboration with Olivier MWATSIMULAMO, coordinated by Martin MUSAGARA and Boaz BANDU BALUME.

Changes made by our team will be manually committed to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in our development workflow.

## Prerequisites

- **Node.js** (v16+) or **Bun** (recommended)
  - Install Node.js: [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) or [nodejs.org](https://nodejs.org)
  - Install Bun: [bun.sh](https://bun.sh)

## Installation & Setup

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies (choose one)
# Option A: Using Bun (faster, recommended)
bun install

# Option B: Using npm
npm ci

# Step 4: Start the development server
bun run dev    # if using bun
npm run dev    # if using npm

# Step 5: Build for production
bun run build  # if using bun
npm run build  # if using npm
```

## Important Notes

⚠️ **Lock Files**: This project uses both `bun.lockb` and `package-lock.json` to ensure consistent dependency versions across all machines. **Always use `bun install` or `npm ci`** - never `npm install` or `bun add` to avoid changing lock files.

✅ **Switching Machines**: When working on a different computer:
```sh
git clone <repo-url>
cd <project-name>
bun install  # This will use the exact versions from bun.lockb
```

All dependencies will be installed exactly as they were originally - nothing will be lost or changed.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Project Structure

```
ynukalabs/
├── src/                  # Main application (React + TypeScript)
├── public/              # Static assets for main site
├── php/                 # Backend API for main site
├── ynuka-admin/         # Admin panel (TanStack Start + React)
│   ├── src/            # Admin UI components and pages
│   ├── php-api/        # Admin API (separate from main API)
│   └── ADMIN_SETUP.md  # Admin deployment instructions
├── strapi/             # Headless CMS (optional)
├── supabase/          # Database migrations
├── .github/
│   └── workflows/     # GitHub Actions for CI/CD
└── dist/              # Build output (generated)
```

## 🛠️ Admin Panel

The admin panel is located in the `ynuka-admin/` directory and provides a complete management interface for the website.

**Access URL**: `https://admin.ynukalabs.com`

### Quick Start (Development)

```bash
cd ynuka-admin
npm install
npm run dev  # Starts at http://localhost:5173
```

### Features

- Complete CRUD interface for all database tables
- User authentication with JWT tokens
- Dashboard with key metrics
- Responsive design with Radix UI
- Real-time data updates with React Query

For complete setup instructions, see [ynuka-admin/ADMIN_SETUP.md](./ynuka-admin/ADMIN_SETUP.md)

## 📡 API Structure

### Main API (`/php/api.php`)
- Public API for the website frontend
- Handles: blog posts, events, donations, newsletter, etc.
- Accessible at: `https://ynukalabs.com/php/api.php`

### Admin API (`/ynuka-admin/php-api/api.php`)
- Admin-only API with authentication
- CRUD operations on all tables
- JWT-based security
- Deployed to: `https://admin.ynukalabs.com/api.php`

Both APIs share the same MySQL database.

## 🚀 Deployment

### GitHub Actions Workflow

The project uses automated GitHub Actions for deployment:

```yaml
Workflow: .github/workflows/deploy-ssh.yml
Triggers: Every push to main branch

Steps:
1. Build main frontend (Vite)
2. Build admin panel (TanStack Start)
3. Deploy to DirectAdmin via SSH + rsync
```

### Manual Deployment

To trigger deployment manually:
1. Go to GitHub repository → Actions tab
2. Select "Deploy Ynukalabs to InterServer via SSH"
3. Click "Run workflow"

## 📋 What technologies are used for this project?

**Main Frontend:**
- Vite
- TypeScript
- React 18
- shadcn-ui / Radix UI
- Tailwind CSS

**Admin Panel:**
- Vite
- TypeScript
- TanStack Start (React)
- TanStack Router & Query
- Radix UI
- Tailwind CSS

**Backend:**
- PHP 7.4+
- MySQL
- JWT Authentication

**Deployment:**
- DirectAdmin (Shared Hosting)
- GitHub Actions (CI/CD)
- SSH + rsync


