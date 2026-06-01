/**
 * PHP API Authentication Service
 */

import { fetchWithFallback } from "./php-fetch";
import { clearOAuthHashFromUrl, parseOAuthHash } from "./oauth-hash";

const STORAGE_KEY = "php_auth_token";

export interface AuthUser {
  id: string | number;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(padded)) as {
      sub?: string | number;
      id?: string | number;
      email?: string;
      name?: string;
      avatar_url?: string;
    };
    const id = json.sub ?? json.id;
    if (id == null || !json.email) return null;
    return {
      id,
      email: json.email,
      name: json.name ?? json.email,
      avatar_url: json.avatar_url,
    };
  } catch {
    return null;
  }
}

function normalizeUser(raw: Record<string, unknown>): AuthUser {
  return {
    id: (raw.id ?? raw.sub) as string | number,
    email: String(raw.email ?? ""),
    name: String(raw.name ?? raw.email ?? ""),
    avatar_url: raw.avatar_url ? String(raw.avatar_url) : undefined,
  };
}

class PhpAuthService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem(STORAGE_KEY);
    }
  }

  private persistToken(token: string): void {
    this.token = token;
    localStorage.setItem(STORAGE_KEY, token);
  }

  async signInWithPassword(email: string, password: string): Promise<AuthSession> {
    const response = await fetchWithFallback(`?action=login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    this.persistToken(data.token);
    return { token: data.token, user: data.user };
  }

  async signUp(email: string, password: string, name: string): Promise<AuthSession> {
    const response = await fetchWithFallback(`?action=register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();
    this.persistToken(data.token);
    return { token: data.token, user: data.user };
  }

  async getSession(): Promise<{ session: AuthSession | null }> {
    if (!this.token) {
      return { session: null };
    }

    try {
      const response = await fetchWithFallback(`?action=me`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      const data = await response.json();
      return {
        session: {
          token: this.token,
          user: normalizeUser(data.user ?? {}),
        },
      };
    } catch {
      const fromJwt = decodeJwtPayload(this.token);
      if (fromJwt) {
        return { session: { token: this.token, user: fromJwt } };
      }
      return { session: null };
    }
  }

  async signOut(): Promise<void> {
    this.token = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  getAuthHeader(): Record<string, string> {
    if (!this.token) return {};
    return { Authorization: `Bearer ${this.token}` };
  }

  getToken(): string | null {
    return this.token;
  }

  /** @deprecated Préférer parseOAuthHash(location.hash) dans le loader /login */
  consumeOAuthHash(): { token?: string; error?: string } {
    if (typeof window === "undefined") return {};
    const parsed = parseOAuthHash(window.location.hash);
    if (parsed.token || parsed.error) {
      clearOAuthHashFromUrl();
    }
    return parsed;
  }

  /**
   * Traite le hash OAuth (appelé au chargement de /login).
   * Retourne une erreur à afficher, ou redirige via redirectTo si succès.
   */
  async handleOAuthCallbackFromHash(
    hash: string,
  ): Promise<{ oauthError?: string; redirectTo?: "/admin" }> {
    const { token, error } = parseOAuthHash(hash);
    if (error) {
      clearOAuthHashFromUrl();
      return { oauthError: error };
    }
    if (!token) {
      return {};
    }

    clearOAuthHashFromUrl();
    try {
      await this.applyTokenFromOAuth(token);
      return { redirectTo: "/admin" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "invalid_token";
      return {
        oauthError: msg.includes("Invalid") ? "invalid_token" : msg,
      };
    }
  }

  async applyTokenFromOAuth(token: string): Promise<AuthSession> {
    this.persistToken(token);

    const { session } = await this.getSession();
    if (session) {
      return session;
    }

    const fromJwt = decodeJwtPayload(token);
    if (fromJwt) {
      return { token, user: fromJwt };
    }

    this.token = null;
    localStorage.removeItem(STORAGE_KEY);
    throw new Error("Invalid token");
  }

  async startGoogleSignIn(): Promise<void> {
    const response = await fetchWithFallback("?action=google_auth_url", {
      credentials: "include",
    });
    const data = (await response.json()) as { url?: string };
    if (!data.url) {
      throw new Error("Google OAuth not configured on the server");
    }
    window.location.assign(data.url);
  }

  /**
   * Sign in with Google ID token (for Google Sign-In Library integration)
   * Call this after receiving an ID token from Google Sign-In
   */
  async signInWithGoogleToken(idToken: string): Promise<AuthSession> {
    const response = await fetchWithFallback(`?action=google_oauth_verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Google authentication failed");
    }

    const data = await response.json();
    this.persistToken(data.token);
    return { token: data.token, user: data.user };
  }
}

export const phpAuth = new PhpAuthService();
