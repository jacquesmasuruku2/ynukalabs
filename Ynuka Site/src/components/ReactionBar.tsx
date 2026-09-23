import { AnimatePresence, motion } from "framer-motion";
import { Heart, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchContentReactions, toggleContentReaction } from "@/lib/api";

type ReactionType = "thumb" | "heart";

type ReactionCounts = {
  thumb: number;
  heart: number;
  user: ReactionType | null;
};

const STORAGE_PREFIX = "ynuka-reaction-bar:";

const defaultCounts = (thumb = 0, heart = 0): ReactionCounts => ({
  thumb,
  heart,
  user: null,
});

function readStorage(storageKey: string, fallbackThumb: number, fallbackHeart: number): ReactionCounts {
  if (typeof window === "undefined") return defaultCounts(fallbackThumb, fallbackHeart);

  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
    if (!saved) return defaultCounts(fallbackThumb, fallbackHeart);

    const parsed = JSON.parse(saved) as Partial<ReactionCounts>;
    const thumb = Number(parsed.thumb ?? fallbackThumb);
    const heart = Number(parsed.heart ?? fallbackHeart);
    return {
      thumb: Number.isFinite(thumb) ? Math.max(0, thumb) : fallbackThumb,
      heart: Number.isFinite(heart) ? Math.max(0, heart) : fallbackHeart,
      user: parsed.user === "thumb" || parsed.user === "heart" ? parsed.user : null,
    };
  } catch {
    return defaultCounts(fallbackThumb, fallbackHeart);
  }
}

interface ReactionBarProps {
  storageKey: string;
  resourceType?: string;
  resourceId?: string;
  userEmail?: string | null;
  initialThumbs?: number;
  initialHearts?: number;
  compact?: boolean;
  className?: string;
  onRequireAuth?: () => void;
}

export default function ReactionBar({
  storageKey,
  resourceType,
  resourceId,
  userEmail,
  initialThumbs = 0,
  initialHearts = 0,
  compact = false,
  className = "",
  onRequireAuth,
}: ReactionBarProps) {
  const [counts, setCounts] = useState<ReactionCounts>(() =>
    defaultCounts(initialThumbs, initialHearts)
  );
  const [bursts, setBursts] = useState<Array<{ id: number; reaction: ReactionType; x: number; y: number }>>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = readStorage(storageKey, initialThumbs, initialHearts);
    setCounts(stored);
    setIsHydrated(true);
  }, [storageKey, initialThumbs, initialHearts]);

  useEffect(() => {
    if (!resourceType || !resourceId || !isHydrated) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const payload = await fetchContentReactions(resourceType, resourceId, userEmail || undefined);
        setCounts((current) => ({
          thumb: payload.thumb ?? current.thumb,
          heart: payload.heart ?? current.heart,
          user: payload.user ?? current.user,
        }));
      } catch {
        // keep the local fallback if the server is temporarily unavailable
      }
    })();
    return () => controller.abort();
  }, [resourceType, resourceId, userEmail, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(
      `${STORAGE_PREFIX}${storageKey}`,
      JSON.stringify({
        thumb: counts.thumb,
        heart: counts.heart,
        user: counts.user,
      })
    );
  }, [counts, storageKey, isHydrated]);

  const triggerBurst = (reaction: ReactionType) => {
    const items = Array.from({ length: 9 }, (_, index) => ({
      id: Date.now() + index + Math.random(),
      reaction,
      x: (Math.random() - 0.5) * 96,
      y: -18 - Math.random() * 48,
    }));
    setBursts((current) => [...current, ...items]);
    window.setTimeout(() => {
      setBursts((current) => current.filter((item) => !items.some((burst) => burst.id === item.id)));
    }, 900);
  };

  const handleReact = async (reaction: ReactionType) => {
    if (!resourceType || !resourceId) {
      setCounts((current) => {
        let nextThumb = current.thumb;
        let nextHeart = current.heart;
        let nextUser = current.user;

        if (nextUser === reaction) {
          if (reaction === "thumb") nextThumb = Math.max(0, nextThumb - 1);
          if (reaction === "heart") nextHeart = Math.max(0, nextHeart - 1);
          nextUser = null;
        } else {
          if (nextUser === "thumb") nextThumb = Math.max(0, nextThumb - 1);
          if (nextUser === "heart") nextHeart = Math.max(0, nextHeart - 1);

          if (reaction === "thumb") nextThumb += 1;
          if (reaction === "heart") nextHeart += 1;
          nextUser = reaction;
        }

        return { thumb: nextThumb, heart: nextHeart, user: nextUser };
      });
      triggerBurst(reaction);
      return;
    }

    if (!userEmail) {
      onRequireAuth?.();
      return;
    }

    try {
      const payload = await toggleContentReaction({
        resourceType,
        resourceId,
        userEmail,
        reactionType: reaction,
      });
      setCounts({
        thumb: payload.thumb,
        heart: payload.heart,
        user: payload.user,
      });
      triggerBurst(reaction);
    } catch {
      // keep UI stable if the request fails
    }
  };

  const buttonBase =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className={`relative inline-flex flex-wrap items-center gap-2${className ? ` ${className}` : ""}`}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <AnimatePresence>
          {bursts.map((burst) => (
            <motion.span
              key={burst.id}
              initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 1], x: burst.x, y: burst.y }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 text-lg"
            >
              {burst.reaction === "thumb" ? "👍" : "💖"}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        aria-label="J’aime avec pouce"
        whileTap={{ scale: 0.92 }}
        onClick={() => handleReact("thumb")}
        className={`${buttonBase} ${
          counts.user === "thumb"
            ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-300"
            : "border-border bg-background/80 text-foreground hover:border-blue-300 hover:bg-blue-100/60 dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-blue-500 dark:hover:bg-blue-500/10"
        } ${compact ? "px-2.5 py-1 text-xs" : ""}`}
      >
        <ThumbsUp className={`h-4 w-4 ${counts.user === "thumb" ? "fill-current" : ""}`} />
        <span>{counts.thumb}</span>
      </motion.button>

      <motion.button
        type="button"
        aria-label="J’aime avec cœur"
        whileTap={{ scale: 0.92 }}
        onClick={() => handleReact("heart")}
        className={`${buttonBase} ${
          counts.user === "heart"
            ? "border-pink-500 bg-pink-500/10 text-pink-600 dark:border-pink-400 dark:bg-pink-500/15 dark:text-pink-300"
            : "border-border bg-background/80 text-foreground hover:border-pink-300 hover:bg-pink-100/60 dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-pink-500 dark:hover:bg-pink-500/10"
        } ${compact ? "px-2.5 py-1 text-xs" : ""}`}
      >
        <Heart className={`h-4 w-4 ${counts.user === "heart" ? "fill-current" : ""}`} />
        <span>{counts.heart}</span>
      </motion.button>
    </div>
  );
}
