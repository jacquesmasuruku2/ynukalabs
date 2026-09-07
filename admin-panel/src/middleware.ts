import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // L'admin-panel n'utilise pas de middleware
  // Toutes les routes sont gérées par les composants React
  return NextResponse.next()
}

export const config = {
  // Matcher vide pour désactiver le middleware
  matcher: [],
}
