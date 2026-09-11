import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BlockchainEcosystemSection from "@/components/BlockchainEcosystemSection";
import { EcosystemValidatorsSection } from "@/components/EcosystemValidatorsSection";
import { EcosystemEventsPreview } from "@/components/EcosystemEventsPreview";
import OpportunitiesSection from "@/components/OpportunitiesSection";
import { CommunityPageBody } from "@/pages/Community";

/** Décalage navbar — même logique que la page À propos */
const NAVBAR_SCROLL_OFFSET = 96;

/**
 * Page Écosystème unifiée (comme /about) :
 * sous-menus = ancres sur la même page, scroll libre entre sections.
 */
const Blockchains = () => {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.replace("#", "").trim();
    const navbarOffset = NAVBAR_SCROLL_OFFSET;

    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const scrollToHash = () => {
      if (cancelled) return;
      const target = document.getElementById(decodeURIComponent(hash));
      if (target) {
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarOffset;
        window.scrollTo({ top: targetTop, behavior: "smooth" });
        return;
      }
      // Contenu asynchrone (événements, etc.) : réessayer brièvement
      if (attempts++ < 30) {
        window.requestAnimationFrame(scrollToHash);
      }
    };

    // Laisse le layout peindre avant le premier scroll (comme un ancrage fiable)
    const timer = window.setTimeout(scrollToHash, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background pt-20">
      <BlockchainEcosystemSection lang={i18n.language} showDivider={false} />
      <EcosystemValidatorsSection showDivider={false} />
      <EcosystemEventsPreview showDivider={false} />
      <OpportunitiesSection showHeading />
      <div id="community" className="scroll-mt-28">
        <CommunityPageBody />
      </div>
    </div>
  );
};

export default Blockchains;
