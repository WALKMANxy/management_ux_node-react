import { useCallback, useEffect, useRef, useState } from "react";

const useResizeObserver = <T extends HTMLElement>(
  initialDimensions = { width: 0, height: 0 }
) => {
  const [dimensions, setDimensions] = useState(initialDimensions);
  const containerRef = useRef<T>(null);

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    if (entries[0]?.contentRect) {
      const { width, height } = entries[0].contentRect;
      setDimensions((prevDimensions) => {
        if (
          prevDimensions.width !== width ||
          prevDimensions.height !== height
        ) {
          return { width, height };
        }
        return prevDimensions;
      });
    }
  }, []);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      console.error("ResizeObserver is not supported in this browser.");
      return;
    }

    const observer = new ResizeObserver(handleResize);
    const currentContainer = containerRef.current;

    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, [handleResize]);

  return { containerRef, dimensions };
};

export default useResizeObserver;
