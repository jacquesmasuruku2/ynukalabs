import { useState, useEffect, useRef } from "react";

interface UseCountUpProps {
  end: number;
  duration?: number;
  startOnView?: boolean;
}

export const useCountUp = ({
  end,
  duration = 2000,
  startOnView = true,
}: UseCountUpProps) => {
  const [count, setCount] = useState(0);
  const [barProgress, setBarProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnView);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const endTime = startTime + duration;
    let frame = 0;

    const animate = () => {
      const now = Date.now();
      const t = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - t, 4);
      const currentCount = Math.floor(easeOutQuart * end);

      setCount(currentCount);
      setBarProgress(easeOutQuart);

      if (now < endTime) {
        frame = requestAnimationFrame(animate);
      } else {
        setCount(end);
        setBarProgress(1);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [end, duration, isVisible]);

  useEffect(() => {
    if (!startOnView) return;

    const node = elementRef.current;
    if (!node) return;

    const start = () => setIsVisible(true);

    const rect = node.getBoundingClientRect();
    const alreadyVisible =
      rect.top < window.innerHeight * 0.92 && rect.bottom > 0 && rect.height > 0;
    if (alreadyVisible) {
      start();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: "80px 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [startOnView]);

  return { count, barProgress, elementRef };
};
