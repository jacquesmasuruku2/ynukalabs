/**
 * Google Authentication Service for Public Site
 */

const STORAGE_KEY = "ynuka_auth_user";
export const AUTH_CHANGE_EVENT = "ynuka-auth-change";

export interface AuthUser {
  email: string;
  name: string;
  avatar?: string;
}

class AuthService {
  private user: AuthUser | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          this.user = JSON.parse(stored);
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }

  private persistUser(user: AuthUser): void {
    this.user = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  getUser(): AuthUser | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }

  signIn(user: AuthUser): void {
    this.persistUser(user);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }

  signOut(): void {
    this.user = null;
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export const authService = new AuthService();
