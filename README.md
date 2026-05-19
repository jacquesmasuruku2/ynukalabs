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

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

Read more about our services: [GOMA HUB WEB3 Domain Services](https://gomahub.com/services/custom-domain)
