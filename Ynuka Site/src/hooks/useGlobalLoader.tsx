import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useGlobalLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    
    // Réduire à 1.5 secondes pour une meilleure expérience utilisateur
    // Le scroll est déjà autorisé, donc pas besoin d'attendre longtemps
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  return { isLoading, handlePreloaderComplete };
};
