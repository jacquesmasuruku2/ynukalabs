// API client wrapper using MySQL/PHP backend
// Replaces the old Supabase/Lovable client

import { phpApi } from "./php-api";
import { phpAuth } from "./php-auth";
import { fetchWithFallback } from "./php-fetch";

export const RESOURCES = [
  "users",
  "user_roles",
  "blog_posts",
  "blog_comments",
  "contact_messages",
  "donations",
  "events",
  "event_registrations",
  "gallery_blocks",
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
  gallery_blocks: "Galerie",
  gallery_images: "Images galerie",
  newsletter_subscribers: "Newsletter",
  projects: "Projets",
  resource_items: "Ressources",
  team_members: "Équipe",
};

// Hardcoded columns so the ResourceTable can render even when a table is empty.
const RESOURCE_COLUMNS: Record<Resource, string[]> = {
  users: ["id", "email", "name", "avatar_url", "created_at"],
  user_roles: ["id", "user_id", "role", "created_at"],
  blog_posts: ["id", "title", "slug", "excerpt", "published", "author_id", "created_at"],
  blog_comments: ["id", "post_id", "author_name", "author_email", "approved", "created_at"],
  contact_messages: ["id", "name", "email", "subject", "handled", "created_at"],
  donations: ["id", "donor_name", "donor_email", "amount", "currency", "status", "created_at"],
  events: ["id", "title", "title_fr", "description", "description_fr", "date", "location", "type", "image_url", "upcoming", "created_at", "updated_at"],
  event_registrations: ["id", "event_id", "name", "email", "phone", "created_at"],
  gallery_blocks: ["id", "title", "subtitle", "description", "drive_url", "position", "created_at"],
  gallery_images: ["id", "block_id", "event_id", "image_url", "alt", "position", "created_at"],
  newsletter_subscribers: ["id", "email", "name", "subscribed", "created_at"],
  projects: ["id", "title", "status", "published", "image_url", "created_at"],
  resource_items: ["id", "section_id", "title", "title_fr", "description", "description_fr", "url", "created_at", "updated_at"],
  team_members: ["id", "name", "role", "email", "sort_order", "created_at"],
};

// Auth functions
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

export function setToken(t: string | null) {
  if (t === null) {
    phpAuth.signOut().catch(() => {});
  }
}

export function getApiUrl(): string {
  return import.meta.env.VITE_API_URL || "https://admin.ynukalabs.com/api/api.php";
}

export function setApiUrl(_url: string) {
  /* No-op: handled by environment variables */
}

// Returns {url} suitable for canvas/discoverApiUrl tests
export async function discoverApiUrl(): Promise<{ url: string }> {
  return { url: getApiUrl() };
}

// Sanitize form values before sending to the DB.
function clean(data: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === "" || v === undefined) continue;
    out[k] = v;
  }
  return out;
}

async function listResource(resource: Resource, page = 1, limit = 25, search = "") {
  try {
    const res = await phpApi.list(resource, { 
      limit, 
      search: search ? `%${search}%` : undefined
    });
    const rows = (res.rows ?? []) as any[];
    const columns = rows[0] ? Object.keys(rows[0]) : RESOURCE_COLUMNS[resource];
    return { rows, total: res.total ?? rows.length, columns };
  } catch (e: any) {
    throw new Error(e.message || "Failed to list resources");
  }
}

export const api = {
  ping: async () => ({ ok: true }),

  // Auth helpers - redirect to phpAuth
  login: async (email: string, password: string) => {
    try {
      const result = await phpAuth.signInWithPassword(email, password);
      return { 
        token: result.token ?? "", 
        user: { 
          id: result.user.id, 
          email: result.user.email, 
          user_metadata: { full_name: result.user.name }
        }
      };
    } catch (e: any) {
      throw new Error(e.message || "Login failed");
    }
  },

  signup: async (email: string, password: string, name?: string) => {
    // Not implemented for now - use admin panel to create users
    throw new Error("Signup not available - contact administrator");
  },

  me: async () => {
    try {
      const { session } = await phpAuth.getSession();
      if (!session?.user) {
        return { user: null };
      }
      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name || session.user.email,
          avatar_url: session.user.avatar_url || null,
        },
      };
    } catch {
      return { user: null };
    }
  },

  list: (resource: Resource, page = 1, limit = 25, search = "") =>
    listResource(resource, page, limit, search),

  get: async (resource: Resource, id: string | number) => {
    try {
      const row = await phpApi.get(resource, id as string);
      return { 
        row, 
        columns: row ? Object.keys(row) : RESOURCE_COLUMNS[resource] 
      };
    } catch (e: any) {
      throw new Error(e.message || "Failed to get resource");
    }
  },

  create: async (resource: Resource, data: Record<string, any>) => {
    try {
      const id = await phpApi.create(resource, clean(data));
      return { id };
    } catch (e: any) {
      throw new Error(e.message || "Failed to create resource");
    }
  },

  update: async (resource: Resource, id: string | number, data: Record<string, any>) => {
    try {
      await phpApi.update(resource, id as string, clean(data));
      return { ok: true as const };
    } catch (e: any) {
      throw new Error(e.message || "Failed to update resource");
    }
  },

  remove: async (resource: Resource, id: string | number) => {
    try {
      await phpApi.delete(resource, id as string);
      return { ok: true as const };
    } catch (e: any) {
      throw new Error(e.message || "Failed to delete resource");
    }
  },

  googleAuthUrl: async () => {
    const response = await fetchWithFallback("?action=google_auth_url");
    return response.json() as Promise<{ url: string; state?: string }>;
  },

  uploadImage: async (file: File): Promise<{ url: string; filename: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetchWithFallback('?action=upload_image', {
        method: 'POST',
        headers: phpAuth.getAuthHeader(),
        body: formData,
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      return { 
        url: result.url || `/uploads/${result.filename}`, 
        filename: result.filename 
      };
    } catch (e: any) {
      throw new Error(e.message || 'Image upload failed');
    }
  },
};
