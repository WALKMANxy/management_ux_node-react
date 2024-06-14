import React, { useState } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { RootState } from '../../app/store';

const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const userRole = useSelector((state: RootState) => state.auth.userRole);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = () => {
    // Placeholder logic for login
    // In a real application, you should validate the email and password
    dispatch(login('admin')); // Change 'admin' to the appropriate role based on authentication
    setShowLogin(false);
  };

  const handleEnterDashboard = () => {
    // Redirect based on user role
    switch (userRole) {
      case 'admin':
        navigate('/admin');
        break;
      case 'agent':
        navigate('/agent');
        break;
      case 'client':
        navigate('/client');
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
            <input type="email" className="form-control mb-2" placeholder="Email" />
            <input type="password" className="form-control mb-2" placeholder="Password" />
            <div className="form-check mb-2">
              <input type="checkbox" className="form-check-input" id="rememberMe" />
              <label className="form-check-label" htmlFor="rememberMe">Remember my credentials</label>
            </div>
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
        <button
          className="btn btn-lg btn-primary enter-dashboard-button"
          onClick={handleEnterDashboard}
          disabled={!isLoggedIn}
        >
          Enter Dashboard
        </button>
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
