export type LearningCourse = {
  slug: string;
  title: string;
  summary: string;
  level: string;
  duration: string;
  type: "Cours" | "Module" | "Vidéo";
  image: string;
  accent: string;
  chapters: Array<{ title: string; description: string }>;
  supportUrl: string;
};

export const LEARNING_COURSES: LearningCourse[] = [
  {
    slug: "evolution-du-web",
    title: "L'évolution du Web",
    summary: "Du Web 1 au Web 4 : comprendre comment le web est devenu participatif, décentralisé et intelligent.",
    level: "Débutant",
    duration: "45 min",
    type: "Cours",
    image: "/resources/gallery/cardano-summit-2022/photo-1.jpg",
    accent: "from-sky-500/85 to-blue-950/90",
    supportUrl: "/resources/courses/evolution-du-web.pdf",
    chapters: [
      { title: "Web 1 : lire", description: "Les premiers sites statiques et la naissance de la publication sur internet." },
      { title: "Web 2 : participer", description: "Réseaux sociaux, plateformes et économie des données." },
      { title: "Web 3 : posséder", description: "Portefeuilles, blockchain et propriété numérique." },
      { title: "Web 4 : coopérer", description: "IA, agents et services web plus contextualisés." },
    ],
  },
  {
    slug: "registres-distribues-dlt",
    title: "Les registres distribués (DLT)",
    summary: "Les bases techniques d'un registre partagé : nœuds, consensus, immutabilité et confiance.",
    level: "Débutant",
    duration: "50 min",
    type: "Module",
    image: "/resources/gallery/cardano-africa-tech-summit/photo-2.jpg",
    accent: "from-teal-500/80 to-[#0f2847]/95",
    supportUrl: "/resources/courses/registres-distribues-dlt.pdf",
    chapters: [
      { title: "Pourquoi partager un registre ?", description: "Les limites des bases centralisées et les besoins de confiance." },
      { title: "Nœuds et réplication", description: "Comment un réseau conserve une même version de l'information." },
      { title: "Consensus", description: "Les mécanismes qui permettent aux participants de se mettre d'accord." },
      { title: "Cas d'usage", description: "Traçabilité, identité, paiements et données d'impact." },
    ],
  },
  {
    slug: "la-blockchain",
    title: "La Blockchain",
    summary: "Comprendre les blocs, les transactions, les portefeuilles et les règles qui sécurisent le réseau.",
    level: "Débutant",
    duration: "1 h 10 min",
    type: "Cours",
    image: "/resources/gallery/cardano-africa-tech-summit/photo-3.jpg",
    accent: "from-[#ffb800]/85 to-[#0f2847]/95",
    supportUrl: "/resources/courses/la-blockchain.pdf",
    chapters: [
      { title: "Une chaîne de blocs", description: "Structure d'un bloc, hachage et lien cryptographique." },
      { title: "Transactions et signatures", description: "Comment la cryptographie prouve l'autorisation d'une opération." },
      { title: "Portefeuilles", description: "Clés privées, phrases de récupération et bonnes pratiques de sécurité." },
      { title: "Opportunités blockchain", description: "Les usages à impact pour les communautés, entreprises et institutions." },
    ],
  },
  {
    slug: "blockchain-cardano",
    title: "La Blockchain Cardano",
    summary: "Découvrir Cardano, son modèle de preuve d'enjeu, son écosystème et les premiers gestes pratiques.",
    level: "Intermédiaire",
    duration: "1 h 20 min",
    type: "Vidéo",
    image: "/resources/gallery/cardano-africa-tech-summit/photo-4.jpg",
    accent: "from-indigo-500/80 to-[#071727]/95",
    supportUrl: "/resources/courses/blockchain-cardano.pdf",
    chapters: [
      { title: "Cardano en bref", description: "Vision, architecture et rôle de la recherche dans le protocole." },
      { title: "ADA et preuve d'enjeu", description: "Délégation, staking et contribution à la sécurité du réseau." },
      { title: "Outils de départ", description: "Portefeuille, explorateur de blocs et réflexes de sécurité." },
      { title: "Construire sur Cardano", description: "Projets, smart contracts et opportunités pour les builders." },
    ],
  },
  {
    slug: "opportunites-blockchain",
    title: "Les opportunités de la blockchain",
    summary: "Identifier des idées de projets utiles et les compétences à développer pour participer au Web3.",
    level: "Tous niveaux",
    duration: "35 min",
    type: "Module",
    image: "/resources/gallery/cardano-summit-2022/photo-3.jpg",
    accent: "from-emerald-500/80 to-[#0f2847]/95",
    supportUrl: "/resources/courses/opportunites-blockchain.pdf",
    chapters: [
      { title: "Des problèmes avant la technologie", description: "Partir d'un besoin concret plutôt que d'une solution à la mode." },
      { title: "Secteurs à impact", description: "Finance, éducation, agriculture, identité et économie créative." },
      { title: "Compétences recherchées", description: "Technique, produit, communauté et communication : créer son parcours." },
      { title: "Passer à l'action", description: "Choisir un projet, rejoindre un programme et construire un premier prototype." },
    ],
  },
];

export const getLearningCourse = (slug: string) => LEARNING_COURSES.find((course) => course.slug === slug);
