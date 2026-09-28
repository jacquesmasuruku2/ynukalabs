import { GOMA_DREP_PROFILE } from "@/config/gomaDrep";

export type GomaDrepChainSnapshot = {
  active: boolean;
  votingPowerAda: number;
  yes: number | null;
  no: number | null;
  abstain: number | null;
  /** URL d'ancrage enregistrée on-chain, si Koios la renvoie. */
  metaUrl: string | null;
  metaHash: string | null;
};

const KOIOS = "https://api.koios.rest/api/v1";
const PAGE_SIZE = 1000;
const MAX_PAGES = 8;

type DrepInfoRow = {
  active?: boolean;
  amount?: string | number | null;
  meta_url?: string | null;
  meta_hash?: string | null;
};

type DrepVoteRow = {
  vote?: string | null;
};

async function postKoios<T>(path: string, body: unknown, offset = 0): Promise<T> {
  const url = new URL(`${KOIOS}/${path}`);
  if (offset > 0) url.searchParams.set("offset", String(offset));
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Koios ${path} ${response.status}`);
  return (await response.json()) as T;
}

function adaFromLovelace(amount: string | number | null | undefined): number | null {
  if (amount == null || amount === "") return null;
  const lovelace = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(lovelace)) return null;
  return lovelace / 1_000_000;
}

function tally(votes: DrepVoteRow[]) {
  let yes = 0;
  let no = 0;
  let abstain = 0;
  for (const row of votes) {
    const vote = String(row.vote ?? "").trim().toLowerCase();
    if (vote === "yes") yes += 1;
    else if (vote === "no") no += 1;
    else if (vote === "abstain") abstain += 1;
  }
  return { yes, no, abstain };
}

/**
 * Statut, pouvoir de vote et décompte des votes on-chain.
 * En cas d'échec, le pouvoir de vote retombe sur le chiffre du profil officiel.
 */
export async function fetchGomaDrepChain(drepId: string): Promise<GomaDrepChainSnapshot> {
  const snapshot: GomaDrepChainSnapshot = {
    active: true,
    votingPowerAda: GOMA_DREP_PROFILE.votingPowerAda,
    yes: null,
    no: null,
    abstain: null,
    metaUrl: null,
    metaHash: null,
  };

  try {
    const rows = await postKoios<DrepInfoRow[]>("drep_info", { _drep_ids: [drepId] });
    const info = rows?.[0];
    if (info) {
      if (typeof info.active === "boolean") snapshot.active = info.active;
      const ada = adaFromLovelace(info.amount);
      if (ada != null) snapshot.votingPowerAda = ada;
      const metaUrl = String(info.meta_url ?? "").trim();
      const metaHash = String(info.meta_hash ?? "").trim();
      if (/^https?:\/\//i.test(metaUrl)) snapshot.metaUrl = metaUrl;
      if (metaHash) snapshot.metaHash = metaHash;
    }
  } catch {
    /* profil officiel conservé */
  }

  try {
    const all: DrepVoteRow[] = [];
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const batch = await postKoios<DrepVoteRow[]>("drep_votes", { _drep_id: drepId }, page * PAGE_SIZE);
      if (!Array.isArray(batch) || batch.length === 0) break;
      all.push(...batch);
      if (batch.length < PAGE_SIZE) break;
    }
    const counts = tally(all);
    snapshot.yes = counts.yes;
    snapshot.no = counts.no;
    snapshot.abstain = counts.abstain;
  } catch {
    /* décompte laissé indisponible */
  }

  return snapshot;
}
