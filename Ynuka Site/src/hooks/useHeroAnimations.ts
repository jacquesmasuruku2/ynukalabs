import { useEffect, useRef } from "react";
import gsap from "gsap";

export const useHeroAnimations = (isLoading: boolean) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;

    const title = titleRef.current;
    const buttons = buttonsRef.current;
    const navigation = navigationRef.current;
    const hero = heroRef.current;
    const decorations = hero ? hero.querySelectorAll(".hero-decoration") : [];

    const tl = gsap.timeline();

    if (title) {
      gsap.set(title, {
        y: 100,
        opacity: 0,
        overflow: "hidden",
      });
      tl.to(title, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        onComplete: () => {
          gsap.set(title, { overflow: "visible" });
        },
      });
    }

    if (buttons) {
      gsap.set(buttons, {
        y: 20,
        opacity: 0,
      });
      tl.to(
        buttons,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        title ? "-=0.6" : 0
      );
    }

    if (navigation) {
      gsap.set(navigation, {
        y: 20,
        opacity: 0,
      });
      tl.to(
        navigation,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.4"
      );
    }

    if (decorations.length > 0) {
      tl.fromTo(
        decorations,
        {
          scale: 0,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          stagger: 0.1,
        },
        "-=0.3"
      );
    }

    return () => {
      tl.kill();
      if (title) gsap.set(title, { clearProps: "all" });
      if (buttons) gsap.set(buttons, { clearProps: "all" });
      if (navigation) gsap.set(navigation, { clearProps: "all" });
    };
  }, [isLoading]);

  return {
    heroRef,
    titleRef,
    buttonsRef,
    navigationRef,
  };
};
