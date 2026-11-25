/**
 * Origines autorisées à appeler l'API admin depuis un navigateur (CORS + anti-CSRF).
 * Surchargeable avec ALLOWED_ORIGINS="https://a.com,https://b.com".
 */
const DEFAULT_ORIGINS = [
  'https://ynukalabs.com',
  'https://www.ynukalabs.com',
  'https://admin.ynukalabs.com',
];

const DEV_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
];

export function getAllowedOrigins(): string[] {
  const fromEnv = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const base = fromEnv.length ? fromEnv : DEFAULT_ORIGINS;
  return process.env.NODE_ENV === 'production' ? base : [...base, ...DEV_ORIGINS];
}

export function isAllowedOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;
  return getAllowedOrigins().includes(origin.replace(/\/$/, ''));
}
