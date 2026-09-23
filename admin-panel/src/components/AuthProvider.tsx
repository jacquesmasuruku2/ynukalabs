'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  provider?: string;
  role?: string;
  isSuperAdmin?: boolean;
  lastLoginAt?: string | null;
}

export interface AdminSessionInfo {
  createdAt: string;
  expiresAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  session: AdminSessionInfo | null;
  login: (email: string, password: string, provider?: 'email' | 'google') => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<AdminSessionInfo | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/me', { credentials: 'include' });
      if (!response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        setSession(null);
        return;
      }
      const data = await response.json();
      setIsAuthenticated(!!data.authenticated);
      setUser(data.user || null);
      setSession(data.session || null);
    } catch (error) {
      console.error('Failed to check admin session:', error);
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [refreshUser]);

  const login = async (email: string, password: string, provider: 'email' | 'google' = 'email'): Promise<boolean> => {
    try {
      const coordinates = provider === 'email' && typeof navigator !== 'undefined' && navigator.geolocation
        ? await new Promise<{ latitude: number; longitude: number } | undefined>((resolve) => {
            const timer = window.setTimeout(() => resolve(undefined), 1500);
            navigator.geolocation.getCurrentPosition(
              (position) => { window.clearTimeout(timer); resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }); },
              () => { window.clearTimeout(timer); resolve(undefined); },
              { enableHighAccuracy: true, timeout: 1200, maximumAge: 300000 },
            );
          })
        : undefined;
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, provider, coordinates }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Admin login failed:', data.error || 'Unknown error');
        return false;
      }

      setIsAuthenticated(true);
      if (data.user) {
        setUser(data.user);
      } else {
        await refreshUser();
      }
      return true;
    } catch (error) {
      console.error('Failed to login admin:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      localStorage.removeItem('redirect-after-login');
    } catch (error) {
      console.error('Failed to logout admin:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, session, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
