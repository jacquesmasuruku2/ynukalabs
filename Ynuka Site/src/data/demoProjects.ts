/**
 * Projets fictifs pour peupler la page /projects.
 *
 * Pour les retirer quand l'admin a des projets réels :
 *   → passer `USE_DEMO_PROJECTS` à `false`
 *   (ou supprimer ce fichier et l'import dans Projects.tsx)
 */
export const USE_DEMO_PROJECTS = true;

export type DemoProject = {
  id: string;
  slug: string;
  titleKey: string;
  descKey: string;
  /** Doit matcher les filtres navbar : Education | Environnement | Blockchain */
  category: "Education" | "Environnement" | "Blockchain";
  imageUrl: string;
  liveUrl: string;
  githubUrl: string | null;
};

export const DEMO_PROJECTS: DemoProject[] = [
  {
    id: "demo-edu-1",
    slug: "educhain",
    titleKey: "projects.demo.edu1Title",
    descKey: "projects.demo.edu1Desc",
    category: "Education",
    imageUrl: "/projects/mtidano.jpg",
    liveUrl: "https://ynukalabs.com",
    githubUrl: "https://github.com/YnukaLabs",
  },
  {
    id: "demo-edu-2",
    slug: "onboarding-program",
    titleKey: "projects.demo.edu2Title",
    descKey: "projects.demo.edu2Desc",
    category: "Education",
    imageUrl: "/projects/mtidano.jpg",
    liveUrl: "https://ynukalabs.com/onboarding",
    githubUrl: null,
  },
  {
    id: "demo-env-1",
    slug: "mtidano-nftree",
    titleKey: "projects.demo.env1Title",
    descKey: "projects.demo.env1Desc",
    category: "Environnement",
    imageUrl: "/projects/mtidano.jpg",
    liveUrl: "https://ynukalabs.com",
    githubUrl: "https://github.com/YnukaLabs",
  },
  {
    id: "demo-env-2",
    slug: "volcano-dao",
    titleKey: "projects.demo.env2Title",
    descKey: "projects.demo.env2Desc",
    category: "Environnement",
    imageUrl: "/projects/mtidano.jpg",
    liveUrl: "https://ynukalabs.com",
    githubUrl: null,
  },
  {
    id: "demo-chain-1",
    slug: "kivupay",
    titleKey: "projects.demo.chain1Title",
    descKey: "projects.demo.chain1Desc",
    category: "Blockchain",
    imageUrl: "/projects/mtidano.jpg",
    liveUrl: "https://ynukalabs.com",
    githubUrl: "https://github.com/YnukaLabs",
  },
  {
    id: "demo-chain-2",
    slug: "stakepool-goma",
    titleKey: "projects.demo.chain2Title",
    descKey: "projects.demo.chain2Desc",
    category: "Blockchain",
    imageUrl: "/projects/hero.webp",
    liveUrl: "https://ynukalabs.com",
    githubUrl: "https://github.com/YnukaLabs",
  },
];
