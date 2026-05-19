import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { strapiFetch, clearJwtFromStorage, getJwtFromStorage, setJwtToStorage } from "@/lib/strapi";

type StrapiUser = {
  id: number | string;
  email?: string;
  username?: string;
  role?: { id?: number | string; name?: string };
  roles?: Array<{ id?: number | string; name?: string }>;
};

type AuthContextType = {
  user: StrapiUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getRoleName = (user: StrapiUser | null) => {
  const direct = user?.role?.name;
  if (direct) return direct;
  const fromRoles = user?.roles?.[0]?.name;
  return fromRoles;
};

export const StrapiAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<StrapiUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const adminRoleName = useMemo(() => {
    return import.meta.env.VITE_STRAPI_ADMIN_ROLE || "Administrator";
  }, []);

  const refreshMe = async () => {
    const token = getJwtFromStorage();
    if (!token) {
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const res = await strapiFetch<unknown>("/api/users/me", { token });

      // Selon configuration Strapi, on peut avoir:
      // - un objet user en root (res)
      // - ou un wrapper type { data: ... } / { user: ... }
      const wrapped = res as { user?: StrapiUser; data?: StrapiUser };
      const me: StrapiUser =
        wrapped.user ?? wrapped.data ?? (res as unknown as StrapiUser);
      setUser(me);

      const roleName = (getRoleName(me) || "").toLowerCase();
      const adminRole = (adminRoleName || "").toLowerCase();
      setIsAdmin(roleName === adminRole || roleName.includes("admin"));
    } catch {
      clearJwtFromStorage();
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const tokenRes = await strapiFetch<{ jwt: string }>("/api/auth/local", {
        method: "POST",
        body: JSON.stringify({
          identifier: email,
          password,
        }),
      });

      setJwtToStorage(tokenRes.jwt);

      // Re-load user to compute admin flag.
      await refreshMe();
      return { error: null };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Login failed";
      return { error: msg };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    clearJwtFromStorage();
    setUser(null);
    setIsAdmin(false);
  };

  const value: AuthContextType = { user, isAdmin, loading, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useStrapiAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useStrapiAuth must be used within StrapiAuthProvider");
  return ctx;
};

