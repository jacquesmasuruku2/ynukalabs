// API client for the PHP backend hosted on Interserver.
// Configure the base URL via localStorage key "ynuka_api_url" or VITE_API_URL.

import { API_CANDIDATES, discoverApiUrl, probeApiUrl } from "@/lib/api-endpoints";

export { API_CANDIDATES, discoverApiUrl, probeApiUrl };

export const RESOURCES = [
  "users",
  "user_roles",
  "blog_posts",
  "blog_comments",
  "contact_messages",
  "donations",
  "events",
  "event_registrations",
  "gallery_images",
  "newsletter_subscribers",
  "projects",
  "resource_items",
  "team_members",
] as const;

export type Resource = (typeof RESOURCES)[number];

export const RESOURCE_LABELS: Record<Resource, string> = {
  users: "Utilisateurs",
  user_roles: "Rôles",
  blog_posts: "Articles",
  blog_comments: "Commentaires",
  contact_messages: "Messages contact",
  donations: "Dons",
  events: "Événements",
  event_registrations: "Inscriptions",
  gallery_images: "Galerie",
  newsletter_subscribers: "Newsletter",
  projects: "Projets",
  resource_items: "Ressources",
  team_members: "Équipe",
};

const DEFAULT_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  "https://admin.ynukalabs.com/api/api.php";

function normalizeApiBase(url: string): string {
  if (!url) throw new Error("URL de l'API invalide.");
  return new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost").toString();
}

function resolveApiBase(): string {
  const stored =
    typeof window !== "undefined" ? localStorage.getItem("ynuka_api_url")?.trim() : "";
  if (stored) {
    try {
      return normalizeApiBase(stored);
    } catch {
      return DEFAULT_URL;
    }
  }

  if (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) {
    try {
      return normalizeApiBase(((import.meta as any).env.VITE_API_URL as string).trim());
    } catch {
      return DEFAULT_URL;
    }
  }

  return DEFAULT_URL;
}

export function getApiUrl(): string {
  return resolveApiBase();
}

export function setApiUrl(url: string) {
  const trimmed = url.trim();
  if (trimmed) {
    try {
      normalizeApiBase(trimmed);
      localStorage.setItem("ynuka_api_url", trimmed);
      return;
    } catch {
      throw new Error("URL de l'API invalide.");
    }
  }
  localStorage.removeItem("ynuka_api_url");
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ynuka_token");
}

export function setToken(t: string | null) {
  if (t) localStorage.setItem("ynuka_token", t);
  else localStorage.removeItem("ynuka_token");
}

function parseApiError(text: string, status: number): string {
  const trimmed = text.trim();
  if (!trimmed) return `Erreur HTTP ${status}`;
  try {
    const data = JSON.parse(trimmed) as { error?: string; message?: string };
    if (data.error) return data.error;
    if (data.message) return data.message;
  } catch {
    /* réponse non-JSON (souvent page HTML 404 du panel) */
  }
  if (trimmed.startsWith("<!") || trimmed.startsWith("<html")) {
    return `L'URL API ne renvoie pas du JSON (fichier api.php manquant ou mauvaise URL ?). HTTP ${status}`;
  }
  if (trimmed.length > 200) return `Erreur HTTP ${status}`;
  return trimmed;
}

function buildUrl(params: Record<string, string>): string {
  const url = new URL(resolveApiBase());
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

async function request<T>(params: Record<string, string>, body?: unknown): Promise<T> {
  const apiBase = resolveApiBase();
  let url: string;
  try {
    url = buildUrl(params);
  } catch {
    throw new Error("URL de l'API invalide. Vérifiez la configuration.");
  }

  const token = getToken();
  let res: Response;
  try {
    res = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new Error(
      `Impossible de joindre l'API (${apiBase}). Vérifiez que api.php est en ligne, l'URL dans Paramètres, et CORS. Testez : ${apiBase}?action=ping`,
    );
  }

  const text = await res.text();
  if (!res.ok) {
    throw new Error(parseApiError(text, res.status));
  }

  if (!text.trim()) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Réponse API invalide (JSON attendu) pour ${apiBase}. Ouvrez ?action=ping dans le navigateur.`,
    );
  }
}

export const api = {
  ping: () => request<any>({ action: "ping" }),
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>({ action: "login" }, { email, password }),
  googleAuthUrl: () => request<{ url: string; state?: string }>({ action: "google_auth_url" }),
  me: () => request<{ user: any }>({ action: "me" }),
  list: (resource: Resource, page = 1, limit = 25, search = "") =>
    request<{ rows: any[]; total: number; columns: string[] }>({
      action: "list",
      resource,
      page: String(page),
      limit: String(limit),
      search,
    }),
  get: (resource: Resource, id: string | number) =>
    request<{ row: any; columns: string[] }>({ action: "get", resource, id: String(id) }),
  create: (resource: Resource, data: Record<string, any>) =>
    request<{ id: any }>({ action: "create", resource }, data),
  update: (resource: Resource, id: string | number, data: Record<string, any>) =>
    request<{ ok: true }>({ action: "update", resource, id: String(id) }, data),
  remove: (resource: Resource, id: string | number) =>
    request<{ ok: true }>({ action: "delete", resource, id: String(id) }, {}),
};
