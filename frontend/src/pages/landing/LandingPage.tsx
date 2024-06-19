// src/pages/landing/LandingPage.tsx
import React, { useState } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { RootState } from '../../app/store';

const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'agent' | 'client'>('client');
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const userRole = useSelector((state: RootState) => state.auth.userRole);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = () => {
    dispatch(login(selectedRole));
    setShowLogin(false);
  };

  const handleEnterDashboard = () => {
    switch (userRole) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'agent':
        navigate('/agent-dashboard');
        break;
      case 'client':
        navigate('/client-dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="landing-page d-flex flex-column min-vh-100">
      <header className="header d-flex justify-content-between align-items-center p-3">
        <div className="logo">Logo</div>
        <button className="btn btn-primary login-button" onClick={() => setShowLogin(!showLogin)}>Login</button>
        {showLogin && (
          <div className="login-panel position-absolute bg-white border p-3 shadow">
            <select className="form-control mb-2" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'agent' | 'client')}>
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
              <option value="client">Client</option>
            </select>
            <button className="btn btn-primary w-100" onClick={handleLogin}>Login</button>
          </div>
        )}
      </header>
      <main className="main-content">
        <div className="content-container">
          <div className="welcome-message">
            <h1>Welcome</h1>
          </div>
          <div className="links-box">
            <div className="link">Link 1</div>
            <div className="link">Link 2</div>
            <div className="link">Link 3</div>
            <div className="link">Link 4</div>
          </div>
        </div>
        {isLoggedIn && (
          <button
            className="btn btn-lg btn-primary enter-dashboard-button"
            onClick={handleEnterDashboard}
          >
            Enter Dashboard
          </button>
        )}
      </main>
      <footer className="footer d-flex justify-content-between align-items-center p-3">
        <div className="footer-left">
          &copy; 2024 Developed By ****
        </div>
        <div className="footer-right">
          Business Contact: example@example.com
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
