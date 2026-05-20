// API client for the PHP backend hosted on Interserver.
// Configure the base URL via localStorage key "ynuka_api_url" or VITE_API_URL.

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
  "https://your-domain.com/api.php";

export function getApiUrl(): string {
  if (typeof window === "undefined") return DEFAULT_URL;
  return localStorage.getItem("ynuka_api_url") || DEFAULT_URL;
}
export function setApiUrl(url: string) {
  localStorage.setItem("ynuka_api_url", url);
}
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ynuka_token");
}
export function setToken(t: string | null) {
  if (t) localStorage.setItem("ynuka_token", t);
  else localStorage.removeItem("ynuka_token");
}

async function request<T>(params: Record<string, string>, body?: unknown): Promise<T> {
  const url = new URL(getApiUrl());
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const token = getToken();
  const res = await fetch(url.toString(), {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>({ action: "login" }, { email, password }),
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
