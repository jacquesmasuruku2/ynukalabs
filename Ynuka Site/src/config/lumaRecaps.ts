/**
 * Récaps manuels pour des événements Luma passés.
 * L’API Luma ne fournit pas de résumé Ynuka : on les associe ici.
 *
 * --- Spec admin (autre dev) ---
 * Pour éviter de toucher le code à chaque récap :
 * - Champ `recap_url` (et optionnel `youtube_url`) sur events site
 * - Table ou champs `luma_event_id` / `luma_slug` + `recap_url` pour Luma
 * - UI AdminDashboard : coller le lien résumé après l’événement
 * - Endpoint public list/get qui expose ces URLs au front
 * En attendant, ce fichier reste le fallback FE.
 *
 * `match` = id Luma (`evt-…`) OU slug d’URL (`srjjsgol` dans luma.com/srjjsgol)
 */
export type LumaRecapEntry = {
  match: string;
  recapUrl: string;
  youtubeUrl?: string;
  /** Aide mémoire (non utilisé pour le matching) */
  label?: string;
};

export const LUMA_EVENT_RECAPS: LumaRecapEntry[] = [
  // Décommente / ajoute tes récaps ici :
  // {
  //   match: "evt-sxGIi0JfyADUA8E",
  //   label: "Community Call #4",
  //   recapUrl: "https://ynukalabs.com/blog/ton-article",
  //   youtubeUrl: "https://www.youtube.com/watch?v=…",
  // },
];

export function findLumaRecap(
  eventApiId: string,
  eventSlug?: string | null
): LumaRecapEntry | null {
  const id = eventApiId.trim().toLowerCase();
  const slug = eventSlug?.trim().toLowerCase() || "";
  return (
    LUMA_EVENT_RECAPS.find((entry) => {
      const m = entry.match.trim().toLowerCase();
      return m === id || (slug && m === slug);
    }) || null
  );
}
