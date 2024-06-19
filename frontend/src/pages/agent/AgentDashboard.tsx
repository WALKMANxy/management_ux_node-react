// src/pages/agent/AgentDashboard.tsx
import React, { useState } from 'react';
import GlobalSearch from '../../components/common/GlobalSearch';
import './AgentDashboard.css';

const AgentDashboard: React.FC = () => {
  const agentName = "John Doe";  // Mock agent name
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const handleClientSelect = (client: string) => {
    setSelectedClient(client);
  };

  return (
    <div className="agent-dashboard">
      <div className="content-wrapper p-4">
        <div className="welcome-message mb-4">
          <h2>Welcome back, {agentName}</h2>
        </div>
        <GlobalSearch filter="client" onSelect={handleClientSelect} />
        <div className="row">
          <div className="col-lg-8">
            {selectedClient ? (
              <div className="statistics-panel mb-4">
                <h3>Statistics for {selectedClient}</h3>
                <div className="row">
                  <div className="col-md-4">
                    <div className="stat-box p-3 rounded">
                      <h4>Spent This Month</h4>
                      <p>$5000</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box p-3 rounded">
                      <h4>Spent This Year</h4>
                      <p>$20000</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box p-3 rounded">
                      <h4>Top Article Type</h4>
                      <p>Engine Parts</p>
                    </div>
                  </div>
                  <div className="col-md-12 mt-3">
                    <div className="stat-box p-3 rounded">
                      <h4>Month Over Month Spending Trend</h4>
                      <p>Chart here</p>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary mt-3">View More</button>
              </div>
            ) : (
              <div className="statistics-panel mb-4">
                <h3>Your Statistics</h3>
                <div className="row">
                  <div className="col-md-4">
                    <div className="stat-box p-3 rounded">
                      <h4>Total Revenue of Clients</h4>
                      <p>$100000</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box p-3 rounded">
                      <h4>Total Orders Made</h4>
                      <p>150</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box p-3 rounded">
                      <h4>Top Brands Sold</h4>
                      <p>Pie chart here</p>
                    </div>
                  </div>
                  <div className="col-md-12 mt-3">
                    <div className="stat-box p-3 rounded">
                      <h4>Sales Distribution Through Clients</h4>
                      <p>Pie chart here</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="visits-panel mb-4">
              <h3>{selectedClient ? `Upcoming Visits for ${selectedClient}` : 'Your Upcoming Visits'}</h3>
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
              <div className="card p-3">
                <p>Calendar integration goes here.</p>
              </div>
            </div>
            <div className="promos-panel">
              <h3>{selectedClient ? `Active Promotions for ${selectedClient}` : 'Active Promotions with Your Clients'}</h3>
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
  );
};

export default React.memo(AgentDashboard);
