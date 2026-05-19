import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Marquee.css';

const Marquee = ({ text = "AFRICA BLOCKCHAIN FESTIVAL 2026 • COMING SOON" }) => {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    // Créer le contenu dupliqué pour un défilement infini
    const content = marquee.querySelector('.marquee-content') as HTMLElement;
    const originalContent = content.innerHTML;
    
    // Dupliquer le contenu plusieurs fois pour un défilement fluide
    content.innerHTML = originalContent + originalContent + originalContent;

    // Animation GSAP pour le défilement horizontal
    gsap.to(content, {
      x: -33.333, // 1/3 de la largeur (puisque nous avons 3 copies)
      duration: 20,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % 33.333)
      }
    });
  }, []);

  return (
    <div className="marquee-container">
      <div className="marquee-wrapper" ref={marqueeRef}>
        <div className="marquee-content">
          <span className="marquee-text">{text}</span>
        </div>
      </div>
    </div>
  );
};

export default Marquee;
