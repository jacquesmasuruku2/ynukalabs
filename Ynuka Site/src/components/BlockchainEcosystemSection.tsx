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
        "relative scroll-mt-28 overflow-hidden py-16 md:py-24",
        "bg-[radial-gradient(900px_420px_at_0%_0%,rgba(255,184,0,0.12),transparent_55%),linear-gradient(180deg,#fbfaf7_0%,#f0eee8_100%)]",
        "dark:bg-[radial-gradient(800px_400px_at_10%_0%,rgba(255,184,0,0.08),transparent_50%),linear-gradient(180deg,#0b1219_0%,#121a22_100%)]",
        showDivider && "border-y border-black/[0.06] dark:border-white/10"
      )}
    >
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-10 max-w-2xl text-center md:mb-14"
        >
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#122033] md:text-4xl dark:text-white">
            {ui.sectionTitle}
          </h2>
          <div
            className="mx-auto mt-4 h-px w-14 bg-gradient-to-r from-transparent via-[#ffb800] to-transparent"
            aria-hidden
          />
          <p className="mt-5 text-lg font-medium leading-relaxed text-[#3d4f66] dark:text-slate-300">
            {intro}
          </p>
          <p className="mt-3 text-sm font-medium text-[#8a96a8]">{ui.hint}</p>
        </motion.div>

        {/* Rangée principale : 3 + 2 pour un rythme plus vivant */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {BLOCKCHAIN_ORDER.map((id, index) => {
            const chain = copy[id];
            const selected = open && activeId === id;
            const span =
              index < 3
                ? "lg:col-span-2"
                : index === 3
                  ? "lg:col-span-3"
                  : "lg:col-span-3";

            return (
              <motion.button
                key={id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => openChain(id)}
                className={cn(
                  "group relative flex min-h-[168px] flex-col items-center justify-between overflow-hidden rounded-card border border-black/[0.07] bg-white p-5 text-center transition-shadow hover:shadow-[0_18px_40px_-28px_rgba(15,40,71,0.55)] dark:border-white/10 dark:bg-[#151d27]",
                  span,
                  selected && "border-[#ffb800] shadow-[0_0_0_1px_#ffb800]"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br opacity-40 blur-2xl transition-opacity group-hover:opacity-70",
                    chain.accent
                  )}
                  aria-hidden
                />

                <div className="relative flex w-full flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center bg-[#f6f4ef] p-2 dark:bg-white/5">
                    <ChainLogo url={chain.logoUrl} name={chain.name} className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-extrabold text-[#122033] dark:text-white">
                    {chain.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug text-[#5a6b82] dark:text-slate-400">
                    {chain.tagline}
                  </p>
                </div>

                <span className="relative mt-4 inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#8a96a8] transition-colors group-hover:text-[#122033] dark:group-hover:text-[#ffb800]">
                  {ui.openDetail}
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </span>
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
