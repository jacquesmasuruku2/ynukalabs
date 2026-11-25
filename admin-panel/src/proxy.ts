import { NextRequest, NextResponse } from 'next/server';
import { isAllowedOrigin } from '@/lib/allowed-origins';
import { hitRateLimit } from '@/lib/rate-limit';

/**
 * Proxy Next.js (ex-middleware) appliqué à /api/* :
 *  1. CORS limitée aux origines autorisées (plus de `*`).
 *  2. Anti-CSRF : une requête POST/PUT/PATCH/DELETE venant d'un autre site est refusée.
 *  3. Limitation de débit par IP (brute-force sur la connexion, spam des formulaires).
 */

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// [préfixe de chemin, nombre max, fenêtre en ms]
const RULES: Array<[string, number, number]> = [
  ['/api/admin/login', 10, 15 * 60_000],
  ['/api/admin/forgot-password', 5, 15 * 60_000],
  ['/api/admin/reset-password', 10, 15 * 60_000],
  ['/api/admin/accept-invite', 10, 15 * 60_000],
  ['/api/contact', 10, 10 * 60_000],
  ['/api/newsletter', 10, 10 * 60_000],
  ['/api/partnerships', 10, 10 * 60_000],
  ['/api/opportunity-applications', 10, 10 * 60_000],
  ['/api/event-registrations', 20, 10 * 60_000],
  ['/api/event-proposals', 10, 10 * 60_000],
  ['/api/speaker-applications', 10, 10 * 60_000],
  ['/api/blog-comments', 15, 10 * 60_000],
  ['/api/event-conversations', 60, 10 * 60_000],
  ['/api/presence', 240, 60_000],
  ['/api/articles/', 120, 60_000],
];
const DEFAULT_RULE: [number, number] = [300, 60_000];

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function applyCors(response: NextResponse, origin: string | null) {
  if (origin && isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }
  response.headers.append('Vary', 'Origin');
  return response;
}

function isSameOrigin(request: NextRequest, origin: string): boolean {
  try {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    return !!host && new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get('origin');
  const method = request.method.toUpperCase();
  const path = request.nextUrl.pathname;

  if (method === 'OPTIONS') {
    return applyCors(new NextResponse(null, { status: 204 }), origin);
  }

  if (MUTATING.has(method)) {
    // Anti-CSRF : un navigateur envoie toujours l'en-tête Origin sur ces méthodes.
    if (origin && !isSameOrigin(request, origin) && !isAllowedOrigin(origin)) {
      return applyCors(NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 }), origin);
    }

    const rule = RULES.find(([prefix]) => path.startsWith(prefix));
    const [limit, windowMs] = rule ? [rule[1], rule[2]] : DEFAULT_RULE;
    const key = `${rule ? rule[0] : 'default'}|${clientIp(request)}`;
    const { limited, retryAfter } = hitRateLimit(key, limit, windowMs);
    if (limited) {
      const res = NextResponse.json({ error: 'Trop de requêtes. Réessayez plus tard.' }, { status: 429 });
      res.headers.set('Retry-After', String(retryAfter));
      return applyCors(res, origin);
    }
  }

  return applyCors(NextResponse.next(), origin);
}

export const config = {
  matcher: '/api/:path*',
};
