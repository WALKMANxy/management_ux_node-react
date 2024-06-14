import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import './AgentDashboard.css';

const AgentDashboard: React.FC = () => {
  const agentName = "John Doe";  // Mock agent name

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-wrapper p-4">
          <div className="welcome-message mb-4">
            <h2>Welcome back, {agentName}</h2>
          </div>
          <div className="row">
            <div className="col-lg-8">
              <div className="statistics-panel mb-4">
                <h3>Statistics</h3>
                <div className="search-bar mb-2">
                  <input type="text" className="form-control" placeholder="Search client statistics..." />
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <div className="stat-box p-3 rounded">
                      <h4>Spent This Month</h4>
                      <p>$5000</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box p-3 rounded">
                      <h4>Orders Made</h4>
                      <p>20</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box p-3 rounded">
                      <h4>Other Metric</h4>
                      <p>Value</p>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary mt-3">View More</button>
              </div>
              <div className="visits-panel mb-4">
                <h3>Upcoming Visits</h3>
                <ul className="list-group">
                  <li className="list-group-item">Visit 1</li>
                  <li className="list-group-item">Visit 2</li>
                  <li className="list-group-item">Visit 3</li>
                </ul>
                <button className="btn btn-primary mt-3">Plan Visit</button>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="calendar mb-4">
                <h3>Calendar</h3>
                {/* Mock calendar placeholder */}
                <div className="card p-3">
                  <p>Calendar integration goes here.</p>
                </div>
              </div>
              <div className="promos-panel">
                <h3>Active Promotions</h3>
                <ul className="list-group">
                  <li className="list-group-item">Promo 1</li>
                  <li className="list-group-item">Promo 2</li>
                  <li className="list-group-item">Promo 3</li>
                </ul>
                <button className="btn btn-primary mt-3">View More</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
