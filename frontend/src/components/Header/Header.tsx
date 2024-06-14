import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faSearch } from '@fortawesome/free-solid-svg-icons';
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

  return (
    <header className={`${styles.header} d-flex justify-content-between align-items-center p-3`}>
      <div className={styles['search-container']}>
        <FontAwesomeIcon icon={faSearch} className={styles['search-icon']} />
        <input type="text" className="form-control search-bar" placeholder="Search..." />
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
