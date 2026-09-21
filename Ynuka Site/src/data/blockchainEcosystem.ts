export type BlockchainId =
  | "cardano"
  | "safrochain"
  | "midnight"
  | "polkadot"
  | "xcavate";

export type ActivityKind = "contracts" | "nft" | "defi" | "trace" | "sustain";

export interface ChainActivity {
  kind: ActivityKind;
  title: string;
  body: string;
}

export interface ChainContent {
  name: string;
  tagline: string;
  description: string;
  /** Vide = initiales sur dégradé dans l'UI */
  logoUrl: string;
  websiteUrl?: string;
  accent: string;
  activities: ChainActivity[];
}

export const BLOCKCHAIN_ORDER: BlockchainId[] = [
  "cardano",
  "safrochain",
  "midnight",
  "polkadot",
  "xcavate",
];

const en: Record<BlockchainId, ChainContent> = {
  cardano: {
    name: "Cardano",
    tagline: "Our main chain for training, stake pools, and real-world projects",
    description:
      "Cardano is where Ynuka Labs runs most of its production work: stake-pool operations, Catalyst-aligned innovation, and digital assets tied to sustainability programs.",
    logoUrl: "https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/ada.svg",
    websiteUrl: "https://www.cardano.org",
    accent: "from-emerald-500/25 to-teal-600/10",
    activities: [
      {
        kind: "contracts",
        title: "Smart contract development",
        body: "Plutus and ecosystem tooling for community apps, certificates, and on-chain rules tailored to local needs.",
      },
      {
        kind: "nft",
        title: "NFT & impact projects",
        body: "NFT-backed initiatives such as NFTree / Mtidano for transparent reforestation and donor engagement.",
      },
      {
        kind: "defi",
        title: "DeFi workshops",
        body: "Hands-on sessions on wallets, DEX basics, staking, and risk-aware participation across the Cardano DeFi stack.",
      },
      {
        kind: "trace",
        title: "Traceability & transparency",
        body: "On-chain metadata and lightweight proofs for grants, cohorts, and field-project audit trails.",
      },
      {
        kind: "sustain",
        title: "Sustainability use cases",
        body: "Verifiable records for climate and agriculture programs: planting, cohort outcomes, and partner accountability.",
      },
    ],
  },
  safrochain: {
    name: "Safrochain",
    tagline: "African-led infrastructure: validators and local ecosystem building",
    description:
      "Safrochain reflects Ynuka Labs' commitment to infrastructure built from the region: validator participation, community onboarding, and use cases that fit Central African realities.",
    logoUrl: "/partners/safrochain.png",
    websiteUrl: "https://safrochain.com",
    accent: "from-green-600/25 to-emerald-900/20",
    activities: [
      {
        kind: "trace",
        title: "Validator & network security",
        body: "Operating or supporting validator setups with monitoring, upgrades, and transparent reporting.",
      },
      {
        kind: "contracts",
        title: "Chain-native development",
        body: "Application patterns on Safrochain for local products, registries, and public-good dApps.",
      },
      {
        kind: "defi",
        title: "DeFi & payments",
        body: "Low-friction rails for remittances, savings circles, and experimental liquidity programs.",
      },
      {
        kind: "nft",
        title: "Community NFT programs",
        body: "Membership, rewards, and cultural assets that strengthen identity without speculation-first narratives.",
      },
      {
        kind: "sustain",
        title: "Sustainable impact",
        body: "Linking on-chain activity to agriculture, energy, and youth employment outcomes in the Great Lakes region.",
      },
    ],
  },
  midnight: {
    name: "Midnight",
    tagline: "Privacy-first applications for NGOs, identity, and regulated pilots",
    description:
      "Midnight enables compliant applications where sensitive data must stay protected. Ynuka Labs explores selective disclosure and zero-knowledge patterns for civil society and cross-border programs.",
    logoUrl: "/partners/midnight.png",
    websiteUrl: "https://midnight.network",
    accent: "from-slate-600/40 to-indigo-950/40",
    activities: [
      {
        kind: "contracts",
        title: "Protected smart contracts",
        body: "Patterns for private state, proofs, and public verification without leaking sensitive fields.",
      },
      {
        kind: "trace",
        title: "Compliance & transparency",
        body: "Balancing auditability with privacy: what auditors see, what users control, and what stays sealed.",
      },
      {
        kind: "nft",
        title: "Credentials & attestations",
        body: "Privacy-preserving credentials for cohorts, minimal-KYC access, and program eligibility.",
      },
      {
        kind: "defi",
        title: "Confidential treasury flows",
        body: "When shielded flows matter for treasury safety and how to teach the risks honestly.",
      },
      {
        kind: "sustain",
        title: "Responsible deployment",
        body: "Human-rights-aware design for civil society and cross-border collaboration in sensitive contexts.",
      },
    ],
  },
  polkadot: {
    name: "Polkadot",
    tagline: "Parachains, shared security, and cross-chain messaging explained clearly",
    description:
      "We introduce Polkadot's relay-chain model, parachains, and XCM so teams understand secure interoperability and the trade-offs of shared security.",
    logoUrl: "https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/dot.svg",
    websiteUrl: "https://polkadot.network",
    accent: "from-pink-500/20 to-violet-600/15",
    activities: [
      {
        kind: "contracts",
        title: "Substrate & on-chain logic",
        body: "Foundations of pallets and runtime concepts for builders exploring app-specific chains and tooling.",
      },
      {
        kind: "defi",
        title: "DeFi & staking literacy",
        body: "DOT staking, nomination, and how parachain economies connect to liquidity and treasury design.",
      },
      {
        kind: "trace",
        title: "Cross-chain traceability",
        body: "How XCM-style messaging supports proofs of state across zones without duplicating trust assumptions.",
      },
      {
        kind: "nft",
        title: "NFT & assets on parachains",
        body: "Overview of asset standards and use cases where parachains specialize in identity, gaming, or real-world assets.",
      },
      {
        kind: "sustain",
        title: "Governance & sustainability",
        body: "Open governance culture, treasury programs, and aligning long-term network health with community goals.",
      },
    ],
  },
  xcavate: {
    name: "XCAVATE",
    tagline: "Tokenized real-world assets with transparent vault mechanics",
    description:
      "We collaborate on XCAVATE-aligned use cases: tokenized real-world assets, transparent vault mechanics, and education for responsible RWA adoption.",
    logoUrl: "/partners/xcavate.png",
    websiteUrl: "https://www.xcavate.io",
    accent: "from-amber-500/20 to-orange-700/15",
    activities: [
      {
        kind: "contracts",
        title: "RWA smart-contract patterns",
        body: "Lifecycle of minting, redemption, and compliance hooks for asset-backed tokens.",
      },
      {
        kind: "trace",
        title: "Traceability & audits",
        body: "Linking off-chain attestations to on-chain state for investors and community oversight.",
      },
      {
        kind: "defi",
        title: "DeFi integrations",
        body: "How RWAs interface with lending, liquidity pools, and risk parameters.",
      },
      {
        kind: "nft",
        title: "Certificates & proof of asset",
        body: "NFTs and structured metadata as proofs of origin, custody, or impact-linked collateral.",
      },
      {
        kind: "sustain",
        title: "Sustainable finance",
        body: "Aligning tokenized projects with ESG reporting and local development priorities.",
      },
    ],
  },
};

