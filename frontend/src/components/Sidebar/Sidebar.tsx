import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUser, faEnvelope, faChartBar, faTags, faExclamationTriangle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleResize = useCallback(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Call it initially to set the correct state based on initial window size

    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="logo">Logo</div>
        <nav>
          <ul>
            <li>
              <FontAwesomeIcon icon={faUser} className="sidebar-icon" />
              <a href="#clients">Clients</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faEnvelope} className="sidebar-icon" />
              <a href="#visits">Visits</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faChartBar} className="sidebar-icon" />
              <a href="#statistics">Statistics</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faTags} className="sidebar-icon" />
              <a href="#promos">Promos</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faExclamationTriangle} className="sidebar-icon" />
              <a href="#alerts">Alerts</a>
            </li>
          </ul>
          <ul className="logout">
            <li>
              <FontAwesomeIcon icon={faSignOutAlt} className="sidebar-icon" />
              <a href="#logout">Logout</a>
            </li>
          </ul>
        </nav>
      </div>
      <button className="toggle-button" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
      </button>
    </>
  );
};

export default React.memo(Sidebar);
