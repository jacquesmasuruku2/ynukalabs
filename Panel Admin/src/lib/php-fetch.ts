/** Shared fetch helper for the PHP API (auth + CRUD). */

function stripEnvQuotes(value: string | undefined): string {
  if (!value) return "";
  return value.replace(/^["']|["']$/g, "").trim();
}

export const API_BASE_URL =
  stripEnvQuotes(import.meta.env.VITE_API_URL) ||
  "https://admin.ynukalabs.com/api/api.php";

function apiCandidates(base: string): string[] {
  const seen = new Set<string>();
  const add = (u: string) => {
    seen.add(u);
    return u;
  };
  const norm = (s: string) => s.replace(/\/+$/, "");
  const b = norm(base);
  add(b);
  if (b.endsWith("/api.php")) {
    add(b.replace(/\/api.php$/, "/api/api.php"));
  } else if (b.endsWith("/api/api.php")) {
    add(b.replace(/\/api\/api.php$/, "/api.php"));
  } else {
    add(`${b}/api/api.php`);
    add(`${b}/api.php`);
  }
  return Array.from(seen);
}

function isJsonApiResponse(resp: Response): boolean {
  const ct = resp.headers.get("content-type") ?? "";
  return ct.includes("application/json");
}

/**
 * Tries candidate API URLs. Returns on first JSON 2xx response.
 * Throws the API `error` field on JSON 4xx/5xx (e.g. Invalid credentials).
 */
export async function fetchWithFallback(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const candidates = apiCandidates(API_BASE_URL);
  let networkError: Error | null = null;
  const requestInit: RequestInit = {
    credentials: "include",
    ...init,
  };

  for (const cand of candidates) {
    const url = cand + (path.startsWith("?") ? path : path);
    let resp: Response;
    try {
      resp = await fetch(url, requestInit);
    } catch {
      networkError = new Error(
        "Erreur réseau — vérifiez votre connexion et que l'API est en ligne.",
      );
      continue;
    }

    if (!isJsonApiResponse(resp)) continue;

    if (resp.ok) return resp;

    const json = (await resp.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error || `Erreur HTTP ${resp.status}`);
  }

  throw (
    networkError ??
    new Error(
      "Impossible de joindre l'API. Vérifiez que api.php est accessible (ex. /api/api.php).",
    )
  );
}
