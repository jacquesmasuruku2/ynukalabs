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
      // Convert Strapi filters to PHP API parameters
      const qs = new URLSearchParams(url.search);
      qs.set('action', 'list');
      qs.set('resource', table);

      // Handle Strapi pagination
      const pageSize = qs.get('pagination[pageSize]') || qs.get('pagination[limit]');
      if (pageSize) {
        qs.set('limit', pageSize);
        qs.delete('pagination[pageSize]');
        qs.delete('pagination[limit]');
      }

      const page = qs.get('pagination[page]');
      if (page) {
        qs.set('page', page);
        qs.delete('pagination[page]');
      }

      // Handle Strapi filters - convert to simple search
      const filters = qs.get('filters');
      if (filters) {
        try {
          const filterObj = JSON.parse(filters);
          // Extract simple equality filters
          const searchTerms: string[] = [];
          Object.entries(filterObj).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              if ('$eq' in value) {
                searchTerms.push(`${key}=${value.$eq}`);
              }
            }
          });
          if (searchTerms.length > 0) {
            qs.set('search', searchTerms.join(' '));
          }
        } catch {
          // If JSON parse fails, ignore filters
        }
        qs.delete('filters');
      }

      // Handle Strapi sort
      const sort = qs.get('sort');
      if (sort) {
        // PHP API doesn't support sort parameter yet, but we can pass it
        // The PHP API will ignore it for now
        qs.delete('sort');
      }

      // Remove other Strapi-specific parameters
      qs.delete('populate');
      qs.delete('fields');

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
      const res = await fetch(`${phpApi}?action=create&resource=${table}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json() as Promise<T>;
    }

    if (method === 'PUT' || method === 'PATCH') {
      // update
      let body: any = {};
      try {
        body = (fetchOptions.body && typeof fetchOptions.body === 'string') ? JSON.parse(fetchOptions.body) : fetchOptions.body || {};
      } catch {
        body = {};
      }
      const data = body.data ?? body;
      const updateId = id || body.id;
      if (!updateId) {
        throw new Error('No ID provided for update');
      }
      const res = await fetch(`${phpApi}?action=update&resource=${table}&id=${updateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json() as Promise<T>;
    }

    if (method === 'DELETE') {
      const deleteId = id;
      if (!deleteId) {
        throw new Error('No ID provided for delete');
      }
      const res = await fetch(`${phpApi}?action=delete&resource=${table}&id=${deleteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

