/**
 * PHP API Authentication Service
 * Replaces Supabase auth with direct MySQL + JWT-based PHP API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/api.php';

function apiCandidates(base: string): string[] {
  const seen = new Set<string>();
  const add = (u: string) => seen.add(u) && u;
  const norm = (s: string) => s.replace(/\/+$/, '');
  const b = norm(base);
  add(b);
  if (b.endsWith('/api.php')) {
    add(b.replace(/\/api.php$/, '/api/api.php'));
    add(b.replace(/\/api.php$/, '/api/api..php')); // deliberate double-dot variant
  } else if (b.endsWith('/api/api.php')) {
    add(b.replace(/\/api\/api.php$/, '/api.php'));
    add(b.replace(/\/api\/api.php$/, '/api/api..php'));
  } else {
    add(b + '/api.php');
    add(b + '/api/api.php');
    add(b + '/api/api..php');
  }
  return Array.from(seen);
}

async function fetchWithFallback(path: string, init?: RequestInit) {
  const candidates = apiCandidates(API_BASE_URL);
  let lastError: any = null;
  let lastResp: Response | null = null;
  for (const cand of candidates) {
    try {
      const url = cand + (path.startsWith('?') ? path : path.startsWith('/') ? path : path);
      const resp = await fetch(url, init);
      lastResp = resp;
      if (resp.ok) return resp;
      // record error but try next candidate
      lastError = resp;
    } catch (e) {
      lastError = e;
    }
  }
  if (lastResp) {
    try {
      const json = await lastResp.json();
      throw new Error(json.error || JSON.stringify(json));
    } catch (e) {
      throw new Error('Request failed to all API endpoints');
    }
  }
  throw lastError || new Error('Request failed to all API endpoints');
}

export interface AuthUser {
  id: string | number;
  email: string;
  name: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

class PhpAuthService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on init
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('php_auth_token');
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithPassword(email: string, password: string): Promise<AuthSession> {
    const response = await fetchWithFallback(`?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    this.token = data.token;
    localStorage.setItem('php_auth_token', data.token);
    return {
      token: data.token,
      user: data.user,
    };
  }

  /**
   * Sign up with email, password, and name
   */
  async signUp(email: string, password: string, name: string): Promise<AuthSession> {
    // PHP API doesn't have a signup endpoint - it requires manual creation
    // For now, throw an error directing the user to contact admin
    throw new Error(
      'L\'inscription directe n\'est pas activée. Veuillez contacter un administrateur.'
    );
  }

  /**
   * Get current session
   */
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
          user: data.user,
        },
      };
    } catch {
      return { session: null };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    this.token = null;
    localStorage.removeItem('php_auth_token');
  }

  /**
   * Get authorization header
   */
  getAuthHeader(): Record<string, string> {
    if (!this.token) return {};
    return { Authorization: `Bearer ${this.token}` };
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }
}

export const phpAuth = new PhpAuthService();
