import { useCallback, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, FileCode2, GitBranch, Landmark, Layers, Leaf, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BLOCKCHAIN_ORDER,
  type ActivityKind,
  type BlockchainId,
  getBlockchainCopy,
  getBlockchainIntro,
  getBlockchainUi,
} from "@/data/blockchainEcosystem";

const activityIcon = (kind: ActivityKind) => {
  const cls = "h-4 w-4 shrink-0 text-[#ffb800]";
  switch (kind) {
    case "contracts":
      return <FileCode2 className={cls} aria-hidden />;
    case "nft":
      return <Layers className={cls} aria-hidden />;
    case "defi":
      return <Landmark className={cls} aria-hidden />;
    case "trace":
      return <GitBranch className={cls} aria-hidden />;
    case "sustain":
      return <Leaf className={cls} aria-hidden />;
    default:
      return <Sparkles className={cls} aria-hidden />;
  }
};

function useIsDesktop(breakpoint = 768) {
  const [ok, setOk] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const fn = () => setOk(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [breakpoint]);
  return ok;
}

const ChainLogo = ({
  url,
  name,
  accent,
  className,
}: {
  url: string;
  name: string;
  accent: string;
  className?: string;
}) => {
  const [failed, setFailed] = useState(false);
  if (!url?.trim() || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-gradient-to-br font-display text-lg font-bold text-white shadow-inner",
          accent,
          className
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
      alt=""
      className={cn("h-12 w-12 object-contain drop-shadow-md md:h-14 md:w-14", className)}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

const BlockchainEcosystemSection = ({
  lang,
  showDivider = true,
}: {
  lang: string;
  showDivider?: boolean;
}) => {
  const copy = getBlockchainCopy(lang);
  const ui = getBlockchainUi(lang);
  const intro = getBlockchainIntro(lang);
  const isDesktop = useIsDesktop();

  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<BlockchainId | null>(null);

  const active = activeId ? copy[activeId] : null;

  const openChain = useCallback((id: BlockchainId) => {
    setActiveId(id);
    setOpen(true);
  }, []);

  const onSheetOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setActiveId(null);
  }, []);

  return (
    <section
      id="blockchains"
      className={cn(
        "relative scroll-mt-24 overflow-hidden bg-[#F9F8F7] py-16 dark:bg-gradient-to-b dark:from-slate-950 dark:via-[#0b1220] dark:to-slate-950 md:py-24",
        showDivider && "border-y border-slate-200/80 dark:border-white/5"
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 hidden opacity-[0.12] dark:block"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(18,177,166,0.35), transparent 45%), radial-gradient(circle at 80% 60%, rgba(255,184,0,0.2), transparent 40%)",
        }}
      />

      <div className="container relative z-10 mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-12 max-w-3xl text-center md:mb-14"
        >
          <p className="mb-3 font-display text-xs font-bold uppercase tracking-[0.2em] text-[#12B1A6]">
            {ui.sectionKicker}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl lg:text-5xl">
            {ui.sectionTitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300 md:text-lg">{intro}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{ui.hint}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {BLOCKCHAIN_ORDER.map((id, index) => {
            const chain = copy[id];
            const selected = open && activeId === id;
            return (
              <motion.button
                key={id}
                type="button"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openChain(id)}
                className={cn(
                  "group relative flex flex-col items-stretch rounded-2xl border p-5 text-left transition-[box-shadow,border-color] duration-300",
                  "border-slate-200/90 bg-white shadow-md hover:border-[#ffb800]/45 hover:shadow-lg hover:shadow-slate-200/80",
                  "dark:border-white/10 dark:bg-slate-900/60 dark:shadow-[0_16px_48px_rgba(0,0,0,0.35)] dark:backdrop-blur-md dark:hover:border-[#ffb800]/40 dark:hover:shadow-[0_20px_56px_rgba(255,184,0,0.12)]",
                  selected && "border-[#ffb800] ring-2 ring-[#ffb800]/40 dark:ring-[#ffb800]/50"
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-[0.08] dark:group-hover:opacity-100",
                    chain.accent
                  )}
                />
                {chain.websiteUrl ? (
                  <a
                    href={chain.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Ouvrir le site de ${chain.name} dans un nouvel onglet`}
                    className="absolute right-4 top-4 z-10 rounded-full bg-white/70 p-2 text-slate-900 shadow-sm ring-1 ring-slate-200/60 backdrop-blur transition hover:scale-105 dark:bg-slate-950/60 dark:text-white dark:ring-white/10"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
                <div className="relative flex flex-col items-center gap-3 text-center">
                  <div className="rounded-2xl bg-[#F9F8F7] p-3 ring-1 ring-slate-200/80 transition-transform duration-300 group-hover:scale-105 dark:bg-white/5 dark:ring-white/10">
                    <ChainLogo url={chain.logoUrl} name={chain.name} accent={chain.accent} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{chain.name}</h3>
                    <p className="mt-1 line-clamp-3 text-xs leading-snug text-slate-600 dark:text-slate-400">{chain.tagline}</p>
                  </div>
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#12B1A6] opacity-90">
                    <Sparkles className="h-3 w-3" />
                    {ui.sheetEyebrow}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <Sheet open={open} onOpenChange={onSheetOpenChange}>
        <SheetContent
          side={isDesktop ? "right" : "bottom"}
          className={cn(
            "flex w-full flex-col border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-0 text-slate-100 shadow-2xl",
            isDesktop ? "max-w-full sm:max-w-lg lg:max-w-xl" : "max-h-[90vh] rounded-t-3xl"
          )}
        >
          <AnimatePresence mode="wait">
            {active && activeId && (
              <motion.div
                key={activeId}
                initial={{ opacity: 0, x: isDesktop ? 24 : 0, y: isDesktop ? 0 : 24 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex h-full max-h-[inherit] flex-col"
              >
                <SheetHeader className="space-y-0 border-b border-white/10 px-6 py-5 pr-14 text-left">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                      <ChainLogo url={active.logoUrl} name={active.name} accent={active.accent} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#12B1A6]">
                        {ui.sheetEyebrow}
                      </p>
                      <SheetTitle className="mt-1 text-left font-display text-2xl text-white md:text-3xl">
                        {active.name}
                      </SheetTitle>
                    </div>
                    {active.websiteUrl ? (
                      <Button asChild variant="outline-glow" size="sm" className="shrink-0">
                        <a href={active.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          {ui.visitSite}
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <p className="text-sm leading-relaxed text-slate-300 md:text-base">{active.description}</p>

                  <h4 className="mt-8 font-display text-sm font-bold uppercase tracking-widest text-[#ffb800]">
                    {ui.whatWeDo}
                  </h4>
                  <ul className="mt-4 space-y-4">
                    {active.activities.map((item, i) => (
                      <motion.li
                        key={`${item.title}-${i}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="rounded-xl border border-white/10 bg-slate-900/50 p-4 shadow-inner"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ffb800]/10 ring-1 ring-[#ffb800]/25">
                            {activityIcon(item.kind)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.title}</p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-400">{item.body}</p>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default BlockchainEcosystemSection;
