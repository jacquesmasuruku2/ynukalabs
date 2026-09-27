#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/ynukalabs/frontend/Ynuka Site}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
PM2_APP_NAME="${PM2_APP_NAME:-ynuka-frontend}"
APP_PORT="${APP_PORT:-3004}"
LOCK_FILE="${LOCK_FILE:-/tmp/ynuka-frontend-deploy.lock}"

for command in git npm pm2 serve flock; do
  if ! command -v "$command" >/dev/null 2>&1; then
    printf 'Required command not found: %s\n' "$command" >&2
    exit 1
  fi
done

if ! git -C "$APP_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  printf 'Not a Git working tree: %s\n' "$APP_DIR" >&2
  exit 1
fi

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  printf 'Another deployment is already running.\n' >&2
  exit 1
fi

cd "$APP_DIR"

CURRENT_BRANCH="$(git branch --show-current)"
if [[ "$CURRENT_BRANCH" != "$DEPLOY_BRANCH" ]]; then
  printf 'Expected branch %s, found %s.\n' "$DEPLOY_BRANCH" "$CURRENT_BRANCH" >&2
  exit 1
fi

if [[ -n "$(git status --porcelain --untracked-files=all -- .)" ]]; then
  printf 'Working tree is not clean; refusing to deploy over local changes.\n' >&2
  exit 1
fi

printf 'Pulling latest %s...\n' "$DEPLOY_BRANCH"
git pull --ff-only origin "$DEPLOY_BRANCH"

printf 'Installing dependencies and building...\n'
npm ci --no-audit --no-fund
npm run build

SERVE_BIN="$(command -v serve)"
if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME" --update-env
else
  pm2 start "$SERVE_BIN" \
    --name "$PM2_APP_NAME" \
    --cwd "$APP_DIR" \
    -- -s "$APP_DIR/dist" -l "127.0.0.1:$APP_PORT"
fi

pm2 save
printf 'Deployment complete: %s on 127.0.0.1:%s\n' "$PM2_APP_NAME" "$APP_PORT"