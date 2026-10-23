import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";
import "./Preloader.css";

const NUM_DOTS = 28;
const RADIUS = 72;
const CENTER = 100;

const DOTS = Array.from({ length: NUM_DOTS }, (_, i) => {
  const t = i / (NUM_DOTS - 1);
  const angle = (i * 2 * Math.PI) / NUM_DOTS;
  const x = Number((CENTER + RADIUS * Math.cos(angle)).toFixed(2));
  const y = Number((CENTER + RADIUS * Math.sin(angle)).toFixed(2));
  const r = Number((1.2 + Math.pow(t, 1.6) * 7.2).toFixed(2));
  const opacity = Number((0.12 + Math.pow(t, 1.3) * 0.88).toFixed(2));
  const fill = t > 0.88 ? "#e0f7ff" : t > 0.5 ? "#38bdf8" : "#0284c7";
  const isGlow = t > 0.58;
  return { x, y, r, opacity, fill, isGlow };
});

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Keep visible for ~1.3s so the glowing spinner animation completes its cycle smoothly
    const timer = setTimeout(() => {
      setFading(true);
      const hideTimer = setTimeout(() => {
        setHidden(true);
        onComplete();
      }, 500);
      return () => clearTimeout(hideTimer);
    }, 1300);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (hidden) return null;

  return (
    <div
      className={`preloader-overlay ${fading ? "preloader-fade-out" : ""}`}
      aria-busy="true"
      aria-label="Chargement de Ynuka Labs"
    >
      <div className="relative flex items-center justify-center">
        {/* Circular Glowing Dot Spinner matching user reference */}
        <svg
          viewBox="0 0 200 200"
          className="w-48 h-48 sm:w-56 sm:h-56 preloader-spinner pointer-events-none"
          aria-hidden="true"
        >
          <defs>
            <filter id="cyan-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur1" />
              <feGaussianBlur stdDeviation="6" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {DOTS.map((dot, idx) => (
            <circle
              key={idx}
              cx={dot.x}
              cy={dot.y}
              r={dot.r}
              fill={dot.fill}
              opacity={dot.opacity}
              filter={dot.isGlow ? "url(#cyan-glow)" : undefined}
            />
          ))}
        </svg>

        {/* Small Ynuka Labs Logo in the center (replaces "LOADING" text) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={logo}
            alt="Ynuka Labs"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain preloader-logo-pulse"
          />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
