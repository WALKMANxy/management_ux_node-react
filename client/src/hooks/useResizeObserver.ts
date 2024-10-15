// src/hooks/useResizeObserver.tsx
import { useEffect } from "react";

const useResizeObserver = (
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) => {
  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(() => {
      callback();
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, callback]);
};

export default useResizeObserver;
