import crypto from 'crypto';

/**
 * Jetons de session admin.
 * - Le jeton envoyé au navigateur est 32 octets aléatoires (cryptographiquement sûrs).
 * - Seul son hash SHA-256 est stocké en base : une fuite de la table AdminSession
 *   ne permet pas de se connecter.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function createSessionToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, tokenHash: hashSessionToken(token) };
}
