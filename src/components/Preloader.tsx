import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./Preloader.css";

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const tensRef = useRef<HTMLDivElement>(null);
  const unitsRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        if (overlay) {
          overlay.classList.add("preloader-overlay--done");
        }
        onComplete();
      },
    });

    const digitStep = () => {
      const col = tensRef.current?.parentElement;
      return Math.max(col?.clientHeight ?? 140, 1);
    };

    const animateCounter = () => {
      const targetValue = 99;
      const duration = 3;

      return gsap.to(
        { value: 0 },
        {
          value: targetValue,
          duration,
          ease: "cubic-bezier(0.4, 0.0, 0.2, 1)",
          onUpdate: function () {
            const raw = this.targets()[0].value as number;
            const currentValue = Math.floor(raw);
            const h = digitStep();
            const tens = Math.floor(currentValue / 10);
            const units = currentValue % 10;
            gsap.set(tensRef.current, { y: -tens * h });
            gsap.set(unitsRef.current, { y: -units * h });
            const fill = progressFillRef.current;
            if (fill) {
              const pct = Math.min(100, (raw / targetValue) * 100);
              fill.style.width = `${pct}%`;
            }
          },
          onComplete: function () {
            const h = digitStep();
            gsap.set(tensRef.current, { y: -9 * h });
            gsap.set(unitsRef.current, { y: -9 * h });
            const fill = progressFillRef.current;
            if (fill) fill.style.width = "100%";
          },
        }
      );
    };

    tl.add(animateCounter());
    if (overlay) {
      tl.to(overlay, {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut",
        delay: 0.3,
      });
    }

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div ref={overlayRef} className="preloader-overlay">
      <div className="preloader-stage" aria-busy="true" aria-live="polite">
        <div className="preloader-quad preloader-quad--tl" aria-hidden />
        <div className="preloader-quad preloader-quad--tr" aria-hidden />
        <div className="preloader-quad preloader-quad--bl" aria-hidden />
        <div className="preloader-quad preloader-quad--br" aria-hidden />
        <div className="preloader-cross" aria-hidden />

        <div className="preloader-core">
          <div className="preloader-counter-wrap">
            <div className="digit-wrapper">
              <div className="digit-column">
                <div className="digit-strip" ref={tensRef}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <div key={num} className="digit">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
              <div className="digit-column">
                <div className="digit-strip" ref={unitsRef}>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <div key={num} className="digit">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
              <div className="percent">%</div>
            </div>
          </div>

          <div className="preloader-progress" role="progressbar" aria-valuemin={0} aria-valuemax={99} aria-label="Chargement">
            <div className="preloader-progress-track">
              <div ref={progressFillRef} className="preloader-progress-fill" />
            </div>
          </div>

          <p className="preloader-loading-label">CHARGEMENT</p>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
