import { useState } from 'react';

export const useGlobalLoader = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  return { isLoading, handlePreloaderComplete };
};
