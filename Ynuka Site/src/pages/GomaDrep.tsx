import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, ExternalLink } from "lucide-react";
import {
  GOMA_DREP_CONFIG,
  getGomaDrepDelegateHref,
  getGomaDrepProfileHref,
} from "@/config/gomaDrep";
import {
  fetchGomaDrepActions,
  type GomaDrepAction,
  type GomaDrepVote,
} from "@/lib/gomaDrepActions";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55 },
};

const PRIORITY_KEYS = [1, 2, 3, 4, 5] as const;

function voteLabel(vote: GomaDrepVote, t: (key: string) => string) {
  if (vote === "yes") return t("gomaDrep.voteYes");
  if (vote === "no") return t("gomaDrep.voteNo");
  return t("gomaDrep.voteAbstain");
}

function voteClass(vote: GomaDrepVote) {
  if (vote === "yes") return "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800";
  if (vote === "no") return "bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-800";
  return "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600";
}

function localizedAction(action: GomaDrepAction, lang: string) {
  const isFr = lang.startsWith("fr");
  return {
    title: isFr && action.titleFr ? action.titleFr : action.title,
    rationale: isFr && action.rationaleFr ? action.rationaleFr : action.rationale,
  };
}

function ActionCard({ action, lang }: { action: GomaDrepAction; lang: string }) {
  const { t } = useTranslation();
  const { title, rationale } = localizedAction(action, lang);

  return (
    <article className="border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/60 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-lg font-bold tracking-tight text-[#0f2847] dark:text-white md:text-xl">
          {title}
        </h3>
        <span
          className={`inline-flex shrink-0 px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${voteClass(action.vote)}`}
        >
          {voteLabel(action.vote, t)}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-medium text-slate-500 dark:text-slate-400">{t("gomaDrep.actionType")}</dt>
          <dd className="mt-0.5 text-[#0f2847] dark:text-slate-100">{action.actionType}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500 dark:text-slate-400">{t("gomaDrep.actionStatus")}</dt>
          <dd className="mt-0.5 text-[#0f2847] dark:text-slate-100">{action.status}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500 dark:text-slate-400">{t("gomaDrep.actionDate")}</dt>
          <dd className="mt-0.5 text-[#0f2847] dark:text-slate-100">{action.dateOrEpoch}</dd>
        </div>
      </dl>

      <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{rationale}</p>

      <a
        href={action.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f2847] underline-offset-2 hover:underline dark:text-[#ffb800]"
      >
        {t("gomaDrep.viewSource")}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </a>
    </article>
  );
}

const GomaDrep = () => {
  const { t, i18n } = useTranslation();
  const [actions, setActions] = useState<GomaDrepAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const profileHref = getGomaDrepProfileHref();
  const delegateHref = getGomaDrepDelegateHref();
  const communityHref = GOMA_DREP_CONFIG.communityUrl || null;
  const recentActions = actions.slice(0, 6);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const rows = await fetchGomaDrepActions(50);
        if (!cancelled) setActions(rows);
      } catch {
        if (!cancelled) {
          setActions([]);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="pt-20">
      {/* 1. Présentation */}
      <section id="presentation" className="scroll-mt-28 hero-gradient py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="font-display text-4xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-5xl">
              {t("gomaDrep.title")}
            </h1>
            <p className="typo-lead mx-auto mt-5 max-w-2xl text-justify text-muted-foreground md:text-center">
              {t("gomaDrep.intro")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Priorités */}
      <section id="priorites" className="scroll-mt-28 border-t border-slate-200 py-16 dark:border-slate-800 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl">
              {t("gomaDrep.prioritiesTitle")}
            </h2>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400 md:text-lg">
              {t("gomaDrep.prioritiesSubtitle")}
            </p>
          </motion.div>

          <ul className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {PRIORITY_KEYS.map((n, index) => (
              <motion.li
                key={n}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: index * 0.05 }}
                className="border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900/50"
              >
                <p className="text-sm font-semibold leading-relaxed text-[#0f2847] dark:text-slate-100 md:text-base">
                  {t(`gomaDrep.priority${n}`)}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Actions récentes */}
      <section id="actions" className="scroll-mt-28 bg-slate-50 py-16 dark:bg-slate-950/40 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl">
              {t("gomaDrep.actionsTitle")}
            </h2>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400 md:text-lg">
              {t("gomaDrep.actionsSubtitle")}
            </p>
          </motion.div>

          {loading && (
            <p className="text-center text-muted-foreground">{t("gomaDrep.actionsLoading")}</p>
          )}
          {!loading && error && (
            <p className="text-center text-muted-foreground">{t("gomaDrep.actionsError")}</p>
          )}
          {!loading && !error && recentActions.length === 0 && (
            <p className="text-center text-muted-foreground">{t("gomaDrep.actionsEmpty")}</p>
          )}
          {!loading && !error && recentActions.length > 0 && (
            <div className="mx-auto grid max-w-4xl gap-4">
              {recentActions.map((action) => (
                <ActionCard key={action.id} action={action} lang={i18n.language} />
              ))}
            </div>
          )}

          {!loading && !error && actions.length > recentActions.length && (
            <div className="mt-8 text-center">
              <a
                href="#transparence"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f2847] underline-offset-2 hover:underline dark:text-[#ffb800]"
              >
                {t("gomaDrep.viewFullHistory")}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* 4. Déléguer */}
      <section id="deleguer" className="scroll-mt-28 border-t border-slate-200 py-16 dark:border-slate-800 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <motion.div {...fadeUp} className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl">
                {t("gomaDrep.delegateTitle")}
              </h2>
              <p className="mt-3 text-base text-slate-500 dark:text-slate-400 md:text-lg">
                {t("gomaDrep.delegateSubtitle")}
              </p>
            </motion.div>

            <ul className="mt-8 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
              <li className="border-l-2 border-[#ffb800] pl-4">{t("gomaDrep.delegatePoint1")}</li>
              <li className="border-l-2 border-[#ffb800] pl-4">{t("gomaDrep.delegatePoint2")}</li>
              <li className="border-l-2 border-[#ffb800] pl-4">{t("gomaDrep.delegatePoint3")}</li>
              <li className="border-l-2 border-[#ffb800] pl-4">{t("gomaDrep.delegatePoint4")}</li>
            </ul>

            {GOMA_DREP_CONFIG.drepId ? (
              <p className="mt-6 break-all text-center text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium text-[#0f2847] dark:text-slate-200">
                  {t("gomaDrep.drepIdLabel")}
                </span>{" "}
                {GOMA_DREP_CONFIG.drepId}
              </p>
            ) : (
              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {t("gomaDrep.drepIdPending")}
              </p>
            )}

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {profileHref ? (
                <a
                  href={profileHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#0f2847] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#163a66]"
                >
                  {t("gomaDrep.viewProfile")}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              ) : (
                <span className="inline-flex cursor-not-allowed items-center justify-center gap-2 bg-slate-300 px-6 py-3 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {t("gomaDrep.viewProfile")}
                </span>
              )}
              {delegateHref ? (
                <a
                  href={delegateHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#ffb800] px-6 py-3 text-sm font-bold text-[#0f2847] transition-colors hover:bg-[#e6a600]"
                >
                  {t("gomaDrep.startDelegation")}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              ) : (
                <span className="inline-flex cursor-not-allowed items-center justify-center gap-2 bg-slate-200 px-6 py-3 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {t("gomaDrep.startDelegation")}
                </span>
              )}
            </div>
            {!profileHref && !delegateHref && (
              <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                {t("gomaDrep.linksPending")}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 5. Communauté */}
      <section id="communaute" className="scroll-mt-28 bg-[#0f2847] py-16 text-white md:py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("gomaDrep.communityTitle")}</h2>
            <p className="mt-4 text-base leading-relaxed text-white/80 md:text-lg">
              {t("gomaDrep.communitySubtitle")}
            </p>
            {communityHref ? (
              <a
                href={communityHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center gap-2 bg-[#ffb800] px-7 py-3 text-sm font-bold text-[#0f2847] transition-colors hover:bg-[#e6a600]"
              >
                {t("gomaDrep.joinButton")}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            ) : (
              <>
                <span className="mt-8 inline-flex cursor-not-allowed items-center justify-center gap-2 bg-white/20 px-7 py-3 text-sm font-bold text-white/70">
                  {t("gomaDrep.joinButton")}
                </span>
                <p className="mt-3 text-sm text-white/60">{t("gomaDrep.communityPending")}</p>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* 6. Transparence */}
      <section id="transparence" className="scroll-mt-28 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl">
              {t("gomaDrep.transparencyTitle")}
            </h2>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400 md:text-lg">
              {t("gomaDrep.transparencySubtitle")}
            </p>
          </motion.div>

          {loading && (
            <p className="text-center text-muted-foreground">{t("gomaDrep.actionsLoading")}</p>
          )}
          {!loading && error && (
            <p className="text-center text-muted-foreground">{t("gomaDrep.actionsError")}</p>
          )}
          {!loading && !error && actions.length === 0 && (
            <p className="text-center text-muted-foreground">{t("gomaDrep.transparencyEmpty")}</p>
          )}
          {!loading && !error && actions.length > 0 && (
            <div className="mx-auto grid max-w-4xl gap-4">
              {actions.map((action) => (
                <ActionCard key={`history-${action.id}`} action={action} lang={i18n.language} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GomaDrep;
