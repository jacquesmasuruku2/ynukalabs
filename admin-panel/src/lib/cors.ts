import { NextResponse } from 'next/server';

/**
 * Les en-têtes CORS sont désormais posés par src/proxy.ts, uniquement pour les
 * origines autorisées (lib/allowed-origins.ts). Avant, toutes les réponses
 * renvoyaient `Access-Control-Allow-Origin: *`.
 * Ces fonctions sont conservées pour ne pas modifier toutes les routes.
 */
export function withCors(response: NextResponse) {
  return response;
}

export function corsOptions() {
  return new NextResponse(null, { status: 204 });
}

export function jsonCors(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}
