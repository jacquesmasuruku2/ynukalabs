/**
 * Configuration Goma DRep — renseigner via variables d'environnement.
 * Ne pas inventer d'identifiant ni de liens officiels.
 */
export const GOMA_DREP_CONFIG = {
  /** Identifiant DRep officiel (à fournir) */
  drepId: (import.meta.env.VITE_GOMA_DREP_ID as string | undefined)?.trim() || "",
  /** Lien vers le profil officiel (gov.tools, explorateur, etc.) */
  officialProfileUrl:
    (import.meta.env.VITE_GOMA_DREP_PROFILE_URL as string | undefined)?.trim() || "",
  /** Lien outil compatible pour démarrer la délégation */
  delegateToolUrl:
    (import.meta.env.VITE_GOMA_DREP_DELEGATE_URL as string | undefined)?.trim() || "",
  /** Canal communautaire officiel */
  communityUrl:
    (import.meta.env.VITE_GOMA_DREP_COMMUNITY_URL as string | undefined)?.trim() || "",
} as const;

export function hasGomaDrepProfile(): boolean {
  return Boolean(GOMA_DREP_CONFIG.officialProfileUrl || GOMA_DREP_CONFIG.drepId);
}

export function getGomaDrepProfileHref(): string | null {
  if (GOMA_DREP_CONFIG.officialProfileUrl) return GOMA_DREP_CONFIG.officialProfileUrl;
  return null;
}

export function getGomaDrepDelegateHref(): string | null {
  if (GOMA_DREP_CONFIG.delegateToolUrl) return GOMA_DREP_CONFIG.delegateToolUrl;
  return getGomaDrepProfileHref();
}
