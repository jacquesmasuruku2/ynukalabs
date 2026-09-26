import { chmodSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.resolve(scriptDirectory, '../../.env');
const targetPath = path.resolve(scriptDirectory, '../.env.production.local');

const panelEnvironmentKeys = new Set([
  'ADMIN_PANEL_URL',
  'ADMIN_SUPER_EMAIL',
  'ATLOS_API_SECRET',
  'ATLOS_API_URL',
  'ATLOS_MERCHANT_ID',
  'CLOUDINARY_URL',
  'DATABASE_URL',
  'EMAIL_FROM',
  'LUMA_CALENDAR_ID',
  'NEXT_PUBLIC_ADMIN_API_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_ATLOS_MERCHANT_ID',
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_MAIN_SITE_URL',
  'NEXT_PUBLIC_STRIPE_CHECKOUT_URL',
  'NOWPAYMENTS_API_BASE_URL',
  'NOWPAYMENTS_API_KEY',
  'NOWPAYMENTS_API_URL',
  'NOWPAYMENTS_IPN_SECRET',
  'PUBLIC_SITE_URL',
  'SMTP_HOST',
  'SMTP_PASS',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'STRIPE_CHECKOUT_URL',
  'SUPER_ADMIN_EMAILS',
  'ATLOS_API_SECRET',
]);

function getEnvironmentKey(line) {
  return line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/)?.[1] || null;
}

if (!existsSync(sourcePath)) {
  console.warn('Root .env not found; leaving production environment file unchanged.');
  process.exit(0);
}

const sourceEntries = new Map();
for (const line of readFileSync(sourcePath, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/)) {
  const key = getEnvironmentKey(line);
  if (key && panelEnvironmentKeys.has(key) && !sourceEntries.has(key)) {
    sourceEntries.set(key, line);
  }
}

if (process.argv.includes('--dry-run')) {
  console.log(`Would sync ${sourceEntries.size} admin-panel variables.`);
  process.exit(0);
}

const existingLines = existsSync(targetPath)
  ? readFileSync(targetPath, 'utf8').split(/\r?\n/)
  : [];
const mergedLines = existingLines.filter((line) => {
  const key = getEnvironmentKey(line);
  return !key || !sourceEntries.has(key);
});
mergedLines.push(...sourceEntries.values());

writeFileSync(targetPath, `${mergedLines.filter((line, index) => line || index < mergedLines.length - 1).join('\n')}\n`, { mode: 0o600 });
chmodSync(targetPath, 0o600);
console.log(`Synchronized ${sourceEntries.size} admin-panel variables to .env.production.local.`);