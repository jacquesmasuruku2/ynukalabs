'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

function AdminPreloader({ message }: { message: string }) {
  return (
    <div className="admin-preloader" role="status" aria-live="polite">
      <div className="admin-preloader__mark" aria-hidden="true">
        <span className="admin-preloader__wheel admin-preloader__wheel--blue" />
        <span className="admin-preloader__wheel admin-preloader__wheel--gold" />
        <span className="admin-preloader__wheel admin-preloader__wheel--pink" />
        <span className="admin-preloader__core">
          <img src="/logo.png" alt="" />
        </span>
      </div>
      <p className="admin-preloader__brand">Ynuka Labs</p>
      <p className="admin-preloader__message">{message}</p>
      <span className="admin-preloader__line" aria-hidden="true"><span /></span>
    </div>
  );
}

export function ProtectedRoute({
  children,
  requirePremium = false,
}: {
  children: React.ReactNode;
  requirePremium?: boolean;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const hasPremiumAccess = !!user && (user.isSuperAdmin || (user.isPremium && (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date())));

  useEffect(() => {
    console.log('[ProtectedRoute] Check auth:', { isAuthenticated, isLoading, pathname, requirePremium, hasPremiumAccess });
    if (!isLoading && !isAuthenticated) {
      const existingRedirect = localStorage.getItem('redirect-after-login');
      if (!existingRedirect || existingRedirect === '/login' || existingRedirect === '/') {
        localStorage.setItem('redirect-after-login', pathname);
        console.log('[ProtectedRoute] Saving redirect URL:', pathname);
      }
      console.log('[ProtectedRoute] Redirecting to login');
      router.push('/login');
      return;
    }

    if (!isLoading && requirePremium && !user) {
      router.push('/login');
      return;
    }

    if (!isLoading && requirePremium && !hasPremiumAccess) {
      router.push('/settings?premium=required');
    }
  }, [isAuthenticated, isLoading, router, pathname, requirePremium, user, hasPremiumAccess]);

  if (isLoading) {
    return <AdminPreloader message="Chargement de votre espace..." />;
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, showing redirect screen');
    return <AdminPreloader message="Redirection vers la page de connexion..." />;
  }

  if (requirePremium && !hasPremiumAccess) {
    return <AdminPreloader message="Accès Premium requis..." />;
  }

  console.log('[ProtectedRoute] Authenticated, rendering children');
  return <>{children}</>;
}
