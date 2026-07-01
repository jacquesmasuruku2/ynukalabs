import { useEffect, useRef } from 'react';
import './LikeAnimation.css';

interface LikeAnimationProps {
  trigger: boolean;
  x: number;
  y: number;
}

const LikeAnimation = ({ trigger, x, y }: LikeAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trigger && containerRef.current) {
      const emojis = ['👍', '❤️', '🎉', '🔥', '✨', '💯', '🙌', '😍'];

      // Créer 15-25 emojis aléatoires pour un effet spectaculaire
      const count = Math.floor(Math.random() * 11) + 15;

      for (let i = 0; i < count; i++) {
        const emoji = document.createElement('div');
        emoji.className = 'like-emoji';
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        // Position de départ: bas de l'écran avec variation horizontale
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 50;
        emoji.style.left = `${startX}px`;
        emoji.style.top = `${startY}px`;

        // Position finale: haut de l'écran avec dispersion large
        const endX = x + (Math.random() - 0.5) * 400;
        const endY = Math.random() * (window.innerHeight * 0.3); // Jusqu'à 30% du haut de l'écran
        emoji.style.setProperty('--end-x', `${endX}px`);
        emoji.style.setProperty('--end-y', `${endY}px`);

        // Rotation aléatoire
        const rotation = (Math.random() - 0.5) * 120;
        emoji.style.setProperty('--rotation', `${rotation}deg`);

        // Taille aléatoire plus grande
        const scale = 1 + Math.random() * 1.5;
        emoji.style.setProperty('--scale', `${scale}`);

        // Délai aléatoire pour effet cascade
        const delay = Math.random() * 0.5;
        emoji.style.animationDelay = `${delay}s`;

        // Durée d'animation variable
        const duration = 1.5 + Math.random() * 1;
        emoji.style.animationDuration = `${duration}s`;

        containerRef.current.appendChild(emoji);

        // Supprimer l'emoji aprèsl'animation
        setTimeout(() => {
          emoji.remove();
        }, (duration + delay) * 1000);
      }
    }
  }, [trigger, x, y]);

  return <div ref={containerRef} className="like-animation-container" />;
};

export default LikeAnimation;
