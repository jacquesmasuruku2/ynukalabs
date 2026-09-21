export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  image: string;
  description: string;
  portfolioUrl?: string;
  social: {
    x: string;
    telegram: string;
    linkedin: string;
  };
}

// Jacques Masuruku - a remplacé les valeurs "TO_ADD_*" par tes vraies données.
// Exemple image: "/team/boaz.jpg" (fichier dans public/team/)
// Exemple X: "https://x.com/username"
// Exemple Telegram: "https://t.me/username"
// Exemple LinkedIn: "https://www.linkedin.com/in/nom-d'utilisateur/"
export const teamMembers: TeamMember[] = [
  {
    slug: "bandu-balume-boaz",
    name: "BANDU BALUME Boaz",
    role: "Hub Leader",
    image: "/team/boaz.jpg",
    description: "Membre de l'équipe Ynuka Labs.",
    social: {
      x: "https://x.com/BoazB318",
      telegram: "TO_ADD_TELEGRAM_BOAZ",
      linkedin: "https://www.linkedin.com/in/boazb318/",
    },
  },
  {
    slug: "mupenda-byalahire-paul",
    name: "MUPENDA BYALAHIRE Paul",
    role: "Software Developer",
    image: "/team/Paul.jpg",
    description: "Membre de l'équipe Ynuka Labs.",
    social: {
      x: "/team/Paul.jpg",
      telegram: "TO_ADD_TELEGRAM_PAUL",
      linkedin: "TO_ADD_LINKEDIN_PAUL",
    },
  },
  {
    slug: "kanjira-musagara-martin",
    name: "KANJIRA MUSAGARA Martin",
    role: "Marketing Manager",
    image: "/team/martin.jpg",
    description: "Membre de l'équipe Ynuka Labs.",
    social: {
      x: "https://x.com/martin_musagara",
      telegram: "TO_ADD_TELEGRAM_KANJIRA_MARTIN",
      linkedin: "https://www.linkedin.com/in/martin-musagara-b0139422a/",
    },
  },
  {
    slug: "olivier-mwatsimulamo",
    name: "Olivier MWATSIMULAMO",
    role: "Developer & Trainer",
    image: "/team/olivier.png",
    description: "Membre de l'équipe Ynuka Labs.",
    social: {
      x: "https://x.com/OlivierMWATSIM1",
      telegram: "TO_ADD_TELEGRAM_KANJIRA_MARTIN",
      linkedin: "https://www.linkedin.com/in/olivier-mwatsimulamo-389b51233",
    },
  },
    {
    slug: "akilimali-innocent",
    name: "AKILIMALI Innocent",
    role: "Software Developer",
    image: "TO_ADD_IMAGE_AKILIMALI",
    description: "Membre de l'équipe Ynuka Labs.",
    social: {
      x: "TO_ADD_X_AKILIMALI",
      telegram: "TO_ADD_TELEGRAM_AKILIMALI",
      linkedin: "TO_ADD_LINKEDIN_AKILIMALI",
    },
  },
  {
    slug: "jacques-masuruku",
    name: "Jacques MASURUKU",
    role: "Developer/Writter",
    // Ma photo statique qui est dans le dossier  `public/team/Jacques.jpg`
    image: "/team/Jacques.jpg",
    description: "Membre de l'équipe Ynuka Labs.",
    social: {
      x: "https://x.com/MapenziJacques",
      telegram: "https://t.me/JacquesMasuruku",
      linkedin: "https://www.linkedin.com/in/jacques-mapenzi-masuruku-73266b245/",
    },
  },
  {
    slug: "amida-musa",
    name: "Amida MUSA",
    role: "Marketing Manager",
    image: "TO_ADD_IMAGE_BOTEMBE_AMIDA",
    description: "Membre de l'équipe Ynuka Labs.",
    social: {
      x: "TO_ADD_X_BOTEMBE_AMIDA",
      telegram: "TO_ADD_TELEGRAM_BOTEMBE_AMIDA",
      linkedin: "TO_ADD_LINKEDIN_BOTEMBE_AMIDA",
    },
  },
  {
    slug: "imara-kabiona-abel",
    name: "IMARA KABIONA Abel",
    role: "Design and Media",
    image: "TO_ADD_IMAGE_IMARA_ABEL",
    description: "Membre de l'équipe Ynuka Labs.",
    social: {
      x: "TO_ADD_X_IMARA_ABEL",
      telegram: "TO_ADD_TELEGRAM_IMARA_ABEL",
      linkedin: "TO_ADD_LINKEDIN_IMARA_ABEL",
    },
  },
{
  slug: "olivier-rishi",
  name: "Olivier RISHI",
  role: "Logistic Manager",
  image: "TO_ADD_IMAGE_IMARA_ABEL",
  description: "Membre de l'équipe Ynuka Labs.",
  social: {
    x: "TO_ADD_X_IMARA_ABEL",
    telegram: "TO_ADD_TELEGRAM_IMARA_ABEL",
    linkedin: "TO_ADD_LINKEDIN_IMARA_ABEL",
  },
},
{
  slug: "marcellin-mulezi",
  name: "Marcellin MULEZI",
  role: "Developer & Trainer",
  image: "TO_ADD_IMAGE_IMARA_ABEL",
  description: "Membre de l'équipe Ynuka Labs.",
  social: {
    x: "TO_ADD_X_IMARA_ABEL",
    telegram: "TO_ADD_TELEGRAM_IMARA_ABEL",
    linkedin: "TO_ADD_LINKEDIN_IMARA_ABEL",
  },
},
{
  slug: "jonas-makeke",
  name: "Jonas Makeke",
  role: "Communication Manager",
  image: "/team/Jonas.png",
  description: "Membre de l'équipe Ynuka Labs.",
  social: {
    x: "TO_ADD_X_JONAS",
    telegram: "TO_ADD_TELEGRAM_JONAS",
    linkedin: "TO_ADD_LINKEDIN_JONAS",
  },
},
{
  slug: "rachel-ciza",
  name: "Rachel CIZA",
  role: "Trainer",
  image: "/team/rachel.jpg",
  description: "Membre de l'équipe Ynuka Labs.",
  social: {
    x: "TO_ADD_X_IMARA_ABEL",
    telegram: "TO_ADD_TELEGRAM_IMARA_ABEL",
    linkedin: "TO_ADD_LINKEDIN_IMARA_ABEL",
  },
},
{
  slug: "pablo-balonda",
  name: "Pablo BALONDA",
  role: "Developer",
  image: "TO_ADD_IMAGE_IMARA_ABEL",
  description: "Membre de l'équipe Ynuka Labs.",
  social: {
    x: "TO_ADD_X_IMARA_ABEL",
    telegram: "TO_ADD_TELEGRAM_IMARA_ABEL",
    linkedin: "TO_ADD_LINKEDIN_IMARA_ABEL",
  },
},
{
  slug: "jean-claude-niyo",
  name: "Jean Claude NIYO",
  role: "IT & Advicer",
  image: "TO_ADD_IMAGE_IMARA_ABEL",
  description: "Membre de l'équipe Ynuka Labs.",
  social: {
    x: "TO_ADD_X_IMARA_ABEL",
    telegram: "TO_ADD_TELEGRAM_IMARA_ABEL",
    linkedin: "TO_ADD_LINKEDIN_IMARA_ABEL",
  },
},
{
  slug: "jules-vamuleke",
  name: "Jules VAMULEKE",
  role: "Advicer & Trainer",
  image: "TO_ADD_IMAGE_IMARA_ABEL",
  description: "Membre de l'équipe Ynuka Labs.",
  social: {
    x: "TO_ADD_X_IMARA_ABEL",
    telegram: "TO_ADD_TELEGRAM_IMARA_ABEL",
    linkedin: "TO_ADD_LINKEDIN_IMARA_ABEL",
  },
},
];

