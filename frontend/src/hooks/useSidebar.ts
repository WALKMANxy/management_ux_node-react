// src/hooks/useSidebar.ts
import { useState, useEffect, useCallback } from "react";

export const useSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prevState) => !prevState);
  }, []);

  const handleResize = useCallback(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize(); // Call it initially to set the correct state based on initial window size

    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return { isSidebarOpen, toggleSidebar };
};
