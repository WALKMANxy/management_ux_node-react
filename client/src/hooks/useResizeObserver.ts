// src/hooks/useResizeObserver.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "../services/toastMessage";

/**
 * Interface representing the dimensions of an element.
 */
interface Dimensions {
  width: number;
  height: number;
}

/**
 * Custom hook to observe the size of a DOM element using ResizeObserver.
 *
 * @template T - The type of the HTML element to observe.
 * @param {Dimensions} [initialDimensions] - The initial dimensions of the element.
 * @returns {{
 *   containerRef: React.RefObject<T>;
 *   dimensions: Dimensions;
 * }} An object containing the ref to attach to the element and its current dimensions.
 *
 * @example
 * const { containerRef, dimensions } = useResizeObserver<HTMLDivElement>();
 * return <div ref={containerRef}>Width: {dimensions.width}, Height: {dimensions.height}</div>;
 */
const useResizeObserver = <T extends HTMLElement>(
  initialDimensions: Dimensions = { width: 0, height: 0 }
) => {
  const { t } = useTranslation(); // Initialize translation
  const [dimensions, setDimensions] = useState<Dimensions>(initialDimensions);
  const containerRef = useRef<T>(null);

  /**
   * Callback to handle resize events from ResizeObserver.
   *
   * @param {ResizeObserverEntry[]} entries - The entries observed by ResizeObserver.
   */
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
      showToast.error(t("resizeObserver.unsupported"));
      console.error(t("resizeObserver.unsupported"));
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
      observer.disconnect();
    };
  }, [handleResize, t]);

  return { containerRef, dimensions };
};

export default useResizeObserver;