export function slugifyTeamName(name: string): string {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function preferSocial(primary?: string, fallback?: string): string {
  if (primary?.startsWith("http")) return primary;
  if (fallback?.startsWith("http")) return fallback;
  if (primary && !primary.startsWith("TO_ADD_")) return primary;
  if (fallback && !fallback.startsWith("TO_ADD_")) return fallback;
  return primary || fallback || "";
}

function preferImage(primary?: string, fallback?: string): string {
  if (primary?.trim() && !primary.startsWith("TO_ADD_") && !primary.startsWith("http://TO_ADD")) {
    return primary;
  }
  if (fallback?.trim() && !fallback.startsWith("TO_ADD_") && !fallback.startsWith("http://TO_ADD")) {
    return fallback;
  }
  return primary || fallback || "";
}

/** Fusionne équipe locale + admin. Même slug → admin prioritaire, champs vides gardent le local. */
export function mergeTeamMembers(local: TeamMember[], fromAdmin: TeamMember[]): TeamMember[] {
  const bySlug = new Map<string, TeamMember>();

  for (const m of local) {
    const slug = m.slug || slugifyTeamName(m.name);
    if (!slug || !m.name) continue;
    bySlug.set(slug, { ...m, slug });
  }

  for (const m of fromAdmin) {
    const slug = m.slug || slugifyTeamName(m.name);
    if (!slug || !m.name) continue;
    const prev = bySlug.get(slug);
    bySlug.set(slug, {
      slug,
      name: m.name || prev?.name || "",
      role: m.role || prev?.role || "",
      image: preferImage(m.image, prev?.image),
      description: m.description?.trim() ? m.description : prev?.description || "",
      portfolioUrl: m.portfolioUrl?.startsWith("http")
        ? m.portfolioUrl
        : prev?.portfolioUrl || m.portfolioUrl || "",
      social: {
        x: preferSocial(m.social?.x, prev?.social?.x),
        telegram: preferSocial(m.social?.telegram, prev?.social?.telegram),
        linkedin: preferSocial(m.social?.linkedin, prev?.social?.linkedin),
      },
    });
  }

  return Array.from(bySlug.values()).filter(
    (m) =>
      !m.name.toLowerCase().includes("frederic samvura") &&
      !m.name.toLowerCase().includes("frédéric samvura")
  );
}

export function mapAdminTeamMember(item: {
  slug?: string;
  name?: string;
  role?: string;
  image?: string;
  description?: string;
  portfolioUrl?: string;
  social?: { x?: string; telegram?: string; linkedin?: string };
}): TeamMember {
  return {
    slug: item.slug || slugifyTeamName(item.name || ""),
    name: item.name || "",
    role: item.role || "",
    image: item.image || "",
    description: item.description || "",
    portfolioUrl: item.portfolioUrl || "",
    social: {
      x: item.social?.x || "",
      telegram: item.social?.telegram || "",
      linkedin: item.social?.linkedin || "",
    },
  };
}

