import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://ynukalabs.com';
const DEFAULT_TITLE = 'Ynuka Labs | Web3, IA et innovation en RD Congo';
const DEFAULT_DESCRIPTION = 'Ynuka Labs développe les compétences et les projets numériques en RD Congo grâce à la formation, la communauté, la blockchain, l’IA et la collaboration.';

const pages: Record<string, { title: string; description: string }> = {
  '/': { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
  '/about': { title: 'À propos de Ynuka Labs | Innovation numérique en RD Congo', description: 'Découvrez la mission, la vision et l’équipe de Ynuka Labs pour développer l’innovation numérique en RD Congo.' },
  '/projects': { title: 'Projets Web3 et numériques | Ynuka Labs', description: 'Explorez les projets Web3, blockchain et numériques portés par Ynuka Labs et sa communauté.' },
  '/events': { title: 'Événements et formations | Ynuka Labs', description: 'Participez aux événements, rencontres et formations de Ynuka Labs autour du Web3 et de l’innovation.' },
  '/opportunities': { title: 'Opportunités | Ynuka Labs', description: 'Découvrez les opportunités, programmes et appels à participation proposés par Ynuka Labs.' },
  '/blog': { title: 'Actualités et analyses Web3 | Ynuka Labs', description: 'Lisez les actualités, analyses et ressources de Ynuka Labs sur le Web3, la blockchain et l’intelligence artificielle.' },
  '/team': { title: 'Équipe Ynuka Labs | Experts du numérique en RD Congo', description: 'Rencontrez l’équipe de Ynuka Labs, engagée pour la formation et l’innovation numérique en RD Congo.' },
  '/community': { title: 'Communauté Ynuka Labs | Web3 en RD Congo', description: 'Rejoignez la communauté Ynuka Labs et développez vos compétences dans l’écosystème Web3.' },
  '/resources': { title: 'Ressources numériques et Web3 | Ynuka Labs', description: 'Accédez aux ressources et outils sélectionnés par Ynuka Labs pour apprendre et construire dans le numérique.' },
  '/partners': { title: 'Partenaires de Ynuka Labs | Innovation et collaboration', description: 'Découvrez les partenaires qui contribuent aux projets et programmes d’innovation de Ynuka Labs.' },
  '/blockchains': { title: 'Blockchain et Web3 | Ynuka Labs', description: 'Explorez les écosystèmes blockchain et les initiatives Web3 suivis par Ynuka Labs.' },
  '/validators': { title: 'Validation blockchain | Ynuka Labs', description: 'Découvrez les activités de validation blockchain et les initiatives techniques de Ynuka Labs.' },
  '/documentation': { title: 'Documentation | Ynuka Labs', description: 'Consultez la documentation et les guides techniques de Ynuka Labs.' },
  '/tools': { title: 'Outils numériques et Web3 | Ynuka Labs', description: 'Utilisez les outils numériques et Web3 proposés par Ynuka Labs.' },
  '/onboarding': { title: 'Programme d’intégration | Ynuka Labs', description: 'Découvrez le programme d’intégration de Ynuka Labs pour rejoindre la communauté et ses projets.' },
  '/gallery': { title: 'Galerie | Ynuka Labs', description: 'Découvrez les images et moments forts des activités de Ynuka Labs.' },
  '/goma-drep': { title: 'Goma DRep | Ynuka Labs', description: 'Profil de GOMA-DRep, le DRep de Goma Hub : objectifs, motivations, liens et délégation sur Cardano.' },
  '/presentation': { title: 'Présentation | Ynuka Labs', description: 'Présentation de Ynuka Labs, ses programmes, ses projets et sa vision de l’innovation numérique.' },
  '/catalog': { title: 'Catalogue | Ynuka Labs', description: 'Explorez le catalogue des formations, services et ressources de Ynuka Labs.' },
  '/luma-events': { title: 'Événements Ynuka Labs | Luma', description: 'Retrouvez les événements et rencontres de Ynuka Labs.' },
  '/contact': { title: 'Contact | Ynuka Labs', description: 'Contactez Ynuka Labs pour parler de formation, de collaboration, de projets et d’innovation numérique.' },
  '/services': { title: 'Services numériques et Web3 | Ynuka Labs', description: 'Découvrez les services de Ynuka Labs en formation, accompagnement, blockchain et innovation numérique.' },
  '/soutenir': { title: 'Soutenir Ynuka Labs | Contribuer à l’innovation en RD Congo', description: 'Soutenez les programmes de Ynuka Labs et contribuez au développement des compétences numériques en RD Congo.' },
};

function upsertMeta(name: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

function upsertProperty(property: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isPrivate = pathname.startsWith('/admin') || pathname === '/auth/callback';
    const page = pages[pathname] || (pathname.startsWith('/blog/') ? { title: 'Article Web3 | Ynuka Labs', description: 'Découvrez cet article de Ynuka Labs sur le Web3, la blockchain et l’innovation numérique.' } : pathname.startsWith('/events/') ? { title: 'Événement Ynuka Labs | Web3 et innovation', description: 'Découvrez cet événement organisé par Ynuka Labs.' } : pathname.startsWith('/projects/') ? { title: 'Projet numérique | Ynuka Labs', description: 'Découvrez ce projet numérique porté par Ynuka Labs.' } : pathname.startsWith('/opportunities/') ? { title: 'Opportunité | Ynuka Labs', description: 'Découvrez cette opportunité proposée par Ynuka Labs.' } : pathname.startsWith('/team/') ? { title: 'Membre de l’équipe | Ynuka Labs', description: 'Découvrez le profil d’un membre de l’équipe Ynuka Labs.' } : { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION });
    const title = isPrivate ? 'Espace privé | Ynuka Labs' : page.title;
    const description = isPrivate ? 'Espace privé de Ynuka Labs.' : page.description;
    const canonical = `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;

    document.title = title;
    upsertMeta('description', description);
    upsertMeta('robots', isPrivate ? 'noindex, nofollow, noarchive' : 'index, follow, max-image-preview:large');
    let canonicalElement = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.rel = 'canonical';
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.href = canonical;
    upsertProperty('og:title', title);
    upsertProperty('og:description', description);
    upsertProperty('og:url', canonical);
    upsertProperty('og:image', `${SITE_URL}/logo.png`);
    upsertProperty('og:type', pathname.startsWith('/blog/') ? 'article' : 'website');
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);
    upsertMeta('twitter:image', `${SITE_URL}/logo.png`);
  }, [pathname]);

  return null;
}