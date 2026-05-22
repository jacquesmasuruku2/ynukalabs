import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Fade-in + slide-up au scroll pour les sections (hors première section / hero).
 * Les grilles avec Framer Motion conservent leurs animations existantes.
 */
export function useSubpageScrollReveal() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    if (isHome) return;

    const root = document.querySelector("main.site-inner-pages");
    if (!root) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const sections = Array.from(root.querySelectorAll<HTMLElement>("section"));
    const toReveal = sections.slice(1);

    if (prefersReduced) {
      toReveal.forEach((el) => el.classList.add("reveal-on-scroll-visible"));
      return;
    }

    toReveal.forEach((el) => {
      el.classList.add("reveal-on-scroll");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add("reveal-on-scroll-visible");
          observer.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );

    toReveal.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isHome, pathname]);
}
