import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useGlobalLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  return { isLoading, handlePreloaderComplete };
};
