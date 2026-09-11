import { useLayoutEffect, useRef, useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Calendar, ChevronLeft, ChevronRight, ImagePlus, MessageCircle, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitContactForm } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Légèrement plus étroit que 30rem, sans forcer 1/3 d’écran */
const VOICE_CARD_WIDTH = "w-[min(92vw,26rem)]";

async function compressImageToDataUrl(file: File, maxSide = 720, quality = 0.72): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.55 },
};

type VoiceTestimonial = { name: string; role: string; text: string; image: string };

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function VoiceTestimonialCard({ tm }: { tm: VoiceTestimonial }) {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const [needsToggle, setNeedsToggle] = useState(false);

  useLayoutEffect(() => {
    const el = quoteRef.current;
    if (!el) return;
    const measure = () => {
      if (expanded) return;
      setNeedsToggle(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tm.text, expanded]);

  return (
    <article
      className={cn(
        "group relative flex h-full min-h-[210px] shrink-0 overflow-hidden border border-slate-200/90 bg-white shadow-[0_10px_28px_-18px_rgba(15,40,71,0.35)] dark:border-slate-700 dark:bg-[#0c1a2e] dark:shadow-none",
        VOICE_CARD_WIDTH
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-[#ffb800]" aria-hidden />
      <div className="flex w-full flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-0 sm:p-5">
        <div className="mx-auto flex w-[7.25rem] shrink-0 flex-col items-center self-center sm:mx-0 sm:pr-4">
          <div className="h-[6.75rem] w-[6.75rem] overflow-hidden rounded-2xl bg-[#0f2847] ring-2 ring-[#ffb800]/75">
            <img
              src={tm.image}
              alt={tm.name}
              className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              loading="lazy"
            />
          </div>
          <div className="mt-3 flex w-full items-start justify-center gap-2.5">
            <span className="mt-0.5 hidden h-8 w-1 shrink-0 rounded-full bg-[#ffb800] sm:block" aria-hidden />
            <div className="min-w-0 text-center sm:text-left">
              <p className="font-display text-sm font-bold leading-snug tracking-tight text-[#0f2847] dark:text-white">
                {tm.name}
              </p>
              <p className="mt-0.5 text-[0.65rem] font-semibold uppercase leading-snug tracking-[0.1em] text-[#ffb800]">
                {tm.role}
              </p>
            </div>
          </div>
        </div>

        <div
          className="mx-auto h-px w-14 bg-gradient-to-r from-transparent via-[#ffb800] to-transparent sm:mx-0 sm:h-[4.25rem] sm:w-px sm:self-center sm:bg-gradient-to-b"
          aria-hidden
        />

        <div className="flex min-w-0 flex-1 flex-col justify-center sm:pl-4">
          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-[#0f2847]/5 via-[#ffb800]/10 to-transparent px-3 py-3 dark:from-white/5 dark:via-[#ffb800]/10 dark:to-transparent">
            <blockquote
              ref={quoteRef}
              lang={i18n.language}
              className={cn(
                "text-pretty text-justify text-[0.9rem] font-normal leading-[1.65] tracking-[0.01em] text-[#1e3a5f] hyphens-auto dark:text-slate-200",
                !expanded && "line-clamp-4"
              )}
            >
              {tm.text}
            </blockquote>
            {needsToggle && (
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpanded((e) => !e)}
                className="mt-2 w-fit self-end text-sm font-semibold text-[#0f2847] underline-offset-2 hover:underline dark:text-[#ffb800]"
              >
                {expanded ? t("community.readLess") : t("community.readMore")}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function ShareTestimonialCard({ onFormOpenChange }: { onFormOpenChange?: (open: boolean) => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName("");
    setRole("");
    setText("");
    setEmail("");
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    onFormOpenChange?.(next);
    if (!next) resetForm();
  };

  const onPickImage = (file: File | null) => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: t("community.shareFormNeedImage"), variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !text.trim() || !email.trim()) {
      toast({ title: t("community.shareFormNeedFields"), variant: "destructive" });
      return;
    }
    if (!imageFile) {
      toast({ title: t("community.shareFormNeedImage"), variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const photoDataUrl = await compressImageToDataUrl(imageFile);
      const message = [
        "Soumission témoignage communauté",
        `Nom affiché: ${name.trim()}`,
        `Titre / rôle: ${role.trim()}`,
        "",
        "Texte à afficher:",
        text.trim(),
        "",
        `Fichier original: ${imageFile.name}`,
        "Photo (JPEG compressé):",
        photoDataUrl,
      ].join("\n");

      await submitContactForm({
        name: name.trim(),
        email: email.trim(),
        subject: t("community.shareSubject"),
        message,
      });

      toast({ title: t("community.shareFormSuccess") });
      handleOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: t("admin.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article
      className={cn(
        "relative flex h-full min-h-[210px] shrink-0 flex-col justify-between overflow-hidden border border-[#ffb800]/40 bg-[#0f2847] p-5 text-white sm:p-6",
        VOICE_CARD_WIDTH
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-[#ffb800]" aria-hidden />
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 border border-[#ffb800]/25" aria-hidden />
      <div className="pointer-events-none absolute -bottom-10 -left-6 h-20 w-20 border border-white/10" aria-hidden />

      <div className="relative">
        <div className="mb-3 inline-flex h-9 w-9 items-center justify-center bg-[#ffb800] text-[#0f2847]">
          <PenLine className="h-4 w-4" />
        </div>
        <h3 className="font-display text-lg font-bold leading-snug tracking-tight sm:text-xl">
          {t("community.shareTitle")}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-white/80 sm:text-sm">{t("community.shareDesc")}</p>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="relative mt-5 inline-flex w-fit items-center gap-2 bg-[#ffb800] px-4 py-2 text-sm font-bold text-[#0f2847] transition-colors hover:bg-[#e6a600]"
          >
            {t("community.shareCta")}
            <ArrowRight className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto border-[#0f2847]/15 bg-white dark:bg-[#0c1a2e]">
          <DialogHeader>
            <DialogTitle className="text-[#0f2847] dark:text-white">{t("community.shareFormTitle")}</DialogTitle>
            <DialogDescription>{t("community.shareFormDesc")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-1 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200">
                {t("community.shareFormImage")}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[#ffb800]/70 bg-[#ffb800]/5 p-3 text-left transition-colors hover:bg-[#ffb800]/10"
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#0f2847]/10">
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-6 w-6 text-[#0f2847]/70 dark:text-[#ffb800]" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#0f2847] dark:text-white">
                    {imagePreview ? t("community.shareFormImageChange") : t("community.shareFormImage")}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                    {t("community.shareFormImageHint")}
                  </span>
                </span>
              </button>
            </div>

            <div>
              <label htmlFor="tm-name" className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200">
                {t("community.shareFormName")}
              </label>
              <input
                id="tm-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#0f2847] outline-none ring-[#ffb800] focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="tm-role" className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200">
                {t("community.shareFormRole")}
              </label>
              <input
                id="tm-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#0f2847] outline-none ring-[#ffb800] focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="tm-text" className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200">
                {t("community.shareFormText")}
              </label>
              <textarea
                id="tm-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                rows={4}
                placeholder={t("community.shareFormTextPlaceholder")}
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#0f2847] outline-none ring-[#ffb800] focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="tm-email" className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200">
                {t("community.shareFormEmail")}
              </label>
              <input
                id="tm-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#0f2847] outline-none ring-[#ffb800] focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 bg-[#ffb800] px-4 py-2.5 text-sm font-bold text-[#0f2847] transition-colors hover:bg-[#e6a600] disabled:opacity-60"
            >
              {submitting ? t("community.shareFormSending") : t("community.shareFormSubmit")}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </article>
  );
}

function VoicesCarousel({ testimonials }: { testimonials: VoiceTestimonial[] }) {
  const { t } = useTranslation();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const pausedRef = useRef(false);
  const animatingRef = useRef(false);
  const dirRef = useRef(1);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef(0);

  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);
  }, []);

  const clearTimers = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    resumeTimerRef.current = null;
    dwellTimerRef.current = null;
  }, []);

  const pauseAuto = useCallback(
    (ms = 0) => {
      pausedRef.current = true;
      clearTimers();
      if (ms > 0) {
        resumeTimerRef.current = setTimeout(() => {
          pausedRef.current = false;
        }, ms);
      }
    },
    [clearTimers]
  );

  const resumeAuto = useCallback(() => {
    clearTimers();
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, 700);
  }, [clearTimers]);

  const animateScrollTo = useCallback((targetLeft: number, duration = 1600) => {
    const el = scrollerRef.current;
    if (!el || animatingRef.current) return Promise.resolve();

    const start = el.scrollLeft;
    const distance = targetLeft - start;
    if (Math.abs(distance) < 2) {
      el.scrollLeft = targetLeft;
      updateArrows();
      return Promise.resolve();
    }

    animatingRef.current = true;
    const t0 = performance.now();

    return new Promise<void>((resolve) => {
      const step = (now: number) => {
        const progress = Math.min(1, (now - t0) / duration);
        el.scrollLeft = start + distance * easeInOutCubic(progress);
        updateArrows();
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          animatingRef.current = false;
          resolve();
        }
      };
      rafRef.current = requestAnimationFrame(step);
    });
  }, [updateArrows]);

  const getStepAmount = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return 320;
    const card = el.querySelector("article");
    const styles = window.getComputedStyle(el);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "20") || 20;
    const width = card instanceof HTMLElement ? card.offsetWidth : 320;
    return width + gap;
  }, []);

  const scrollByCard = useCallback(
    (dir: 1 | -1, fromUser = true) => {
      const el = scrollerRef.current;
      if (!el) return;
      if (fromUser) pauseAuto(6500);
      dirRef.current = dir;
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      const step = getStepAmount();
      const target = Math.min(max, Math.max(0, el.scrollLeft + dir * step));
      void animateScrollTo(target, fromUser ? 700 : 900);
    },
    [animateScrollTo, getStepAmount, pauseAuto]
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, testimonials.length]);

  // Auto-avance fluide et lente (carte par carte, ping-pong)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const scheduleNext = () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = setTimeout(async () => {
        if (pausedRef.current || animatingRef.current || document.hidden) {
          scheduleNext();
          return;
        }

        const max = el.scrollWidth - el.clientWidth;
        if (max <= 8) {
          scheduleNext();
          return;
        }

        const nearEnd = el.scrollLeft >= max - 12;
        const nearStart = el.scrollLeft <= 12;
        if (nearEnd) dirRef.current = -1;
        else if (nearStart) dirRef.current = 1;

        const step = getStepAmount();
        const target = Math.min(max, Math.max(0, el.scrollLeft + dirRef.current * step));
        await animateScrollTo(target, 900);
        scheduleNext();
      }, 5000);
    };

    scheduleNext();

    const onEnter = () => pauseAuto(0);
    const onLeave = () => resumeAuto();
    const onTouch = () => pauseAuto(5000);
    const onVisibility = () => {
      if (document.hidden) pauseAuto(0);
      else resumeAuto();
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("focusin", onEnter);
    el.addEventListener("focusout", onLeave);
    el.addEventListener("touchstart", onTouch, { passive: true });
    el.addEventListener("pointerdown", onTouch);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearTimers();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      animatingRef.current = false;
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("focusin", onEnter);
      el.removeEventListener("focusout", onLeave);
      el.removeEventListener("touchstart", onTouch);
      el.removeEventListener("pointerdown", onTouch);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [
    animateScrollTo,
    clearTimers,
    getStepAmount,
    pauseAuto,
    resumeAuto,
    testimonials.length,
  ]);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto px-1 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((tm, i) => (
          <motion.div
            key={`${tm.name}-${i}`}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            animate={{ y: [0, -6, 0] }}
            transition={{
              opacity: { duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
              y: {
                duration: 5.4 + i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8 + i * 0.35,
              },
            }}
            className="flex will-change-transform"
          >
            <VoiceTestimonialCard tm={tm} />
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          animate={{ y: [0, -6, 0] }}
          transition={{
            opacity: {
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
              delay: testimonials.length * 0.08,
            },
            y: {
              duration: 5.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8 + testimonials.length * 0.35,
            },
          }}
          className="flex will-change-transform"
        >
          <ShareTestimonialCard
            onFormOpenChange={(open) => {
              if (open) pauseAuto(0);
              else resumeAuto();
            }}
          />
        </motion.div>
      </div>

      <button
        type="button"
        onClick={() => scrollByCard(-1, true)}
        disabled={!canPrev}
        aria-label={t("community.voicesPrev")}
        className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-black/15 bg-white text-[#0f2847] shadow-sm transition hover:border-[#ffb800] hover:bg-[#ffb800] disabled:cursor-not-allowed disabled:opacity-35 md:h-10 md:w-10 dark:border-[#3b82f6]/45 dark:bg-[#152a48] dark:text-[#93c5fc] dark:hover:border-[#ffb800] dark:hover:bg-[#ffb800] dark:hover:text-[#0f2847]"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1, true)}
        disabled={!canNext}
        aria-label={t("community.voicesNext")}
        className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-black/15 bg-white text-[#0f2847] shadow-sm transition hover:border-[#ffb800] hover:bg-[#ffb800] disabled:cursor-not-allowed disabled:opacity-35 md:h-10 md:w-10 dark:border-[#3b82f6]/45 dark:bg-[#152a48] dark:text-[#93c5fc] dark:hover:border-[#ffb800] dark:hover:bg-[#ffb800] dark:hover:text-[#0f2847]"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={2} />
      </button>
    </div>
  );
}

/** Contenu principal (réutilisé sur /community et /blockchains#community) */
export function CommunityPageBody() {
  const { t } = useTranslation();
  const whatsappUrl = (import.meta.env.VITE_COMMUNITY_WHATSAPP_URL as string | undefined)?.trim();

  type JoinPath = {
    title: string;
    desc: string;
    href: string;
    cta: string;
    image: string;
    Icon: typeof MessageCircle | typeof Calendar | typeof WhatsAppIcon;
    external?: boolean;
  };

  const joinPaths: JoinPath[] = [
    ...(whatsappUrl
      ? [
          {
            title: t("community.whatsapp"),
            desc: t("community.whatsappDesc"),
            href: whatsappUrl,
            cta: t("community.getStarted"),
            image: "/onboarding/onboarding-4.jpg",
            Icon: WhatsAppIcon,
            external: true,
          } satisfies JoinPath,
        ]
      : []),
    {
      title: t("community.contact"),
      desc: t("community.contactDesc"),
      href: "/contact?subject=" + encodeURIComponent(t("community.title")),
      cta: t("community.getStarted"),
      image: "/onboarding/onboarding-1.jpg",
      Icon: MessageCircle,
    },
    {
      title: t("community.attend"),
      desc: t("community.attendDesc"),
      href: "/events",
      cta: t("community.attendCta"),
      image: "/onboarding/onboarding-3.jpg",
      Icon: Calendar,
    },
  ];

  const testimonials: VoiceTestimonial[] = [
    {
      name: "Sarah M.",
      role: "Web3 Developer",
      text: t("community.test1"),
      image: "/onboarding/testimonials/testimonial-1.png",
    },
    {
      name: "Jean-Pierre K.",
      role: "Student",
      text: t("community.test2"),
      image: "/onboarding/onboarding-1.jpg",
    },
    {
      name: "Amina B.",
      role: "Entrepreneur",
      text: t("community.test3"),
      image: "/onboarding/onboarding-5.jpg",
    },
  ];

  const teamMosaic = [
    "/onboarding/onboarding-2.jpg",
    "/onboarding/onboarding-6.jpg",
    "/community/team-bg.PNG",
  ];

  return (
    <div className="bg-white text-[#0f2847] dark:bg-background dark:text-foreground">
      {/* Accueil chaleureux */}
      <section className="relative min-h-[58vh] overflow-hidden md:min-h-[64vh]">
        <img
          src="/onboarding/onboarding-2.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2847]/92 via-[#0f2847]/72 to-[#0f2847]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f2847]/50 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[58vh] max-w-[1200px] flex-col justify-end px-4 py-14 sm:px-6 md:min-h-[64vh] md:px-8 md:py-20 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="max-w-2xl"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#ffb800]">
              {t("community.welcomeKicker")}
            </p>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              {t("community.title")}
              {t("community.titleHighlight") ? (
                <>
                  {" "}
                  <span className="text-[#ffb800]">{t("community.titleHighlight")}</span>
                </>
              ) : null}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              {t("community.subtitle")}
            </p>
            <a
              href="#rejoindre"
              className="mt-8 inline-flex items-center gap-2 bg-[#ffb800] px-6 py-3 text-sm font-bold text-[#0f2847] transition-colors hover:bg-[#e6a600]"
            >
              {t("community.welcomeCta")}
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Chemins pour rejoindre — bandes éditoriales */}
      <section id="rejoindre" className="scroll-mt-28 py-16 md:py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10">
          <motion.div {...fadeUp} className="mb-10 max-w-2xl md:mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl">
              {t("community.howTitle")}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#315795] dark:text-slate-300 md:text-lg">
              {t("community.howSubtitle")}
            </p>
          </motion.div>

          <div className="space-y-5 md:space-y-6">
            {joinPaths.map((path, i) => {
              const Icon = path.Icon;
              const reverse = i % 2 === 1;
              return (
                <motion.article
                  key={path.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                  className={cn(
                    "grid overflow-hidden border border-slate-200 bg-[#fafafa] dark:border-slate-700 dark:bg-slate-900/30",
                    "md:grid-cols-12 md:min-h-[240px]"
                  )}
                >
                  <div
                    className={cn(
                      "relative min-h-[200px] md:col-span-5 md:min-h-full",
                      reverse && "md:order-2"
                    )}
                  >
                    <img
                      src={path.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[#0f2847]/15" />
                  </div>
                  <div
                    className={cn(
                      "flex flex-col justify-center px-5 py-7 sm:px-7 md:col-span-7 md:px-10 md:py-8",
                      reverse && "md:order-1"
                    )}
                  >
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center bg-[#0f2847] text-[#ffb800]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-[#0f2847] dark:text-white md:text-2xl">
                      {path.title}
                    </h3>
                    <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed text-[#315795] dark:text-slate-300">
                      {path.desc}
                    </p>
                    <a
                      href={path.href}
                      {...(path.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="mt-6 inline-flex w-fit items-center gap-2 bg-[#ffb800] px-5 py-2.5 text-sm font-bold text-[#0f2847] transition-colors hover:bg-[#e6a600]"
                    >
                      {path.cta}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Team — mosaïque + invitation */}
      <section className="border-y border-slate-200 bg-[#0f2847] py-16 text-white md:py-20 dark:border-slate-800">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-12 md:px-8 lg:px-10">
          <motion.div
            {...fadeUp}
            className="grid grid-cols-2 gap-2 sm:gap-3"
          >
            <div className="relative col-span-2 aspect-[16/9] overflow-hidden sm:aspect-[2/1]">
              <img src={teamMosaic[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={teamMosaic[1]} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={teamMosaic[2]} alt="" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-[#ffb800]/20 mix-blend-multiply" />
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ffb800]">
              {t("community.coreTeamKicker")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              {t("community.coreTeamTitle")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/85 md:text-lg">
              {t("community.coreTeamSubtitle")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
              {t("community.coreTeamDesc")}
            </p>
            <Link
              to="/team"
              className="mt-8 inline-flex items-center gap-2 bg-[#ffb800] px-6 py-3 text-sm font-bold text-[#0f2847] transition-colors hover:bg-[#e6a600]"
            >
              {t("community.coreTeamCta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Partenariat — conversation visuelle */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10">
          <div className="grid overflow-hidden border border-slate-200 dark:border-slate-700 lg:grid-cols-12">
            <motion.div
              {...fadeUp}
              className="relative min-h-[280px] lg:col-span-5 lg:min-h-full"
            >
              <img
                src="/onboarding/onboarding-5.jpg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f2847]/70 to-transparent lg:bg-gradient-to-r" />
              <p className="absolute bottom-6 left-6 right-6 text-lg font-semibold leading-snug text-white md:text-xl">
                {t("community.partnershipQuote")}
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.08 }}
              className="flex flex-col justify-center bg-white px-6 py-10 dark:bg-slate-900/50 sm:px-8 md:px-10 lg:col-span-7 lg:py-14"
            >
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl">
                {t("community.partnershipTitle")}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#315795] dark:text-slate-300 md:text-lg">
                {t("community.partnershipDesc")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={`/contact?subject=${encodeURIComponent(t("community.partnershipCta"))}`}
                  className="inline-flex items-center justify-center gap-2 bg-[#ffb800] px-6 py-3 text-sm font-bold text-[#0f2847] transition-colors hover:bg-[#e6a600]"
                >
                  {t("community.partnershipApply")}
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  to="/partners"
                  className="inline-flex items-center justify-center gap-2 border border-[#0f2847] bg-transparent px-6 py-3 text-sm font-bold text-[#0f2847] transition-colors hover:bg-[#0f2847] hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-[#0f2847]"
                >
                  {t("community.partnershipCta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Voix */}
      <section className="bg-[#f7f8fa] py-16 dark:bg-slate-950/50 md:py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8 lg:px-10">
          <motion.div {...fadeUp} className="mb-8 max-w-2xl md:mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-[#0f2847] dark:text-white md:text-4xl">
              {t("community.voicesTitle")}
            </h2>
            <p className="mt-3 text-base text-[#315795] dark:text-slate-300 md:text-lg">
              {t("community.voicesSubtitle")}
            </p>
          </motion.div>
          <VoicesCarousel testimonials={testimonials} />
        </div>
      </section>
    </div>
  );
}

const Community = () => (
  <div className="pt-20">
    <CommunityPageBody />
  </div>
);

export default Community;
