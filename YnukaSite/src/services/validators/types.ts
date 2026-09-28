/**
 * Validateur affiché sur le site (écosystème / page Validateurs).
 *
 * --- Spec admin (autre dev) ---
 * Resource publique `validators` (list) :
 * - name, chain, status (active|inactive)
 * - address, explorer_url, image_url
 * - description / description_fr
 * - rank, voting_power, voting_power_pct, tokens_staked,
 *   commission, delegators, uptime (textes libres)
 * - sort_order, published (1 = visible)
 * CRUD AdminDashboard pour ajouter Cardano, Apex, etc. sans toucher le FE.
 */
export type YnukaValidator = {
  id: string;
  name: string;
  chain: string;
  status: "active" | "inactive" | string;
  address: string | null;
  explorerUrl: string | null;
  imageUrl: string | null;
  description: string | null;
  descriptionFr: string | null;
  rank: string | null;
  votingPower: string | null;
  votingPowerPct: string | null;
  tokensStaked: string | null;
  commission: string | null;
  delegators: string | null;
  uptime: string | null;
  sortOrder: number;
};
