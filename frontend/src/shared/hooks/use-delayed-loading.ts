import { useEffect, useState } from "react";

type DelayedLoadingOptions = {
  totalMs?: number;
  delayMs?: number;
};

export function useDelayedLoading(options: DelayedLoadingOptions = {}) {
  const { totalMs = 900, delayMs = 180 } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    const skeletonTimer = window.setTimeout(() => setShowSkeleton(true), delayMs);
    const finishTimer = window.setTimeout(() => {
      setIsLoaded(true);
      setShowSkeleton(false);
    }, totalMs);

    return () => {
      window.clearTimeout(skeletonTimer);
      window.clearTimeout(finishTimer);
    };
  }, [delayMs, totalMs]);

  return {
    isLoaded,
    showSkeleton,
  };
}
