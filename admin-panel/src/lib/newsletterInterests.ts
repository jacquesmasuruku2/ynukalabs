/** Centres d’intérêt newsletter — alignés Ynuka Labs (pas Malakinfo). */
export const NEWSLETTER_INTEREST_OPTIONS = [
  { value: 'actualites', label: 'Actualités Ynuka' },
  { value: 'events', label: 'Événements' },
  { value: 'education', label: 'Formation & éducation' },
  { value: 'blockchain', label: 'Blockchain & Web3' },
  { value: 'community', label: 'Communauté' },
  { value: 'projects', label: 'Projets & opportunités' },
] as const;

/** Anciennes clés Malakinfo encore présentes en base — affichage seulement. */
const LEGACY_INTEREST_LABELS: Record<string, string> = {
  economie: 'Économie (ancien)',
  culture: 'Culture (ancien)',
  sport: 'Sport (ancien)',
  tech: 'Science & Tech (ancien)',
};

const ALL_KNOWN = [
  ...NEWSLETTER_INTEREST_OPTIONS.map((o) => o.value),
  ...Object.keys(LEGACY_INTEREST_LABELS),
];

export function isKnownNewsletterInterest(value: string): boolean {
  return ALL_KNOWN.includes(value);
}

export function labelForNewsletterInterest(value: string): string {
  const current = NEWSLETTER_INTEREST_OPTIONS.find((o) => o.value === value);
  if (current) return current.label;
  return LEGACY_INTEREST_LABELS[value] || value;
}
