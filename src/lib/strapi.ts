const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";

type StrapiAuthOptions = {
  token?: string | null;
};

function normalizePath(path: string) {
  if (path.startsWith("/")) return `${STRAPI_URL}${path}`;
  return `${STRAPI_URL}/${path}`;
}

export async function strapiFetch<T = unknown>(
  path: string,
  options: RequestInit & StrapiAuthOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  // If the path targets the local /api/* endpoints, proxy to the PHP API instead
  const isLocalApi = path.startsWith("/api/");

  if (isLocalApi && typeof window !== "undefined") {
    // Map Strapi-like REST path to PHP API actions
    // Example: POST /api/newsletter-subscribers -> api.php?action=insert table=newsletter_subscribers
    const phpApi = `${window.location.origin}/php/api.php`;

    // extract resource and optional id
    // path examples: /api/resource, /api/resource/123, /api/resource?query
    const url = new URL(path, STRAPI_URL);
    const segments = url.pathname.split('/').filter(Boolean); // ['api','resource', 'id?']
    const resource = segments[1] ?? '';
    const id = segments[2] ?? null;
    const table = resource.replace(/-/g, '_');

    const method = (fetchOptions.method || 'GET').toUpperCase();

    if (method === 'GET') {
      // simple select
      const qs = new URLSearchParams(url.search);
      qs.set('action', 'select');
      qs.set('table', table);
      const res = await fetch(`${phpApi}?${qs.toString()}`, { method: 'GET' });
      return res.json() as Promise<T>;
    }

    if (method === 'POST') {
      // create
      let body: any = {};
      try {
        body = (fetchOptions.body && typeof fetchOptions.body === 'string') ? JSON.parse(fetchOptions.body) : fetchOptions.body || {};
      } catch {
        body = {};
      }
      const data = body.data ?? body;
      const payload = { table, data };
      const res = await fetch(`${phpApi}?action=insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.json() as Promise<T>;
    }

    if (method === 'PUT' || method === 'PATCH') {
      // update - require id in path or in body
      let body: any = {};
      try {
        body = (fetchOptions.body && typeof fetchOptions.body === 'string') ? JSON.parse(fetchOptions.body) : fetchOptions.body || {};
      } catch {
        body = {};
      }
      const data = body.data ?? body;
      const conditions: any = {};
      if (id) conditions.id = id;
      if (body.id) conditions.id = body.id;
      const payload = { table, data, conditions };
      const res = await fetch(`${phpApi}?action=update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.json() as Promise<T>;
    }

    if (method === 'DELETE') {
      const conditions: any = {};
      if (id) conditions.id = id;
      const payload = { table, conditions };
      const res = await fetch(`${phpApi}?action=delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.json() as Promise<T>;
    }
  }

  // Fallback: original Strapi behavior
  const headers = new Headers(fetchOptions.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(normalizePath(path), {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Strapi request failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<T>;
}

export function getJwtFromStorage() {
  return localStorage.getItem("strapi_jwt");
}

export function setJwtToStorage(token: string) {
  localStorage.setItem("strapi_jwt", token);
}

export function clearJwtFromStorage() {
  localStorage.removeItem("strapi_jwt");
}

type StrapiUrlAttributes = { url?: string };
type StrapiMediaData = { attributes?: StrapiUrlAttributes };
type StrapiMediaLike = {
  url?: string;
  attributes?: StrapiUrlAttributes;
  data?: StrapiMediaData | StrapiMediaData[];
};

export function mediaToUrl(media: unknown): string | null {
  // Strapi REST media format commonly:
  // - single media: { data: { attributes: { url } } }
  // - array media: { data: [{ attributes: { url } }, ...] }
  // - sometimes already-populated url string
  if (!media) return null;

  if (typeof media === "string") {
    return media.startsWith("http") ? media : `${STRAPI_URL}${media}`;
  }

  const m = media as StrapiMediaLike;
  const url =
    m.url ||
    m.attributes?.url ||
    (Array.isArray(m.data) ? m.data[0]?.attributes?.url : m.data?.attributes?.url);
  if (!url) return null;

  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}

export function mediaArrayToUrls(media: unknown): string[] {
  if (!media) return [];
  if (Array.isArray(media)) {
    return media
      .map((m) => mediaToUrl(m))
      .filter((u): u is string => typeof u === "string");
  }

  const m = media as StrapiMediaLike;
  const arr = m.data;
  if (!Array.isArray(arr)) return [];

  return arr
    .map((d) => mediaToUrl({ data: d } as unknown))
    .filter((u): u is string => typeof u === "string");
}

