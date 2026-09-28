import type { YnukaValidator } from "./types";

/**
 * Fallback FE tant que l’API `validators` n’est pas peuplée.
 * Stats Apex = simulation temporaire (à remplacer par les vraies données).
 */
export const VALIDATORS_FALLBACK: YnukaValidator[] = [
  {
    id: "safrochain-ynukalabs",
    name: "YnukaLabs",
    chain: "Safrochain",
    status: "active",
    address: "addr_safrovaloper1q4c4p0n66crlkgagr76mjtnmt4d8pdlq8knm5z",
    explorerUrl:
      "https://explorer.safrochain.com/validator/addr_safrovaloper1q4c4p0n66crlkgagr76mjtnmt4d8pdlq8knm5z",
    imageUrl: "/partners/safrochain-validator.png",
    description:
      "YnukaLabs secures Safrochain by validating blocks and supporting governance from Central Africa.",
    descriptionFr:
      "YnukaLabs sécurise Safrochain en validant les blocs et en participant à la gouvernance depuis l'Afrique centrale.",
    rank: "#8",
    votingPower: "19.49M SAF",
    votingPowerPct: "3.23%",
    tokensStaked: "19.49M SAF",
    commission: "10.00%",
    delegators: "9",
    uptime: "100.0%",
    sortOrder: 1,
  },
  {
    id: "apex-ujuzilabs",
    name: "UjuziLabs",
    chain: "Apex Fusion",
    status: "active",
    address: null,
    explorerUrl: "https://apexfusion.org",
    imageUrl: "/partners/apex.png",
    description:
      "UjuziLabs operates a validator on Apex Fusion, contributing to cross-chain security and network resilience.",
    descriptionFr:
      "UjuziLabs opère un validateur sur Apex Fusion, contribuant à la sécurité cross-chain et à la résilience du réseau.",
    // Simulations — à remplacer dès que les chiffres officiels sont disponibles
    rank: "#12",
    votingPower: "2.40M APEX",
    votingPowerPct: "1.85%",
    tokensStaked: "2.40M APEX",
    commission: "8.00%",
    delegators: "24",
    uptime: "99.8%",
    sortOrder: 2,
  },
];
