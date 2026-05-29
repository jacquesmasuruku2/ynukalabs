/** Parse #token=… ou #error=… (JWT-safe, sans URLSearchParams sur la valeur). */

export function parseOAuthHash(hash: string | undefined): {
  token?: string;
  error?: string;
} {
  const raw = (hash ?? "").replace(/^#/, "").trim();
  if (!raw) return {};

  if (raw.startsWith("error=")) {
    return { error: decodeURIComponent(raw.slice(6)) };
  }

  if (raw.startsWith("token=")) {
    return { token: decodeURIComponent(raw.slice(6)) };
  }

  const params = new URLSearchParams(raw);
  const token = params.get("token");
  const error = params.get("error");
  if (token) return { token };
  if (error) return { error };
  return {};
}

export function clearOAuthHashFromUrl(): void {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
}
