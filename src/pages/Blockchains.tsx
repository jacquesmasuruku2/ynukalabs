import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BlockchainEcosystemSection from "@/components/BlockchainEcosystemSection";
import { EcosystemValidatorsSection } from "@/components/EcosystemValidatorsSection";
import { EcosystemEventsPreview } from "@/components/EcosystemEventsPreview";
import { CommunityPageBody } from "@/pages/Community";

/** Décalage pour navbar fixe (aligné sur la page About) */
const NAVBAR_SCROLL_OFFSET = 96;

/**
 * Page Écosystème unifiée : Blockchains + sections ancrées (#validators, #events, #community)
 * pour un défilement continu comme le menu « À propos ».
 */
const Blockchains = () => {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.replace("#", "").trim();
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const target = document.getElementById(decodeURIComponent(hash));
    if (!target) return;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - NAVBAR_SCROLL_OFFSET;
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  }, [location.hash, location.pathname]);

  return (
    <div className="min-h-screen bg-background pt-20">
      <BlockchainEcosystemSection lang={i18n.language} showDivider={false} />
      <EcosystemValidatorsSection showDivider={false} />
      <EcosystemEventsPreview showDivider={false} />
      <div id="community" className="scroll-mt-24">
        <CommunityPageBody />
      </div>
    </div>
  );
};

export default Blockchains;
