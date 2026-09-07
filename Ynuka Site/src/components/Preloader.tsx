import { useEffect, useRef } from "react";
import gsap from "gsap";
import logo from "@/assets/logo.png";
import "./Preloader.css";

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

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
    if (overlay) {
      tl.to(overlay, {
        yPercent: -100,
        duration: 0.3,
        ease: "power4.inOut",
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
          <img className="preloader-logo" src={logo} alt="Ynuka Labs" />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
