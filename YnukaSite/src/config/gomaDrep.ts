/**
 * Profil officiel GOMA-DRep (Goma Hub).
 * Textes, liens et adresse : métadonnées CIP-119 publiées par le DRep.
 * https://raw.githubusercontent.com/bbandu/DRep-Doc/refs/heads/main/GOMA-DRep.jsonld
 */
export const GOMA_DREP_PROFILE = {
  name: "GOMA-DRep",
  /** CIP-129 */
  drepId: "drep1y2cm9w2egseygejydtgdddnsw9zdpc6ayyf8xh5ascfq4tqkpj06v",
  /** CIP-105 */
  legacyDrepId: "drep1kxetjk2yxfzxv3r26rttvur3gngwxhfpzfe4a8vxzg92cwyeu2q",
  /** Chiffre communiqué avec le profil ; la chaîne le remplace si Koios répond. */
  votingPowerAda: 3926,
  objectives:
    "As a dedicated Delegated Representative (DRep) for the Cardano network, The GOMA DRep vision is to foster a transparent, inclusive, and accountable governance environment that prioritizes the well-being of the community and the long-term success of the ecosystem.",
  motivations:
    "Goma Hub, Your Dedicated DRep\nSince 2020, Goma Hub has been at the heart of the Cardano ecosystem. We have trained, equipped, and mobilized the local community around Cardano, organizing events, workshops, and training sessions. Our staking pool supports the network, and we have successfully completed several Catalyst projects.\nAs your DRep, we are committed to:\nRepresenting your interests within Cardano's governance.\nPromoting transparency and decentralized governance.\nSupporting innovation and local development.\nStrengthening Cardano's position on a global scale.\nJoin us to build a better future with Cardano.",
  qualifications:
    "As a DRep representing the community, we possess a strong foundation in blockchain technology and a deep understanding of Cardano's ecosystem. My qualifications include:\n\nTechnical expertise: Solid understanding of Cardano's technical architecture, including its consensus mechanism, tokenomics, and smart contract platform.\nCommunity engagement: Extensive experience in building and fostering community engagement within the Cardano ecosystem.\nGovernance knowledge: Familiarity with decentralized governance principles and best practices.\nLeadership skills: Proven ability to lead and motivate a team towards shared goals.\nCommunication skills: Strong communication and interpersonal skills to effectively represent the interests of the Goma community.\nThese qualifications equip me to effectively fulfill my role as a DRep and contribute to the successful governance of the Cardano network",
  paymentAddress:
    "addr1q820znf8j335z4dtqzr24kzwp2rjdu848w0yptcftc26gqcytrdcghfvdmuva2yxe0ysejc39vfmw9qtmh8lmnrpmdrqm4e5pa",
  metadataUrl:
    "https://raw.githubusercontent.com/bbandu/DRep-Doc/refs/heads/main/GOMA-DRep.jsonld",
  metadataHash: "e0863118ea193d074eced85842d05a5dbddf6a8645c29a938ce58aa375a24778",
  references: [
    {
      label: "GOMA-DRep X link where you'll find all our news and where we can interact.",
      uri: "https://x.com/gomadrep",
    },
    {
      label: "Goma Stake Pool website Link where you can follow our activities",
      uri: "https://gomapool.com/",
    },
    {
      label: "Goma Stake Pool Youtube channel Link where we share our workshops",
      uri: "https://www.youtube.com/@gomastakepool5102",
    },
  ],
} as const;

const envId = (import.meta.env.VITE_GOMA_DREP_ID as string | undefined)?.trim();

export const GOMA_DREP_CONFIG = {
  drepId: envId || GOMA_DREP_PROFILE.drepId,
  officialProfileUrl:
    (import.meta.env.VITE_GOMA_DREP_PROFILE_URL as string | undefined)?.trim() ||
    `https://gov.tools/drep_directory/${envId || GOMA_DREP_PROFILE.drepId}`,
  delegateToolUrl:
    (import.meta.env.VITE_GOMA_DREP_DELEGATE_URL as string | undefined)?.trim() ||
    `https://gov.tools/drep_directory/${envId || GOMA_DREP_PROFILE.drepId}`,
  communityUrl:
    (import.meta.env.VITE_GOMA_DREP_COMMUNITY_URL as string | undefined)?.trim() ||
    "https://x.com/gomadrep",
} as const;

export function getGomaDrepDelegateHref(): string {
  return GOMA_DREP_CONFIG.delegateToolUrl;
}

export function truncateDrepId(id: string, head = 16): string {
  if (id.length <= head + 3) return id;
  return `${id.slice(0, head)}...`;
}
