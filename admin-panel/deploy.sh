#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> [0/5] Cleaning stale build cache"
node scripts/clean-build.mjs

echo "==> [1/5] Installing Linux dependencies"
npm install --no-fund --no-audit

echo "==> [2/5] Generating Prisma client"
npx prisma generate

echo "==> [3/5] Building Next.js project"
npm run build

echo "==> [4/5] Creating Passenger-compatible server.js"
cat > server.js <<'EOF'
const http = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const port = Number(process.env.PORT || 3000);

const app = next({
  dev,
  hostname: '0.0.0.0',
  port,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  http
    .createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    })
    .listen(port, () => {
      console.log(`> Ready on port ${port}`);
    });
}).catch((err) => {
  console.error('Failed to start Next.js server', err);
  process.exit(1);
});
EOF

echo "==> [5/5] Creating temp restart trigger"
mkdir -p tmp
printf '%s\n' "Deployment refresh: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" > tmp/restart.txt

echo "Deployment complete. Passenger restart can be triggered by touching tmp/restart.txt."
