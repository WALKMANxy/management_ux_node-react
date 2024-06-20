import { useState, useRef, useEffect, useCallback } from "react";

const useNotifications = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleBellClick = useCallback(() => {
    setShowNotifications(!showNotifications);
  }, [showNotifications]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
      setShowNotifications(false);
    }
  }, []);

  useEffect(() => {
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications, handleClickOutside]);

  return {
    showNotifications,
    handleBellClick,
    notificationRef,
  };
};

export default useNotifications;
