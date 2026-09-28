import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, ExternalLink, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { listValidators } from "@/services/validators/validatorsApi";
import type { YnukaValidator } from "@/services/validators/types";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

const ACCENTS = [
  {
    wash: "from-[#ffb800]/25 via-transparent to-transparent",
    bar: "bg-[#ffb800]",
    chip: "bg-[#0f2847] text-[#ffb800]",
  },
  {
    wash: "from-[#12B1A6]/20 via-transparent to-transparent",
    bar: "bg-[#12B1A6]",
    chip: "bg-[#0f2847] text-[#7dfff3]",
  },
] as const;

function ValidatorCard({
  validator,
  index,
}: {
  validator: YnukaValidator;
  index: number;
}) {
  const { t, i18n } = useTranslation();
  const isFr = i18n.language.startsWith("fr");
  const accent = ACCENTS[index % ACCENTS.length];
  const description =
    (isFr && validator.descriptionFr ? validator.descriptionFr : validator.description) ||
    t("validators.defaultDesc", { chain: validator.chain });

  const metrics = [
    validator.rank ? { label: t("validators.rank"), value: validator.rank } : null,
    validator.votingPower
      ? {
          label: t("validators.votingPower"),
          value: validator.votingPower,
          hint: validator.votingPowerPct,
        }
      : null,
    validator.tokensStaked
      ? { label: t("validators.tokensStaked"), value: validator.tokensStaked }
      : null,
    validator.commission
      ? { label: t("validators.commission"), value: validator.commission }
      : null,
    validator.delegators
      ? { label: t("validators.delegators"), value: validator.delegators }
      : null,
    validator.uptime ? { label: t("validators.uptime"), value: validator.uptime } : null,
  ].filter(Boolean) as { label: string; value: string; hint?: string | null }[];

  const isActive = String(validator.status).toLowerCase() === "active";

  return (
    <motion.article
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay: index * 0.1 }}
      className="group relative flex h-full flex-col overflow-hidden bg-white shadow-[0_12px_40px_-24px_rgba(15,40,71,0.45)] ring-1 ring-black/[0.06] dark:bg-[#101820] dark:ring-white/10"
    >
      <span className={cn("absolute inset-x-0 top-0 h-1.5", accent.bar)} aria-hidden />
      <div
        className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90", accent.wash)}
        aria-hidden
      />

      <div className="relative aspect-[16/10] overflow-hidden bg-[#111]">
        {validator.imageUrl ? (
          <img
            src={validator.imageUrl}
            alt={t("validators.imageAlt", { name: validator.name, chain: validator.chain })}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
            <span className="font-display text-4xl font-extrabold text-white/20">
              {validator.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-4 pt-16">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#ffb800]">
            {validator.chain}
          </p>
          <h3 className="mt-0.5 font-display text-2xl font-extrabold text-white">{validator.name}</h3>
        </div>
        {isActive ? (
          <span
            className={cn(
              "absolute right-3 top-3 px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide",
              accent.chip
            )}
          >
            {t("validators.active")}
          </span>
        ) : null}
      </div>

      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-sm font-medium leading-relaxed text-[#3d4f66] dark:text-slate-300">
          {description}
        </p>

        {validator.address ? (
          <p className="mt-3 break-all border-l-2 border-[#ffb800]/70 pl-3 font-mono text-[0.62rem] leading-relaxed text-[#5a6b82] dark:text-slate-500">
            {validator.address}
          </p>
        ) : null}

        {metrics.length > 0 ? (
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            {metrics.map((m) => (
              <div key={m.label}>
                <dt className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#8a96a8]">
                  {m.label}
                </dt>
                <dd className="mt-0.5 text-sm font-extrabold text-[#122033] dark:text-white">{m.value}</dd>
                {m.hint ? (
                  <p className="text-[0.65rem] font-medium text-[#6b7c94]">{m.hint}</p>
                ) : null}
              </div>
            ))}
          </dl>
        ) : null}

        {validator.explorerUrl ? (
          <a
            href={validator.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 self-start text-sm font-bold text-[#122033] underline decoration-[#ffb800] decoration-2 underline-offset-4 transition-colors hover:text-[#0f2847] dark:text-white"
          >
            {t("validators.viewOnExplorer")}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        ) : null}
      </div>
    </motion.article>
  );
}

/**
 * Section #validators — nos validateurs + invitation à en savoir plus.
 */
export const EcosystemValidatorsSection = ({
  showHeading = true,
  showDivider = true,
}: {
  showHeading?: boolean;
  showDivider?: boolean;
}) => {
  const { t } = useTranslation();
  const [validators, setValidators] = useState<YnukaValidator[]>([]);
  const [loading, setLoading] = useState(true);
  const contactHref = `/contact?subject=${encodeURIComponent(t("validators.contactSubject"))}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await listValidators(50);
        if (!cancelled) setValidators(rows);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="validators"
      className={cn(
        "scroll-mt-28 relative overflow-hidden py-16 md:py-24",
        "bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(255,184,0,0.14),transparent_55%),radial-gradient(900px_500px_at_90%_0%,rgba(18,177,166,0.10),transparent_50%),linear-gradient(180deg,#fbfaf7_0%,#f3f1eb_100%)]",
        "dark:bg-[radial-gradient(1000px_500px_at_15%_0%,rgba(255,184,0,0.12),transparent_50%),linear-gradient(180deg,#0b1219_0%,#101820_100%)]",
        showDivider && "border-t border-black/[0.06] dark:border-white/10"
      )}
    >
      <div className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10">
        {showHeading ? (
          <motion.div
            {...fadeUp}
            className="mb-10 grid items-end gap-6 md:mb-14 md:grid-cols-[1.2fr_0.8fr]"
          >
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#b8860b]">
                {t("validators.eyebrow")}
              </p>
              <h2 className="mt-2 max-w-xl font-display text-3xl font-extrabold tracking-tight text-[#122033] md:text-4xl dark:text-white">
                {t("validators.title")}
              </h2>
            </div>
            <p className="max-w-md text-base font-medium leading-relaxed text-[#4a5c73] md:justify-self-end md:text-right dark:text-slate-300">
              {t("validators.subtitle")}
            </p>
          </motion.div>
        ) : (
          <p className="mb-8 max-w-2xl text-sm font-medium text-[#4a5c73] dark:text-slate-400">
            {t("validators.subtitle")}
          </p>
        )}

        <p className="mb-6 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#8a96a8]">
          {t("validators.ourValidators")}
        </p>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-[440px] animate-pulse bg-white/70 dark:bg-white/5" />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-5",
              validators.length === 1 ? "mx-auto max-w-2xl" : "md:grid-cols-2"
            )}
          >
            {validators.map((v, i) => (
              <ValidatorCard key={v.id} validator={v} index={i} />
            ))}
          </div>
        )}

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.12 }}
          className="mt-12 flex flex-col items-start gap-4 border-t border-[#122033]/10 pt-8 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-sm font-bold text-[#122033] dark:text-white">
              <MessageCircle className="h-4 w-4 text-[#12B1A6]" aria-hidden />
              {t("validators.learnMoreTitle")}
            </p>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-[#4a5c73] dark:text-slate-400">
              {t("validators.learnMoreDesc")}
            </p>
          </div>
          <Link
            to={contactHref}
            className="inline-flex items-center gap-2 border border-[#122033]/20 bg-transparent px-4 py-2.5 text-sm font-bold text-[#122033] transition-colors hover:border-[#ffb800] hover:bg-[#ffb800]/15 dark:border-white/25 dark:text-white"
          >
            {t("validators.learnMoreCta")}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
