import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, Copy, ExternalLink, Info, Mail, MessageSquare, Send, Share2 } from "lucide-react";
import logo from "@/assets/logo.png";
import {
  GOMA_DREP_CONFIG,
  GOMA_DREP_PROFILE,
  getGomaDrepDelegateHref,
  truncateDrepId,
} from "@/config/gomaDrep";
import { fetchGomaDrepChain, type GomaDrepChainSnapshot } from "@/lib/gomaDrepChain";
import {
  fallbackGomaDrepProfile,
  fetchGomaDrepMetadata,
  type GomaDrepLiveProfile,
} from "@/lib/gomaDrepMetadata";
import { useToast } from "@/hooks/use-toast";

/** Même largeur et mêmes marges que la case de la barre de menus. */
const menuFrame = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10";

function formatAda(value: number, language: string) {
  const locale = language.startsWith("fr") ? "fr-FR" : "en-US";
  const digits = Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function CopyButton({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const { toast } = useToast();
  const [done, setDone] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      toast({ title: copiedLabel });
      window.setTimeout(() => setDone(false), 1600);
    } catch {
      toast({ title: label, variant: "destructive" });
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-[#0f2847] transition-colors hover:border-[#ffb800] hover:bg-[#ffb800]/15 dark:border-slate-600 dark:text-slate-100"
      aria-label={label}
    >
      {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {done ? copiedLabel : label}
    </button>
  );
}

function ProfileBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-slate-200 px-5 py-5 first:border-t-0 dark:border-slate-700 md:px-6">
      <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[#0f2847] dark:text-[#ffb800]">
        {title}
      </h3>
      <div className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200 md:text-[0.95rem]">
        {children}
      </div>
    </section>
  );
}

const GomaDrep = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [chain, setChain] = useState<GomaDrepChainSnapshot | null>(null);
  const [profile, setProfile] = useState<GomaDrepLiveProfile>(() => fallbackGomaDrepProfile());
  const [votesState, setVotesState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [question, setQuestion] = useState("");

  const drepId = GOMA_DREP_CONFIG.drepId;
  const delegateHref = getGomaDrepDelegateHref();
  const active = chain?.active ?? true;
  const votingPower = chain?.votingPowerAda ?? GOMA_DREP_PROFILE.votingPowerAda;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setVotesState("loading");
      const snapshot = await fetchGomaDrepChain(drepId);
      if (cancelled) return;
      setChain(snapshot);
      setVotesState(snapshot.yes == null ? "unavailable" : "ready");
      try {
        const live = await fetchGomaDrepMetadata(snapshot.metaUrl || GOMA_DREP_PROFILE.metadataUrl);
        if (!cancelled && live) setProfile(live);
      } catch {
        /* copie locale conservée */
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [drepId]);

  const shareProfile = async () => {
    const url = window.location.href;
    const title = profile.name;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: t("gomaDrep.shareCopied") });
    } catch {
      toast({ title: t("gomaDrep.share"), variant: "destructive" });
    }
  };

  const askOnX = () => {
    const text = question.trim();
    if (!text) return;
    const intent = `https://x.com/intent/post?text=${encodeURIComponent(`@gomadrep ${text}`)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  };

  const voteCount = (value: number | null | undefined) => {
    if (votesState === "loading") return "…";
    if (votesState === "unavailable" || value == null) return "—";
    return String(value);
  };

  return (
    <div className="pt-20">
      <section className="hero-gradient py-12 md:py-16">
        <div className={menuFrame}>
          <article className="border border-slate-200 bg-white p-5 shadow-[6px_6px_0_0_rgba(15,40,71,0.08)] dark:border-slate-700 dark:bg-slate-900 md:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#0f2847] ring-4 ring-[#ffb800]">
                <img src={logo} alt="" className="h-12 w-12 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-[#0f2847] dark:text-white">
                    {profile.name}
                  </h1>
                  <span
                    className={
                      active
                        ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-800"
                        : "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} aria-hidden />
                    {active ? t("gomaDrep.active") : t("gomaDrep.inactive")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {t("gomaDrep.votingPower")}{" "}
                  <span className="font-bold text-[#0f2847] dark:text-white">
                    ₳ {formatAda(votingPower, i18n.language)}
                  </span>
                </p>
                <p className="mt-3 break-all font-mono text-xs leading-relaxed text-[#0f2847] dark:text-slate-100 md:text-sm">
                  {drepId}
                </p>
                <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
                  {truncateDrepId(drepId)}
                </p>
                <p className="mt-3 break-all text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{t("gomaDrep.legacyId")}</span>
                  <br />
                  {GOMA_DREP_PROFILE.legacyDrepId}
                </p>
                <div className="mt-3">
                  <CopyButton value={drepId} label={t("gomaDrep.copy")} copiedLabel={t("gomaDrep.copied")} />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <a
                href="#questions"
                className="inline-flex flex-1 items-center justify-center gap-2 border border-[#0f2847] px-4 py-2.5 text-sm font-bold text-[#0f2847] transition-colors hover:bg-[#0f2847] hover:text-white dark:border-slate-500 dark:text-white dark:hover:bg-white dark:hover:text-[#0f2847]"
              >
                <MessageSquare className="h-4 w-4" aria-hidden />
                {t("gomaDrep.askQuestion")}
              </a>
              <a
                href={delegateHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 bg-[#ffb800] px-4 py-2.5 text-sm font-bold text-[#0f2847] transition-colors hover:bg-[#e6a600]"
              >
                {t("gomaDrep.delegate")}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
              <button
                type="button"
                onClick={shareProfile}
                className="inline-flex flex-1 items-center justify-center gap-2 border border-slate-300 px-4 py-2.5 text-sm font-bold text-[#0f2847] transition-colors hover:border-[#0f2847] dark:border-slate-600 dark:text-white"
              >
                <Share2 className="h-4 w-4" aria-hidden />
                {t("gomaDrep.share")}
              </button>
            </div>
          </article>
        </div>
      </section>

      <section className="py-12 md:py-16" aria-labelledby="profile-info">
        <div className={menuFrame}>
          <h2 id="profile-info" className="text-2xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-3xl">
            {t("gomaDrep.profileTitle")}
          </h2>
          <div className="mt-6 border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/60">
            <ProfileBlock title={t("gomaDrep.objectives")}>
              <p>{profile.objectives}</p>
            </ProfileBlock>
            <ProfileBlock title={t("gomaDrep.motivations")}>
              <p className="whitespace-pre-line">{profile.motivations}</p>
            </ProfileBlock>
            <ProfileBlock title={t("gomaDrep.qualifications")}>
              <p className="whitespace-pre-line">{profile.qualifications}</p>
            </ProfileBlock>
            <ProfileBlock title={t("gomaDrep.references")}>
              <ul className="space-y-3">
                {profile.references.map((ref) => (
                  <li key={ref.uri}>
                    <a
                      href={ref.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-start gap-2 font-medium text-[#0f2847] underline-offset-2 hover:underline dark:text-[#ffb800]"
                    >
                      <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span>{ref.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </ProfileBlock>
            <ProfileBlock title={t("gomaDrep.paymentAddress")}>
              <p className="break-all font-mono text-xs md:text-sm">{profile.paymentAddress}</p>
              <div className="mt-3">
                <CopyButton
                  value={profile.paymentAddress}
                  label={t("gomaDrep.copy")}
                  copiedLabel={t("gomaDrep.copied")}
                />
              </div>
            </ProfileBlock>
            <ProfileBlock title={t("gomaDrep.metadata")}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("gomaDrep.metadataUrl")}</p>
              <a
                href={profile.metadataUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-start gap-1.5 break-all font-medium text-[#0f2847] underline-offset-2 hover:underline dark:text-[#ffb800]"
              >
                {profile.metadataUrl}
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              </a>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{t("gomaDrep.metadataHash")}</p>
              <p className="mt-1 break-all font-mono text-xs">{chain?.metaHash || GOMA_DREP_PROFILE.metadataHash}</p>
            </ProfileBlock>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{t("gomaDrep.sourceNote")}</p>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-950/40 md:py-16">
        <div className={menuFrame}>
          <h2 className="text-2xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-3xl">
            {t("gomaDrep.votingRecord")}
          </h2>
          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: t("gomaDrep.yesVotes"), value: voteCount(chain?.yes), tone: "text-emerald-700 dark:text-emerald-300" },
              { label: t("gomaDrep.noVotes"), value: voteCount(chain?.no), tone: "text-rose-700 dark:text-rose-300" },
              { label: t("gomaDrep.abstainVotes"), value: voteCount(chain?.abstain), tone: "text-slate-700 dark:text-slate-200" },
            ].map((item) => (
              <div key={item.label} className="border border-slate-200 bg-white px-4 py-5 text-center dark:border-slate-700 dark:bg-slate-900">
                <dd className={`font-display text-4xl font-bold ${item.tone}`}>{item.value}</dd>
                <dt className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</dt>
              </div>
            ))}
          </dl>
          {votesState === "unavailable" && (
            <div
              role="status"
              className="mt-5 flex items-start gap-3 border-l-4 border-[#ffb800] bg-[#ffb800]/20 px-4 py-4 text-[#0f2847] dark:bg-[#ffb800]/15 dark:text-white"
            >
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#8a6800] dark:text-[#ffb800]" aria-hidden />
              <p className="text-base font-semibold leading-snug md:text-lg">{t("gomaDrep.votesUnavailable")}</p>
            </div>
          )}
          <a
            href={`https://cexplorer.io/drep/${drepId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-[#ffb800] px-5 py-3 text-sm font-bold text-[#0f2847] transition-colors hover:bg-[#e6a600] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f2847] sm:w-auto"
          >
            {t("gomaDrep.verifyVotes")}
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </section>

      <section id="questions" className="scroll-mt-28 py-12 md:py-16">
        <div className={menuFrame}>
          <div className="grid overflow-hidden border border-slate-200 bg-white min-[540px]:grid-cols-2 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center self-stretch bg-[#0f2847] px-6 py-5 text-white md:px-8 md:py-6">
              <h2 className="max-w-md text-base font-semibold leading-relaxed md:text-lg">{t("gomaDrep.qaEmpty")}</h2>
            </div>
            <div className="px-6 py-8 md:px-8 md:py-10">
              <label htmlFor="goma-drep-question" className="block text-sm font-bold text-[#0f2847] dark:text-white">
                {t("gomaDrep.askQuestion")}
              </label>
              <textarea
                id="goma-drep-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={5}
                placeholder={t("gomaDrep.qaPlaceholder")}
                className="mt-3 w-full resize-y border border-slate-300 bg-white px-3 py-2 text-sm text-[#0f2847] outline-none ring-[#ffb800] placeholder:text-slate-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-white"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t("gomaDrep.qaHint")}</p>
              <div className="mt-5 grid grid-cols-1 gap-2 min-[1100px]:grid-cols-3">
                <button
                  type="button"
                  onClick={askOnX}
                  disabled={!question.trim()}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#ffb800] px-2 py-2 text-center text-xs font-bold leading-tight text-[#0f2847] transition-colors hover:bg-[#e6a600] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f2847] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 sm:gap-2 sm:px-3 sm:text-sm"
                >
                  <Send className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
                  <span>{t("gomaDrep.qaSubmit")}</span>
                </button>
                <a
                  href="https://x.com/gomadrep"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 border border-slate-300 bg-white px-2 py-2 text-center text-xs font-bold leading-tight text-[#0f2847] transition-colors hover:border-[#ffb800] hover:bg-[#ffb800]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb800] sm:gap-2 sm:px-3 sm:text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-white dark:hover:border-[#ffb800]"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
                  <span>@gomadrep</span>
                </a>
                <Link
                  to={`/contact?subject=${encodeURIComponent("GOMA-DRep")}`}
                  className="inline-flex items-center justify-center gap-1.5 border border-[#0f2847] bg-[#0f2847] px-2 py-2 text-center text-xs font-bold leading-tight text-white transition-colors hover:bg-[#163a66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb800] sm:gap-2 sm:px-3 sm:text-sm dark:border-[#ffb800]/70 dark:bg-[#152a48] dark:hover:bg-[#ffb800] dark:hover:text-[#0f2847]"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
                  <span>{t("gomaDrep.contactUs")}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GomaDrep;
