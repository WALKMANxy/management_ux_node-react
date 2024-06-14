import React from 'react';

import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar d-flex flex-column">
      <div className="logo p-3">
        <h2>Logo</h2>
      </div>
      <nav className="nav flex-column">
        <a className="nav-link" href="#clients">Clients</a>
        <a className="nav-link" href="#visits">Visits</a>
        <a className="nav-link" href="#statistics">Statistics</a>
        <a className="nav-link" href="#promos">Promos</a>
        <a className="nav-link" href="#alerts">Alerts</a>
        <a className="nav-link" href="#logout">Logout</a>
      </nav>
    </div>
  );
};

export default Sidebar;
