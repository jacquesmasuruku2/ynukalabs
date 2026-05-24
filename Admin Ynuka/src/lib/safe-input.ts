/** Valeur sûre pour un champ contrôlé React (évite null/undefined → crash React 19). */
export function toControlledString(value: unknown): string {
  if (value == null) return "";
  return String(value);
}
