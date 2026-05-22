export type BlockchainId =
  | "cardano"
  | "polkadot"
  | "apexFusion"
  | "xcavate"
  | "midnight"
  | "singularitynet"
  | "safrochain";

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
  /** Vide = initiales sur dégradé dans l’UI */
  logoUrl: string;
  websiteUrl?: string;
  accent: string;
  activities: ChainActivity[];
}

export const BLOCKCHAIN_ORDER: BlockchainId[] = [
  "cardano",
  "polkadot",
  "apexFusion",
  "xcavate",
  "midnight",
  "singularitynet",
  "safrochain",
];

const en: Record<BlockchainId, ChainContent> = {
  cardano: {
    name: "Cardano",
    tagline: "Research-driven L1 — education, stake pools & native assets",
    description:
      "Cardano is Ynuka Labs’ primary chain for production programs: stake-pool operations, Catalyst-aligned innovation, and sustainability-linked digital assets.",
    logoUrl: "https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/ada.svg",
    websiteUrl: "https://www.cardano.org",
    accent: "from-emerald-500/25 to-teal-600/10",
    activities: [
      {
        kind: "contracts",
        title: "Smart contract development",
        body: "Plutus and ecosystem tooling for community apps, certificates, and on-chain rules adapted to local needs.",
      },
      {
        kind: "nft",
        title: "NFT & impact projects",
        body: "NFT-backed initiatives such as NFTree / Mtidano for transparent reforestation and donor engagement.",
      },
      {
        kind: "defi",
        title: "DeFi integrations",
        body: "Workshops on wallets, DEX concepts, staking, and risk-aware participation across the Cardano DeFi stack.",
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
  polkadot: {
    name: "Polkadot",
    tagline: "Heterogeneous sharding — parachains, DOT & cross-chain messaging",
    description:
      "We introduce Polkadot’s relay-chain model, parachains, and XCM so teams understand secure interoperability and shared security trade-offs.",
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
        body: "Overview of asset standards and use cases where parachains specialize in identity, gaming, or RWAs.",
      },
      {
        kind: "sustain",
        title: "Governance & sustainability",
        body: "Open governance culture, treasury programs, and aligning long-term network health with community goals.",
      },
    ],
  },
  apexFusion: {
    name: "Apex Fusion",
    tagline: "Cross-chain protocol — validators & interoperability",
    description:
      "Ynuka Labs operates validator infrastructure for Apex Fusion, supporting secure cross-chain messaging and ecosystem growth from Central Africa.",
    logoUrl: "/partners/apex.png",
    websiteUrl: "https://www.apexfusion.org",
    accent: "from-cyan-500/25 to-blue-700/15",
    activities: [
      {
        kind: "trace",
        title: "Validator operations",
        body: "Running and monitoring validator nodes with uptime, key hygiene, and incident response practices.",
      },
      {
        kind: "contracts",
        title: "Protocol integration",
        body: "Mapping how Apex Fusion interfaces with external chains and what builders need for safe integrations.",
      },
      {
        kind: "defi",
        title: "Liquidity & bridges",
        body: "Education on bridge risks, liquidity provision, and responsible use of cross-chain assets.",
      },
      {
        kind: "nft",
        title: "Ecosystem NFT use cases",
        body: "Where NFTs and credentials make sense in a multi-chain workflow tied to real community programs.",
      },
      {
        kind: "sustain",
        title: "Regional footprint",
        body: "Positioning African operators in global interoperability narratives and resilient infrastructure.",
      },
    ],
  },
  xcavate: {
    name: "XCAVATE",
    tagline: "Real-world assets & on-chain collateralization",
    description:
      "We collaborate on XCAVATE-aligned use cases: tokenized real-world assets, transparent vault mechanics, and education for responsible RWA adoption.",
    logoUrl: "https://www.xcavate.io/_next/image?url=%2Fimages%2Fxcavate_logo.png&w=256&q=75",
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
  midnight: {
    name: "Midnight",
    tagline: "Data protection blockchain — privacy-preserving DApps",
    description:
      "Midnight supports compliant, privacy-first applications. Ynuka Labs explores how selective disclosure and ZK techniques serve NGOs, identity, and regulated pilots.",
    logoUrl: "data:image/png;base64,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",
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
        body: "Privacy-preserving credentials for cohorts, KYC-minimized access, and program eligibility.",
      },
      {
        kind: "defi",
        title: "Confidential DeFi concepts",
        body: "When shielded flows matter for treasury safety and how to teach risks honestly.",
      },
      {
        kind: "sustain",
        title: "Responsible deployment",
        body: "Human-rights-aware design for civil society and cross-border collaboration in sensitive contexts.",
      },
    ],
  },
  singularitynet: {
    name: "SingularityNET",
    tagline: "Decentralized AI — agents, marketplace & open collaboration",
    description:
      "We connect blockchain builders with SingularityNET’s vision: decentralized AI services, agent economies, and open networks where models and data are governed transparently.",
    logoUrl: "https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/agi.svg",
    websiteUrl: "https://singularitynet.io",
    accent: "from-violet-500/25 to-fuchsia-600/10",
    activities: [
      {
        kind: "contracts",
        title: "On-chain AI services",
        body: "How agents register, settle payments, and expose APIs through blockchain-backed marketplaces.",
      },
      {
        kind: "trace",
        title: "Provenance & governance",
        body: "Tracing model usage, versioning, and community governance of AI resources on decentralized stacks.",
      },
      {
        kind: "defi",
        title: "Token & incentive design",
        body: "AGIX-era tokenomics literacy: staking, access, and aligning contributors with network growth.",
      },
      {
        kind: "nft",
        title: "Digital assets & IP",
        body: "Linking NFTs, licenses, and AI outputs where ownership and royalties need clear rules.",
      },
      {
        kind: "sustain",
        title: "Ethics & sustainability",
        body: "Workshops on energy-aware AI, bias, and building for the Global South with open tooling.",
      },
    ],
  },
  safrochain: {
    name: "Safrochain",
    tagline: "Africa-focused L1 — validators & local ecosystem",
    description:
      "Safrochain anchors Ynuka Labs’ commitment to African-led infrastructure: validator participation, community onboarding, and use cases that fit regional realities.",
    logoUrl: "https://safrochain.com/lovable-uploads/b0a413cc-c8cb-4914-ae6f-a2cc1556efc5.png",
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
};

const fr: Record<BlockchainId, ChainContent> = {
  cardano: {
    name: "Cardano",
    tagline: "L1 orientée recherche — formation, stake pools & actifs natifs",
    description:
      "Cardano est la chaîne principale de Ynuka Labs : stake pools, innovation alignée Catalyst et actifs numériques liés à la durabilité.",
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
        title: "NFT & projets d’impact",
        body: "Initiatives NFT comme NFTree / Mtidano pour la reforestation transparente et l’engagement des donateurs.",
      },
      {
        kind: "defi",
        title: "Intégrations DeFi",
        body: "Ateliers sur portefeuilles, DEX, staking et participation maîtrisée des risques sur la DeFi Cardano.",
      },
      {
        kind: "trace",
        title: "Traçabilité & transparence",
        body: "Métadonnées on-chain et preuves légères pour subventions, cohortes et audit de projets terrain.",
      },
      {
        kind: "sustain",
        title: "Cas d’usage durables",
        body: "Preuves vérifiables pour climat et agriculture : plantation, résultats de cohortes et responsabilité partenaires.",
      },
    ],
  },
  polkadot: {
    name: "Polkadot",
    tagline: "Sharding hétérogène — parachains, DOT & messagerie cross-chain",
    description:
      "Nous présentons le modèle relay-chain, les parachains et XCM pour comprendre l’interopérabilité sécurisée et les compromis de sécurité partagée.",
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
        body: "Comment la messagerie type XCM permet des preuves d’état entre zones sans dupliquer les hypothèses de confiance.",
      },
      {
        kind: "nft",
        title: "NFT & actifs sur parachains",
        body: "Standards d’actifs et cas d’usage où les parachains se spécialisent (identité, jeu, RWA).",
      },
      {
        kind: "sustain",
        title: "Gouvernance & durabilité",
        body: "Gouvernance ouverte, trésor communautaire et alignement long terme sur la santé du réseau.",
      },
    ],
  },
  apexFusion: {
    name: "Apex Fusion",
    tagline: "Protocole cross-chain — validateurs & interopérabilité",
    description:
      "Ynuka Labs exploite une infrastructure validateur pour Apex Fusion, au service de la messagerie cross-chain sécurisée et de l’écosystème depuis l’Afrique centrale.",
    logoUrl: en.apexFusion.logoUrl,
    websiteUrl: en.apexFusion.websiteUrl,
    accent: en.apexFusion.accent,
    activities: [
      {
        kind: "trace",
        title: "Exploitation de validateurs",
        body: "Nœuds validateurs, surveillance, hygiène des clés et gestion d’incidents.",
      },
      {
        kind: "contracts",
        title: "Intégration protocolaire",
        body: "Cartographie des interfaces avec d’autres chaînes et prérequis pour des intégrations sûres.",
      },
      {
        kind: "defi",
        title: "Liquidité & ponts",
        body: "Sensibilisation aux risques des ponts, à la liquidité et à l’usage responsable des actifs cross-chain.",
      },
      {
        kind: "nft",
        title: "Cas NFT écosystème",
        body: "Où NFT et preuves ont du sens dans des parcours multi-chaînes liés aux programmes communautaires.",
      },
      {
        kind: "sustain",
        title: "Ancrage régional",
        body: "Placer des opérateurs africains dans les récits d’interopérabilité mondiale et d’infrastructure résiliente.",
      },
    ],
  },
  xcavate: {
    name: "XCAVATE",
    tagline: "Actifs réels & collatéralisation on-chain",
    description:
      "Nous travaillons sur des cas alignés XCAVATE : actifs réels tokenisés, mécanismes de coffres transparents et formation à une adoption RWA responsable.",
    logoUrl: "https://www.xcavate.io/_next/image?url=%2Fimages%2Fxcavate_logo.png&w=256&q=75",
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
        title: "Certificats & preuve d’actif",
        body: "NFT et métadonnées structurées comme preuves d’origine, garde ou collatéral lié à l’impact.",
      },
      {
        kind: "sustain",
        title: "Finance durable",
        body: "Aligner les projets tokenisés sur l’ESG et les priorités de développement local.",
      },
    ],
  },
  midnight: {
    name: "Midnight",
    tagline: "Blockchain de protection des données — DApps respectueuses de la vie privée",
    description:
      "Midnight permet des applications conformes et orientées confidentialité. Ynuka Labs explore la divulgation sélective et les ZK pour ONG, identité et pilotes régulés.",
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
        body: "Concilier auditabilité et vie privée : ce que voit l’auditeur, ce que contrôle l’utilisateur.",
      },
      {
        kind: "nft",
        title: "Credentials & attestations",
        body: "Preuves respectueuses de la vie privée pour cohortes, accès à KYC minimal et éligibilité.",
      },
      {
        kind: "defi",
        title: "Concepts DeFi confidentiels",
        body: "Quand les flux protégés sécurisent une trésorerie et comment enseigner les risques honnêtement.",
      },
      {
        kind: "sustain",
        title: "Déploiement responsable",
        body: "Design sensible aux droits humains pour la société civile et la coopération transfrontalière.",
      },
    ],
  },
  singularitynet: {
    name: "SingularityNET",
    tagline: "IA décentralisée — agents, marketplace & collaboration ouverte",
    description:
      "Nous rapprochons les builders blockchain de la vision SingularityNET : services d’IA décentralisés, économies d’agents et réseaux ouverts à gouvernance transparente.",
    logoUrl: en.singularitynet.logoUrl,
    websiteUrl: en.singularitynet.websiteUrl,
    accent: en.singularitynet.accent,
    activities: [
      {
        kind: "contracts",
        title: "Services IA on-chain",
        body: "Enregistrement d’agents, règlements et exposition d’API via des marketplaces blockchain.",
      },
      {
        kind: "trace",
        title: "Provenance & gouvernance",
        body: "Traçage d’usage des modèles, versions et gouvernance communautaire des ressources IA.",
      },
      {
        kind: "defi",
        title: "Jetons & incitations",
        body: "Culture tokenomique AGIX : staking, accès et alignement contributeurs / croissance du réseau.",
      },
      {
        kind: "nft",
        title: "Actifs numériques & PI",
        body: "Lier NFT, licences et sorties d’IA lorsque propriété et redevances doivent être claires.",
      },
      {
        kind: "sustain",
        title: "Éthique & durabilité",
        body: "Ateliers sur IA sobre en énergie, biais et construction pour le Global Sud avec outils ouverts.",
      },
    ],
  },
  safrochain: {
    name: "Safrochain",
    tagline: "L1 tournée vers l’Afrique — validateurs & écosystème local",
    description:
      "Safrochain incarne l’engagement de Ynuka Labs pour une infrastructure africaine : participation validateur, onboarding communautaire et cas d’usage adaptés à la région.",
    logoUrl: "https://safrochain.com/lovable-uploads/b0a413cc-c8cb-4914-ae6f-a2cc1556efc5.png",
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
        body: "Patterns d’applications sur Safrochain pour produits locaux, registres et dApps d’intérêt général.",
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
        body: "Lier l’activité on-chain à l’agriculture, l’énergie et l’emploi des jeunes dans la région des Grands Lacs.",
      },
    ],
  },
};

export const blockchainEcosystemIntro = {
  en: "We build across multiple blockchain ecosystems to deliver scalable, transparent, and sustainable solutions.",
  fr: "Nous construisons sur plusieurs écosystèmes blockchain pour livrer des solutions évolutives, transparentes et durables.",
};

export const blockchainEcosystemUi = {
  en: {
    sectionTitle: "Blockchain ecosystems",
    sectionKicker: "Networks we work with",
    hint: "Select a network to see how Ynuka Labs engages with it.",
    sheetEyebrow: "Network detail",
    whatWeDo: "What we do with this blockchain",
    visitSite: "Visit site",
  },
  fr: {
    sectionTitle: "Écosystèmes blockchain",
    sectionKicker: "Réseaux avec lesquels nous travaillons",
    hint: "Choisissez un réseau pour voir comment Ynuka Labs s’y engage.",
    sheetEyebrow: "Détail du réseau",
    whatWeDo: "Ce que nous faisons sur cette blockchain",
    visitSite: "Visiter le site",
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
