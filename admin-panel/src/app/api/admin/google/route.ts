import { NextResponse } from 'next/server';

/**
 * Connexion Google admin désactivée.
 *
 * L'ancienne version acceptait { email, googleId } sans vérifier de jeton Google :
 * n'importe qui pouvait créer un compte admin ou prendre le contrôle d'un compte existant.
 *
 * Pour la réactiver, il faut vérifier côté serveur un `id_token` Google
 * (google-auth-library : OAuth2Client.verifyIdToken avec audience = GOOGLE_CLIENT_ID),
 * n'accepter que les comptes AdminUser déjà existants, puis créer la session
 * avec createSessionToken() (voir lib/session-token.ts).
 */
export async function POST() {
  return NextResponse.json({ error: 'Connexion Google désactivée' }, { status: 410 });
}
