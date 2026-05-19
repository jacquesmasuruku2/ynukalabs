import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { getBlockchainCopy } from "@/data/blockchainEcosystem";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const ChainLogoSmall = ({
  url,
  name,
  accent,
}: {
  url: string;
  name: string;
  accent: string;
}) => {
  const [failed, setFailed] = useState(false);

  if (!url?.trim() || failed) {
    return (
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br font-display text-sm font-bold text-white shadow-inner",
          accent
        )}
        aria-hidden
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      className="h-10 w-10 object-contain drop-shadow-md"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

type DashboardMetric = {
  label: string;
  value: string;
};

type ValidatorDashboard = {
  title: string;
  titleColorClass: string;
  subtitle?: string;
  delegations?: number | string;
  totalStake?: { value: string; unit: string };
  metrics: DashboardMetric[];
  blocks?: string;
  epoch?: string;
  timeLeft?: string;
  nextBlock?: string;
  progressLabel?: string;
  progressKnobLeftPct?: number;
};

/** Section ancrable #validators — réutilisée sur /validators et page Écosystème unifiée */
export const EcosystemValidatorsSection = ({
  showHeading = true,
  showDivider = true,
}: {
  showHeading?: boolean;
  showDivider?: boolean;
}) => {
  const { t, i18n } = useTranslation();
  const copy = getBlockchainCopy(i18n.language);

  const validators = [
    {
      id: "cardano" as const,
      name: "Cardano",
      logoUrl: copy.cardano.logoUrl,
      accent: copy.cardano.accent,
      description: t("validators.cardanoDesc"),
      dashboard: {
        title: "Goma pool at ISDR-GL",
        titleColorClass: "text-primary",
        subtitle: "Goma pool at lsdrgin in DRC",
        delegations: 104,
        totalStake: { value: "753,8411", unit: "A" },
        metrics: [
          { label: t("validators.saturation"), value: "1%" },
          { label: t("validators.margin"), value: "0%" },
          { label: t("validators.pledge"), value: "25K A" },
          { label: t("validators.fixedCost"), value: "340 A" },
        ],
        blocks: "130",
        progressLabel: t("validators.delegationProgress"),
        epoch: "62",
        timeLeft: t("validators.timeLeft"),
        nextBlock: t("validators.nextBlock"),
        progressKnobLeftPct: 62,
      } satisfies ValidatorDashboard,
      stats: [
        { label: t("validators.poolTicker"), value: "GOMA" },
        { label: t("validators.status"), value: t("validators.active") },
        { label: t("validators.pledge"), value: "50K ADA" },
      ],
      cta: {
        label: t("nav.stakepoolGoma"),
        href: "https://pool.pm/9021035ba7bf0b5ecb49aba303fe9bd4b80d99f7b4519854f24f71a1",
        external: true,
      },
    },
    {
      id: "apexFusion" as const,
      name: "Apex Fusion",
      logoUrl: copy.apexFusion.logoUrl,
      accent: copy.apexFusion.accent,
      description: t("validators.apexDesc"),
      dashboard: {
        title: "Blocs of Hope",
        titleColorClass: "text-primary",
        subtitle: "Goma pool at lsdrgin in DRC",
        delegations: 560,
        totalStake: { value: "500,000 000", unit: "APEX" },
        metrics: [
          { label: t("validators.saturation"), value: "1%" },
          { label: t("validators.margin"), value: "0%" },
          { label: t("validators.pledge"), value: "25K A" },
          { label: t("validators.fixedCost"), value: "340 A" },
        ],
        blocks: "130",
        epoch: "62",
        timeLeft: t("validators.timeLeft"),
        nextBlock: t("validators.nextBlock"),
        progressLabel: t("validators.delegationProgress"),
        progressKnobLeftPct: 62,
      } satisfies ValidatorDashboard,
      stats: [],
      cta: {
        label: "Ynuka Labs",
        href: "/contact",
        external: false,
      },
    },
    {
      id: "safrochain" as const,
      name: "Safrochain",
      logoUrl: copy.safrochain.logoUrl,
      accent: copy.safrochain.accent,
      description: t("validators.safroDesc"),
      dashboard: {
        title: "Blocs of Hope",
        titleColorClass: "text-primary",
        subtitle: "Goma pool at lsdrgin in DRC",
        delegations: 104,
        totalStake: { value: "753,8411", unit: "A" },
        metrics: [
          { label: t("validators.saturation"), value: "1%" },
          { label: t("validators.margin"), value: "0%" },
          { label: t("validators.pledge"), value: "25K A" },
          { label: t("validators.fixedCost"), value: "340 A" },
        ],
        blocks: "130",
        epoch: "62",
        timeLeft: t("validators.timeLeft"),
        nextBlock: t("validators.nextBlock"),
        progressLabel: t("validators.delegationProgress"),
        progressKnobLeftPct: 62,
      } satisfies ValidatorDashboard,
      stats: [],
      cta: {
        label: "Ynuka Labs",
        href: "/contact",
        external: false,
      },
    },
  ];

  return (
    <section
      id="validators"
      className={cn("scroll-mt-24 bg-background py-16 md:py-20", showDivider && "border-t border-border")}
    >
      <div className="container mx-auto px-4">
        <div className={cn(showHeading ? "mx-auto mb-10 max-w-2xl text-center md:mb-12" : "mb-6")}>
          {showHeading ? (
            <>
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                <span className="gradient-text">{t("validators.title")}</span>
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">{t("validators.subtitle")}</p>
            </>
          ) : null}
          <p className={cn(showHeading ? "mt-4 text-sm text-muted-foreground" : "text-sm text-muted-foreground")}>
            {t("validators.delegateHelp")}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {validators.map((v, i) => (
            <motion.div
              key={v.id}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.15 }}
              className={cn(
                "relative overflow-hidden rounded-2xl border p-7 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-colors",
                "border-slate-200/90 bg-white hover:border-primary/40",
                "dark:border-white/10 dark:bg-slate-950/35",
                v.id === "cardano" ? "dark:hover:border-[#ff4da6]/30" : null
              )}
            >
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -top-14 -right-14 h-44 w-44 rounded-full blur-2xl opacity-25 bg-gradient-to-br",
                  v.id === "cardano" ? "from-[#ff4da6] to-[#ffb800]" : v.accent
                )}
              />

              <div className="relative flex items-center gap-4">
                <div className="rounded-2xl bg-white/5 p-2 ring-1 ring-white/10">
                  <ChainLogoSmall url={v.logoUrl} name={v.name} accent={v.accent} />
                </div>
                <div className="flex flex-col">
                  <h3 className={cn("font-display text-2xl font-extrabold leading-none", v.dashboard.titleColorClass)}>
                    {v.dashboard.title}
                  </h3>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ffb800] opacity-95">
                    {t("validators.activeOn", { chain: v.name })}
                  </p>
                </div>
              </div>

              <div className="relative mt-5 rounded-2xl border border-white/10 bg-black/70 p-5 dark:bg-black/45">
                <div className="text-center">
                  {v.dashboard.delegations != null ? (
                    <p className="text-[11px] text-white/70">
                      {v.dashboard.delegations} {t("validators.delegations")}
                    </p>
                  ) : null}

                  {v.dashboard.totalStake ? (
                    <div className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white md:text-[2.1rem]">
                      {v.dashboard.totalStake.value}
                      {v.dashboard.totalStake.unit ? (
                        <span className="ml-2 text-lg font-display font-semibold text-white/70 md:text-xl">
                          {v.dashboard.totalStake.unit}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {v.dashboard.metrics.slice(0, 4).map((m) => (
                      <div key={m.label}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">
                          {m.label}
                        </p>
                        <p className="mt-1 text-base font-semibold text-white md:text-lg">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* On n'affiche volontairement que les éléments visibles sur la capture */}
                </div>
              </div>

              <p className="relative mt-4 text-sm text-muted-foreground">{v.description}</p>

              <div className="relative mt-7">
                {v.cta.external ? (
                  <Button asChild variant="glow" size="lg" className="w-full">
                    <a href={v.cta.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                      {t("validators.exploreDelegate")} <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Button asChild variant="glow" size="lg" className="w-full">
                    <Link to={v.cta.href}>{t("validators.exploreDelegate")}</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