const fr: Record<BlockchainId, ChainContent> = {
  cardano: {
    name: "Cardano",
    tagline: "Notre chaîne principale pour la formation, les stake pools et les projets concrets",
    description:
      "Cardano concentre la majorité de l'activité de Ynuka Labs : exploitation de stake pools, innovation alignée Catalyst et actifs numériques liés à la durabilité.",
    logoUrl: en.cardano.logoUrl,
    websiteUrl: en.cardano.websiteUrl,
    accent: en.cardano.accent,
    activities: [
      {
        kind: "contracts",
        title: "Développement de smart contracts",
        body: "Plutus et outillage écosystème pour apps communautaires, certificats et règles on-chain adaptées au contexte local.",
      },
      {
        kind: "nft",
        title: "NFT & projets d'impact",
        body: "Initiatives NFT comme NFTree / Mtidano pour la reforestation transparente et l'engagement des donateurs.",
      },
      {
        kind: "defi",
        title: "Ateliers DeFi",
        body: "Sessions pratiques sur portefeuilles, bases des DEX, staking et participation maîtrisée des risques sur la DeFi Cardano.",
      },
      {
        kind: "trace",
        title: "Traçabilité & transparence",
        body: "Métadonnées on-chain et preuves légères pour subventions, cohortes et audit de projets terrain.",
      },
      {
        kind: "sustain",
        title: "Cas d'usage durables",
        body: "Preuves vérifiables pour climat et agriculture : plantation, résultats de cohortes et responsabilité partenaires.",
      },
    ],
  },
  safrochain: {
    name: "Safrochain",
    tagline: "Infrastructure africaine : validateurs et écosystème local",
    description:
      "Safrochain incarne l'engagement de Ynuka Labs pour une infrastructure construite depuis la région : participation validateur, onboarding communautaire et cas d'usage adaptés à l'Afrique centrale.",
    logoUrl: en.safrochain.logoUrl,
    websiteUrl: en.safrochain.websiteUrl,
    accent: en.safrochain.accent,
    activities: [
      {
        kind: "trace",
        title: "Validateurs & sécurité réseau",
        body: "Exploitation ou soutien de validateurs : supervision, mises à jour et reporting transparent.",
      },
      {
        kind: "contracts",
        title: "Développement natif",
        body: "Patterns d'applications sur Safrochain pour produits locaux, registres et dApps d'intérêt général.",
      },
      {
        kind: "defi",
        title: "DeFi & paiements",
        body: "Rails à faible friction pour envois, tontines et programmes de liquidité expérimentaux.",
      },
      {
        kind: "nft",
        title: "Programmes NFT communautaires",
        body: "Adhésion, récompenses et actifs culturels sans narration spéculative avant tout.",
      },
      {
        kind: "sustain",
        title: "Impact durable",
        body: "Lier l'activité on-chain à l'agriculture, l'énergie et l'emploi des jeunes dans la région des Grands Lacs.",
      },
    ],
  },
  midnight: {
    name: "Midnight",
    tagline: "Applications respectueuses de la vie privée pour ONG, identité et pilotes régulés",
    description:
      "Midnight permet des applications conformes lorsque les données sensibles doivent rester protégées. Ynuka Labs explore la divulgation sélective et les preuves à divulgation nulle pour la société civile et les programmes transfrontaliers.",
    logoUrl: en.midnight.logoUrl,
    websiteUrl: en.midnight.websiteUrl,
    accent: en.midnight.accent,
    activities: [
      {
        kind: "contracts",
        title: "Smart contracts protégés",
        body: "États privés, preuves et vérification publique sans exposer les champs sensibles.",
      },
      {
        kind: "trace",
        title: "Conformité & transparence",
        body: "Concilier auditabilité et vie privée : ce que voit l'auditeur, ce que contrôle l'utilisateur, ce qui reste scellé.",
      },
      {
        kind: "nft",
        title: "Credentials & attestations",
        body: "Preuves respectueuses de la vie privée pour cohortes, accès à KYC minimal et éligibilité aux programmes.",
      },
      {
        kind: "defi",
        title: "Flux de trésorerie confidentiels",
        body: "Quand les flux protégés sécurisent une trésorerie et comment enseigner les risques honnêtement.",
      },
      {
        kind: "sustain",
        title: "Déploiement responsable",
        body: "Design sensible aux droits humains pour la société civile et la coopération transfrontalière en contextes sensibles.",
      },
    ],
  },
  polkadot: {
    name: "Polkadot",
    tagline: "Parachains, sécurité partagée et messagerie cross-chain, expliqués simplement",
    description:
      "Nous présentons le modèle relay-chain, les parachains et XCM pour comprendre l'interopérabilité sécurisée et les compromis de la sécurité partagée.",
    logoUrl: en.polkadot.logoUrl,
    websiteUrl: en.polkadot.websiteUrl,
    accent: en.polkadot.accent,
    activities: [
      {
        kind: "contracts",
        title: "Substrate & logique on-chain",
        body: "Bases des pallets et du runtime pour les builders qui explorent des chaînes applicatives dédiées.",
      },
      {
        kind: "defi",
        title: "Culture DeFi & staking",
        body: "Staking DOT, nomination et lien avec liquidité et design de trésorerie des parachains.",
      },
      {
        kind: "trace",
        title: "Traçabilité cross-chain",
        body: "Comment la messagerie type XCM permet des preuves d'état entre zones sans dupliquer les hypothèses de confiance.",
      },
      {
        kind: "nft",
        title: "NFT & actifs sur parachains",
        body: "Standards d'actifs et cas d'usage où les parachains se spécialisent (identité, jeu, actifs réels).",
      },
      {
        kind: "sustain",
        title: "Gouvernance & durabilité",
        body: "Gouvernance ouverte, trésor communautaire et alignement long terme sur la santé du réseau.",
      },
    ],
  },
  xcavate: {
    name: "XCAVATE",
    tagline: "Actifs réels tokenisés avec des mécanismes de coffre transparents",
    description:
      "Nous travaillons sur des cas alignés XCAVATE : actifs réels tokenisés, mécanismes de coffres transparents et formation à une adoption RWA responsable.",
    logoUrl: en.xcavate.logoUrl,
    websiteUrl: en.xcavate.websiteUrl,
    accent: en.xcavate.accent,
    activities: [
      {
        kind: "contracts",
        title: "Patterns smart contracts RWA",
        body: "Cycle de vie mint, rachat et hooks de conformité pour des jetons adossés à des actifs.",
      },
      {
        kind: "trace",
        title: "Traçabilité & audits",
        body: "Lier attestations off-chain et état on-chain pour investisseurs et contrôle communautaire.",
      },
      {
        kind: "defi",
        title: "Intégrations DeFi",
        body: "Interfaces RWA avec prêt, pools de liquidité et paramètres de risque.",
      },
      {
        kind: "nft",
        title: "Certificats & preuve d'actif",
        body: "NFT et métadonnées structurées comme preuves d'origine, garde ou collatéral lié à l'impact.",
      },
      {
        kind: "sustain",
        title: "Finance durable",
        body: "Aligner les projets tokenisés sur l'ESG et les priorités de développement local.",
      },
    ],
  },
};

