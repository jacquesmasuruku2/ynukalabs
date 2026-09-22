import { GOMA_DREP_PROFILE } from "@/config/gomaDrep";

export type GomaDrepReference = {
  label: string;
  uri: string;
};

export type GomaDrepLiveProfile = {
  name: string;
  objectives: string;
  motivations: string;
  qualifications: string;
  paymentAddress: string;
  metadataUrl: string;
  references: GomaDrepReference[];
};

export function fallbackGomaDrepProfile(): GomaDrepLiveProfile {
  return {
    name: GOMA_DREP_PROFILE.name,
    objectives: GOMA_DREP_PROFILE.objectives,
    motivations: GOMA_DREP_PROFILE.motivations,
    qualifications: GOMA_DREP_PROFILE.qualifications,
    paymentAddress: GOMA_DREP_PROFILE.paymentAddress,
    metadataUrl: GOMA_DREP_PROFILE.metadataUrl,
    references: GOMA_DREP_PROFILE.references.map((ref) => ({ label: ref.label, uri: ref.uri })),
  };
}

function textValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "@value" in value) {
    const inner = (value as { "@value"?: unknown })["@value"];
    return typeof inner === "string" ? inner.trim() : "";
  }
  return "";
}

function parseReferences(value: unknown): GomaDrepReference[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as { label?: unknown; uri?: unknown };
      const label = textValue(row.label);
      const uri = textValue(row.uri);
      if (!label || !/^https?:\/\//i.test(uri)) return null;
      return { label, uri };
    })
    .filter((row): row is GomaDrepReference => row !== null);
}

/**
 * Lit le document CIP-119 publié (celui que GovTool affiche).
 * Retourne null si le fichier est inaccessible ou incomplet.
 */
export async function fetchGomaDrepMetadata(metadataUrl: string): Promise<GomaDrepLiveProfile | null> {
  if (!/^https?:\/\//i.test(metadataUrl)) return null;
  const response = await fetch(metadataUrl, { cache: "no-store" });
  if (!response.ok) return null;
  const data = (await response.json()) as { body?: Record<string, unknown> };
  const body = data?.body;
  if (!body || typeof body !== "object") return null;

  const fallback = fallbackGomaDrepProfile();
  const name = textValue(body.givenName) || fallback.name;
  const objectives = textValue(body.objectives) || fallback.objectives;
  const motivations = textValue(body.motivations) || fallback.motivations;
  const qualifications = textValue(body.qualifications) || fallback.qualifications;
  const paymentAddress = textValue(body.paymentAddress) || fallback.paymentAddress;
  const references = parseReferences(body.references);

  return {
    name,
    objectives,
    motivations,
    qualifications,
    paymentAddress,
    metadataUrl,
    references: references.length > 0 ? references : fallback.references,
  };
}
