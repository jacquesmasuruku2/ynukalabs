import { useCallback, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  BLOCKCHAIN_ORDER,
  type BlockchainId,
  getBlockchainCopy,
  getBlockchainIntro,
  getBlockchainUi,
} from "@/data/blockchainEcosystem";

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
  className,
}: {
  url: string;
  name: string;
  className?: string;
}) => {
  const [failed, setFailed] = useState(false);
  if (!url?.trim() || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-[#122033] font-display text-lg font-bold text-[#ffb800]",
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
      className={cn("object-contain", className)}
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
        "relative scroll-mt-10 py-16 md:py-24",
        showDivider && "border-y border-black/[0.06] dark:border-white/10"
      )}
    >
      <div className="relative z-10 mx-auto max-w-[1360px] px-4 sm:px-6 md:px-8 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-8 max-w-3xl text-center md:mb-10"
        >
          <h2 className="text-balance font-display text-4xl font-extrabold tracking-tight text-[#ffb800] sm:text-5xl md:text-6xl">
            {ui.sectionTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-slate-300 sm:text-base md:text-lg">
            {intro}
          </p>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm font-medium text-slate-500">
            {ui.hint}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          {BLOCKCHAIN_ORDER.map((id, index) => {
            const chain = copy[id];
            const selected = open && activeId === id;

            return (
              <motion.button
                key={id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openChain(id)}
                className={cn(
                  "group relative flex min-h-[6.5rem] items-stretch overflow-hidden rounded-xl border border-white/10 bg-[#071727]/45 text-left backdrop-blur-sm transition-[border-color,background-color] duration-300 hover:border-[#ffb800]/55 hover:bg-[#071727]/65 sm:min-h-[7.25rem]",
                  selected && "border-[#ffb800] shadow-[0_0_0_1px_rgba(255,184,0,0.35)]",
                  index === BLOCKCHAIN_ORDER.length - 1 && "md:col-span-2 md:max-w-[calc(50%-0.5rem)] md:justify-self-center"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br opacity-25 blur-2xl transition-opacity group-hover:opacity-50",
                    chain.accent
                  )}
                  aria-hidden
                />

                <div className="relative flex w-[4.75rem] shrink-0 items-center justify-center border-r border-white/10 sm:w-[5.5rem] md:w-[6.25rem]">
                  <ChainLogo
                    url={chain.logoUrl}
                    name={chain.name}
                    className="h-9 w-9 object-contain sm:h-11 sm:w-11 md:h-12 md:w-12"
                  />
                </div>

                <div className="relative flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-3 sm:px-4 sm:py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#ffb800]">
                      Network {String(index + 1).padStart(2, "0")}
                    </p>
                    <span className="hidden h-1.5 w-1.5 rounded-full bg-[#ffb800] opacity-0 transition-opacity group-hover:opacity-100 sm:block" aria-hidden />
                  </div>
                  <h3 className="font-display text-lg font-extrabold leading-tight text-white sm:text-xl">
                    {chain.name}
                  </h3>
                  <p className="line-clamp-2 text-pretty text-[0.8rem] font-medium leading-snug text-slate-400 sm:text-sm">
                    {chain.tagline}
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-slate-500 transition-colors group-hover:text-[#ffb800]">
                    {ui.openDetail}
                    <ArrowRight className="h-3 w-3" aria-hidden />
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
            "flex w-full flex-col border-black/10 bg-[#fbfaf7] p-0 text-[#122033] dark:border-white/10 dark:bg-[#121a22] dark:text-slate-100",
            isDesktop ? "max-w-full sm:max-w-md lg:max-w-lg" : "max-h-[92vh] rounded-t-2xl"
          )}
        >
          <AnimatePresence mode="wait">
            {active && activeId ? (
              <motion.div
                key={activeId}
                initial={{ opacity: 0, x: isDesktop ? 20 : 0, y: isDesktop ? 0 : 16 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="flex h-full max-h-[inherit] flex-col"
              >
                <SheetHeader className="space-y-0 border-b border-black/[0.06] px-6 py-5 pr-14 text-left dark:border-white/10">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#b8860b]">
                    {ui.sheetEyebrow}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center bg-white p-2 shadow-sm ring-1 ring-black/[0.06] dark:bg-white/5 dark:ring-white/10">
                      <ChainLogo url={active.logoUrl} name={active.name} className="h-9 w-9" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <SheetTitle className="text-left font-display text-2xl font-extrabold text-[#122033] dark:text-white">
                        {active.name}
                      </SheetTitle>
                      <p className="mt-1 text-sm font-medium text-[#5a6b82] dark:text-slate-400">
                        {active.tagline}
                      </p>
                    </div>
                  </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <p className="text-[0.95rem] font-medium leading-relaxed text-[#3d4f66] dark:text-slate-300">
                    {active.description}
                  </p>

                  <h4 className="mt-8 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#8a96a8]">
                    {ui.whatWeDo}
                  </h4>

                  <ol className="mt-4 space-y-0 divide-y divide-black/[0.06] border-y border-black/[0.06] dark:divide-white/10 dark:border-white/10">
                    {active.activities.map((item, i) => (
                      <motion.li
                        key={`${item.title}-${i}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 * i }}
                        className="grid grid-cols-[2rem_1fr] gap-3 py-4"
                      >
                        <span className="font-display text-lg font-extrabold text-[#ffb800]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="font-bold text-[#122033] dark:text-white">{item.title}</p>
                          <p className="mt-1 text-sm font-medium leading-relaxed text-[#5a6b82] dark:text-slate-400">
                            {item.body}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </ol>

                  {active.websiteUrl ? (
                    <a
                      href={active.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-[#122033] px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 dark:bg-[#ffb800] dark:text-[#122033]"
                    >
                      {ui.visitSite}
                      <ExternalLink className="h-4 w-4" aria-hidden />
                    </a>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default BlockchainEcosystemSection;
