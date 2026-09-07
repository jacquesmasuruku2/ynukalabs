'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('[ProtectedRoute] Check auth:', { isAuthenticated, isLoading, pathname });
    if (!isLoading && !isAuthenticated) {
      // Sauvegarder l'URL actuelle pour rediriger après connexion
      // Ne pas écraser si une URL de redirection existe déjà
      const existingRedirect = localStorage.getItem('redirect-after-login');
      if (!existingRedirect || existingRedirect === '/login' || existingRedirect === '/') {
        localStorage.setItem('redirect-after-login', pathname);
        console.log('[ProtectedRoute] Saving redirect URL:', pathname);
      }
      console.log('[ProtectedRoute] Redirecting to login');
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, showing redirect screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  console.log('[ProtectedRoute] Authenticated, rendering children');
  return <>{children}</>;
}
