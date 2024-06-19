// src/components/Header/Header.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import GlobalSearch from '../common/GlobalSearch';
import styles from './Header.module.css';

const Header: React.FC = () => {
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
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, handleClickOutside]);

  const handleSearchSelect = (result: string) => {
    console.log(`Selected result: ${result}`);
  };

  return (
    <header className={`${styles.header} d-flex justify-content-between align-items-center p-3`} style={{ zIndex: 1100 }}>
      <div className={styles['search-container']}>
        <GlobalSearch filter="all" placeholder="Global search..." onSelect={handleSearchSelect} />
      </div>
      <div className={`${styles['user-info-container']} d-flex align-items-center`}>
        <FontAwesomeIcon icon={faBell} className={styles['bell-icon']} onClick={handleBellClick} />
        {showNotifications && (
          <div ref={notificationRef} className={styles['notification-panel']}>
            <p>No new notifications</p>
          </div>
        )}
        <img src="/path-to-agent-profile-pic.jpg" alt="Agent" className={`${styles['profile-pic']} rounded-circle`} />
        <span className="user-name ml-2">John Doe</span>
      </div>
    </header>
  );
};

export default React.memo(Header);
