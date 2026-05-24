/** URLs API à tester (ordre de priorité). */
export const API_CANDIDATES = [
  "/api/api.php",
  "https://admin.ynukalabs.com/api/api.php",
  "https://ynukalabs.com/api.php",
] as const;

function toAbsoluteUrl(url: string): string {
  return new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost").toString();
}

export async function probeApiUrl(url: string, timeoutMs = 12_000): Promise<boolean> {
  try {
    const pingUrl = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    pingUrl.searchParams.set("action", "ping");
    const res = await fetch(pingUrl.toString(), {
      method: "GET",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return false;
    const data = JSON.parse(await res.text());
    return data?.ok === true;
  } catch {
    return false;
  }
}


/** Trouve une API joignable (localStorage puis candidats par défaut). */
export async function discoverApiUrl(): Promise<string | null> {
  const stored =
    typeof window !== "undefined" ? localStorage.getItem("ynuka_api_url")?.trim() : "";
  if (stored) {
    try {
      toAbsoluteUrl(stored);
      if (await probeApiUrl(stored)) return stored;
    } catch {
      /* URL invalide en cache */
    }
  }
  for (const url of API_CANDIDATES) {
    if (await probeApiUrl(url)) return url;
  }
  return null;
}
