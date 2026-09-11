import { fetchFromApi } from "@/lib/api";
import { VALIDATORS_FALLBACK } from "./validatorsFallback";
import type { YnukaValidator } from "./types";

function pickStr(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v || null;
}

function mapRow(item: Record<string, unknown>): YnukaValidator | null {
  const id = String(item.id ?? "").trim();
  const name = pickStr(item.name) || pickStr(item.title);
  const chain = pickStr(item.chain) || pickStr(item.network) || pickStr(item.blockchain);
  if (!id || !name || !chain) return null;

  const published = item.published;
  if (published === false || published === 0 || published === "0") return null;

  return {
    id,
    name,
    chain,
    status: (pickStr(item.status) || "active").toLowerCase(),
    address: pickStr(item.address) || pickStr(item.operator_address),
    explorerUrl: pickStr(item.explorer_url) || pickStr(item.explorerUrl) || pickStr(item.url),
    imageUrl: pickStr(item.image_url) || pickStr(item.imageUrl) || pickStr(item.logo_url),
    description: pickStr(item.description),
    descriptionFr: pickStr(item.description_fr) || pickStr(item.descriptionFr),
    rank: pickStr(item.rank),
    votingPower: pickStr(item.voting_power) || pickStr(item.votingPower),
    votingPowerPct: pickStr(item.voting_power_pct) || pickStr(item.votingPowerPct),
    tokensStaked: pickStr(item.tokens_staked) || pickStr(item.tokensStaked) || pickStr(item.total_stake),
    commission: pickStr(item.commission),
    delegators: pickStr(item.delegators) || pickStr(item.delegations),
    uptime: pickStr(item.uptime),
    sortOrder: Number(item.sort_order ?? item.sortOrder ?? 0) || 0,
  };
}

function unwrapRows(result: unknown): Record<string, unknown>[] {
  if (!result || typeof result !== "object") return [];
  const r = result as { rows?: unknown[]; data?: unknown[] };
  const list = Array.isArray(r.rows) ? r.rows : Array.isArray(r.data) ? r.data : [];
  return list.filter((row): row is Record<string, unknown> => !!row && typeof row === "object");
}

/**
 * Liste les validateurs publiés.
 * Si l’API n’existe pas encore → fallback (Safrochain actuel).
 */
export async function listValidators(limit = 50): Promise<YnukaValidator[]> {
  try {
    const result = await fetchFromApi("list", { resource: "validators", limit });
    const mapped = unwrapRows(result)
      .map(mapRow)
      .filter((v): v is YnukaValidator => !!v)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    if (mapped.length > 0) return mapped;
  } catch {
    /* resource absente ou erreur → fallback */
  }
  return VALIDATORS_FALLBACK;
}
