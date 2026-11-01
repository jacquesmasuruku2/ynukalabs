import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  Copy,
  ExternalLink,
  MessageCircle,
  Network,
  ShieldCheck,
} from "lucide-react";
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

const CARD_ICONS = [Network, Copy, ShieldCheck] as const;

const ICON_TONES = [
  { wrap: "text-[#7dd3fc]", glow: "bg-[#38bdf8]/15" },
  { wrap: "text-[#818cf8]", glow: "bg-[#6366f1]/15" },
  { wrap: "text-[#a78bfa]", glow: "bg-[#8b5cf6]/15" },
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
  const Icon = CARD_ICONS[index % CARD_ICONS.length];
  const tone = ICON_TONES[index % ICON_TONES.length];
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
      className="group relative flex h-full flex-col rounded-[1.25rem] border border-white/[0.08] bg-[#0b1220]/55 p-5 shadow-[0_18px_50px_-32px_rgba(0,0,0,0.85)] backdrop-blur-md transition-[border-color,background-color,transform] duration-300 hover:border-white/20 hover:bg-[#0b1220]/70 sm:p-6"
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[0.85rem] border border-white/10 outline outline-1 outline-white/10",
            tone.glow
          )}
        >
          {validator.imageUrl ? (
            <img
              src={validator.imageUrl}
              alt=""
              className="h-7 w-7 object-contain"
              loading="lazy"
            />
          ) : (
            <Icon className={cn("h-5 w-5", tone.wrap)} strokeWidth={1.75} aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/45">
            {validator.chain}
          </p>
          <h3 className="mt-0.5 text-balance font-display text-lg font-semibold tracking-tight text-white sm:text-xl">
            {validator.name}
          </h3>
        </div>
      </div>

      <p className="mt-4 text-pretty text-sm font-medium leading-relaxed text-slate-400">
        {description}
      </p>

      {validator.address ? (
        <p className="mt-3 break-all font-mono text-[0.62rem] leading-relaxed text-slate-500">
          {validator.address}
        </p>
      ) : null}

      {metrics.length > 0 ? (
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label}>
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-slate-500">
                {m.label}
              </dt>
              <dd className="mt-0.5 text-sm font-extrabold tabular-nums text-white">{m.value}</dd>
              {m.hint ? (
                <p className="text-[0.65rem] font-medium tabular-nums text-slate-500">{m.hint}</p>
              ) : null}
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
        {isActive ? (
          <span className="inline-flex rounded-md bg-emerald-500/10 px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-emerald-300">
            {t("validators.active")}
          </span>
        ) : (
          <span />
        )}
        {validator.explorerUrl ? (
          <a
            href={validator.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-white/85 underline decoration-white/25 decoration-2 underline-offset-4 transition-colors hover:text-white hover:decoration-[#ffb800]"
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
        "scroll-mt-28 relative py-16 md:py-24",
        showDivider && "border-t border-white/10"
      )}
    >
      <div className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10">
        {showHeading ? (
          <motion.div
            {...fadeUp}
            className="mb-10 grid items-end gap-6 md:mb-14 md:grid-cols-[1.2fr_0.8fr]"
          >
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#ffb800]">
                {t("validators.eyebrow")}
              </p>
              <h2 className="mt-2 max-w-xl text-balance font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                {t("validators.title")}
              </h2>
            </div>
            <p className="max-w-md text-pretty text-base font-medium leading-relaxed text-slate-400 md:justify-self-end md:text-right">
              {t("validators.subtitle")}
            </p>
          </motion.div>
        ) : (
          <p className="mb-8 max-w-2xl text-pretty text-sm font-medium text-slate-400">
            {t("validators.subtitle")}
          </p>
        )}

        <p className="mb-6 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-slate-500">
          {t("validators.ourValidators")}
        </p>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-[280px] animate-pulse rounded-[1.25rem] border border-white/[0.08] bg-white/[0.04]"
              />
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
          className="mt-12 flex flex-col items-start gap-4 rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-5 py-5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6"
        >
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-sm font-bold text-white">
              <MessageCircle className="h-4 w-4 text-[#12B1A6]" aria-hidden />
              {t("validators.learnMoreTitle")}
            </p>
            <p className="mt-1.5 text-pretty text-sm font-medium leading-relaxed text-slate-400">
              {t("validators.learnMoreDesc")}
            </p>
          </div>
          <Link
            to={contactHref}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white transition-[border-color,background-color,transform] duration-200 hover:border-[#ffb800]/70 hover:bg-[#ffb800]/10 active:scale-[0.96]"
          >
            {t("validators.learnMoreCta")}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
