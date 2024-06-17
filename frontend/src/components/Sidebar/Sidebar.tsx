import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUser, faEnvelope, faChartBar, faTags, faExclamationTriangle, faSignOutAlt, faHome } from '@fortawesome/free-solid-svg-icons';
import { useSidebar } from '../../hooks/useSidebar'; // Adjust the path as needed
import './Sidebar.css';

interface SidebarProps {
  onToggle: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  useEffect(() => {
    onToggle(isSidebarOpen);
  }, [isSidebarOpen, onToggle]);

  return (
    <>
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="logo">Logo</div>
        <nav>
          <ul>
          <li>
              <FontAwesomeIcon icon={faHome} className="sidebar-icon" />
              <a href="#dashboard">Dashboard</a>
            </li>
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
        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
      </button>
    </>
  );
};

export default React.memo(Sidebar);
