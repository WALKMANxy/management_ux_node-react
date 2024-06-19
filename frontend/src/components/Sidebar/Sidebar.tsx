// src/components/Sidebar/Sidebar.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUser, faEnvelope, faChartBar, faTags, faExclamationTriangle, faSignOutAlt, faHome } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { logout } from '../../features/auth/authSlice';
import { useSidebar } from '../../hooks/useSidebar';
import './Sidebar.css';

interface SidebarProps {
  onToggle: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const userRole = useSelector((state: RootState) => state.auth.userRole);
  const dispatch = useDispatch();

  useEffect(() => {
    onToggle(isSidebarOpen);
  }, [isSidebarOpen, onToggle]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const renderLinks = () => {
    switch (userRole) {
      case 'admin':
        return (
          <>
            <li>
              <FontAwesomeIcon icon={faHome} className="sidebar-icon" />
              <Link to="/admin-dashboard">Dashboard</Link>
            </li>
            <li>
              <FontAwesomeIcon icon={faUser} className="sidebar-icon" />
              <Link to="/clients">Clients</Link>
            </li>
            {/* Add other admin links here */}
          </>
        );
      case 'agent':
        return (
          <>
            <li>
              <FontAwesomeIcon icon={faHome} className="sidebar-icon" />
              <Link to="/agent-dashboard">Dashboard</Link>
            </li>
            <li>
              <FontAwesomeIcon icon={faUser} className="sidebar-icon" />
              <Link to="/clients">Clients</Link>
            </li>
            <li>
              <FontAwesomeIcon icon={faEnvelope} className="sidebar-icon" />
              <Link to="/visits">Visits</Link>
            </li>
            <li>
              <FontAwesomeIcon icon={faChartBar} className="sidebar-icon" />
              <Link to="/statistics">Statistics</Link>
            </li>
            <li>
              <FontAwesomeIcon icon={faTags} className="sidebar-icon" />
              <Link to="/promos">Promos</Link>
            </li>
            <li>
              <FontAwesomeIcon icon={faExclamationTriangle} className="sidebar-icon" />
              <Link to="/alerts">Alerts</Link>
            </li>
          </>
        );
      case 'client':
        return (
          <>
            <li>
              <FontAwesomeIcon icon={faHome} className="sidebar-icon" />
              <Link to="/client-dashboard">Dashboard</Link>
            </li>
            {/* Add other client links here */}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="logo">Logo</div>
        <nav>
          <ul>
            {renderLinks()}
          </ul>
          <ul className="logout">
            <li>
              <FontAwesomeIcon icon={faSignOutAlt} className="sidebar-icon" />
              <Link to="/" onClick={handleLogout}>Logout</Link>
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
