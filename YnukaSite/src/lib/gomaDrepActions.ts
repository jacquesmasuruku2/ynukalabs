import { fetchFromApi } from "@/lib/api";

export type GomaDrepVote = "yes" | "no" | "abstain";

export type GomaDrepAction = {
  id: string;
  title: string;
  titleFr?: string;
  actionType: string;
  status: string;
  /** Date ISO ou libellé d'epoch fourni par la source */
  dateOrEpoch: string;
  vote: GomaDrepVote;
  rationale: string;
  rationaleFr?: string;
  sourceUrl: string;
};

function normalizeVote(value: unknown): GomaDrepVote | null {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase();
  if (["yes", "oui", "y", "1", "true"].includes(raw)) return "yes";
  if (["no", "non", "n", "0", "false"].includes(raw)) return "no";
  if (["abstain", "abstention", "abs", "a"].includes(raw)) return "abstain";
  return null;
}

function mapRow(item: Record<string, unknown>): GomaDrepAction | null {
  const title = String(item.title ?? item.name ?? "").trim();
  const actionType = String(item.action_type ?? item.type ?? item.actionType ?? "").trim();
  const status = String(item.status ?? "").trim();
  const dateOrEpoch = String(
    item.date_or_epoch ?? item.epoch ?? item.voted_at ?? item.date ?? item.created_at ?? ""
  ).trim();
  const vote = normalizeVote(item.vote ?? item.drep_vote ?? item.decision);
  const rationale = String(item.rationale ?? item.justification ?? item.reason ?? "").trim();
  const sourceUrl = String(item.source_url ?? item.url ?? item.official_url ?? "").trim();

  if (!title || !actionType || !status || !dateOrEpoch || !vote || !rationale || !sourceUrl) {
    return null;
  }
  if (!/^https?:\/\//i.test(sourceUrl)) return null;

  return {
    id: String(item.id ?? `${title}-${dateOrEpoch}`),
    title,
    titleFr: String(item.title_fr ?? item.titleFr ?? "").trim() || undefined,
    actionType,
    status,
    dateOrEpoch,
    vote,
    rationale,
    rationaleFr: String(item.rationale_fr ?? item.justification_fr ?? "").trim() || undefined,
    sourceUrl,
  };
}

/**
 * Actions de gouvernance examinées par Goma DRep.
 * Source : API admin (`goma_drep_actions`) si disponible.
 * Aucune donnée fictive — liste vide si absente ou incomplète.
 */
export async function fetchGomaDrepActions(limit = 50): Promise<GomaDrepAction[]> {
  const result = await fetchFromApi<{ rows?: unknown[]; data?: unknown[] }>("list", {
    resource: "goma_drep_actions",
    limit,
  });

  const rows = result.rows ?? result.data ?? [];
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => (row && typeof row === "object" ? mapRow(row as Record<string, unknown>) : null))
    .filter((row): row is GomaDrepAction => row !== null)
    .sort((a, b) => {
      const ta = Date.parse(a.dateOrEpoch);
      const tb = Date.parse(b.dateOrEpoch);
      if (!Number.isNaN(ta) && !Number.isNaN(tb)) return tb - ta;
      return b.dateOrEpoch.localeCompare(a.dateOrEpoch);
    });
}
