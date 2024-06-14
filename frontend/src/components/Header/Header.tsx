import React from 'react';

import './Header.css';

const Header: React.FC = () => {
  return (
    <div className="header d-flex justify-content-between align-items-center p-3">
      <input type="text" className="form-control search-bar" placeholder="Search..." />
      <div className="user-info d-flex align-items-center">
        <i className="bell-icon fas fa-bell"></i>
        <div className="user-name ml-3">Agent Name</div>
      </div>
    </div>
  );
};

export default Header;