export const blockchainEcosystemIntro = {
  en: "Five networks. One focus: education, impact, and infrastructure built with and for Central Africa.",
  fr: "Cinq réseaux. Une même ambition : éducation, impact et infrastructure, avec et pour l'Afrique centrale.",
};

export const blockchainEcosystemUi = {
  en: {
    sectionTitle: "Blockchain ecosystems",
    hint: "Select a network to see how Ynuka Labs works with it.",
    sheetEyebrow: "Network",
    whatWeDo: "How we engage",
    visitSite: "Official site",
    openDetail: "Discover",
  },
  fr: {
    sectionTitle: "Écosystèmes blockchain",
    hint: "Choisissez un réseau pour voir comment Ynuka Labs y intervient.",
    sheetEyebrow: "Réseau",
    whatWeDo: "Notre engagement",
    visitSite: "Site officiel",
    openDetail: "Découvrir",
  },
};

export function getBlockchainCopy(lang: string): Record<BlockchainId, ChainContent> {
  return lang.startsWith("fr") ? fr : en;
}

export function getBlockchainUi(lang: string) {
  return lang.startsWith("fr") ? blockchainEcosystemUi.fr : blockchainEcosystemUi.en;
}

export function getBlockchainIntro(lang: string): string {
  return lang.startsWith("fr") ? blockchainEcosystemIntro.fr : blockchainEcosystemIntro.en;
}
