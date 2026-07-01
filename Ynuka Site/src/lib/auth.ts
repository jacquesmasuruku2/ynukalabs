/**
 * Google Authentication Service for Public Site
 */

const STORAGE_KEY = "ynuka_auth_user";

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
  }

  signOut(): void {
    this.user = null;
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const authService = new AuthService();
