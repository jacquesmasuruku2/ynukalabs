import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const useHeroAnimations = (isLoading: boolean) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return; // Ne pas lancer les animations pendant le chargement

    const tl = gsap.timeline();

    // Configuration initiale (état avant animation)
    gsap.set(titleRef.current, {
      y: 100,
      opacity: 0,
      overflow: 'hidden'
    });

    gsap.set(buttonsRef.current, {
      y: 20,
      opacity: 0
    });

    gsap.set(navigationRef.current, {
      y: 20,
      opacity: 0
    });

    // Animation du titre principal avec effet "reveal"
    tl.to(titleRef.current, {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power3.out",
      onComplete: () => {
        // Rétablir overflow après l'animation
        gsap.set(titleRef.current, { overflow: 'visible' });
      }
    });

    // Animation des boutons avec stagger
    tl.to(buttonsRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.6");

    // Animation de la navigation
    tl.to(navigationRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.4");

    // Animation des éléments décoratifs
    tl.fromTo('.hero-decoration', {
      scale: 0,
      opacity: 0
    }, {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: "back.out(1.7)",
      stagger: 0.1
    }, "-=0.3");

    return () => {
      tl.kill();
    };
  }, [isLoading]);

  return {
    heroRef,
    titleRef,
    buttonsRef,
    navigationRef
  };
};
