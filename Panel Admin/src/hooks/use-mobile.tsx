import * as React from "react";

// Align with Tailwind's md breakpoint (768px)
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Initialize with the correct value immediately to avoid SSR mismatch
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // During SSR, we can't access window, so return false
    // On client, check actual viewport width
    if (typeof window === "undefined") {
      return false;
    }
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    // Use the exact Tailwind breakpoint: md starts at 768px
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    // Ensure state is set on mount
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
