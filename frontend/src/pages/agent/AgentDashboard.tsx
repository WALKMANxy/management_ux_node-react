//src/pages/agent/AgentDashboard.tsx
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import GlobalSearch from "../../components/common/GlobalSearch";
import useAgentStats from "../../hooks/useAgentStats";
import "./AgentDashboard.css";

const AgentDashboard: React.FC = () => {
  const loggedInAgentId = useSelector((state: RootState) => state.auth.id);
  const {
    agentDetails,
    selectedClient,
    selectClient,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTopArticleType,
  } = useAgentStats(loggedInAgentId);

   const handleClientSelect = (clientName: string) => {
    selectClient(clientName);
  };

  if (!agentDetails) {
    return <div>Loading...</div>;
  }

  const totalRevenue = agentDetails.clients.reduce(
    (total, client) => total + parseFloat(client.totalRevenue),
    0
  );
  const totalOrders = agentDetails.clients.reduce(
    (total, client) => total + client.totalOrders,
    0
  );

  return (
    <div className="agent-dashboard">
      <div className="content-wrapper p-4">
        <div className="welcome-message mb-4">
          <h2>Welcome back, {agentDetails.name}</h2>
        </div>
        <GlobalSearch filter="client" onSelect={handleClientSelect} />
        <div className="row">
          <div className="col-lg-8">
            {selectedClient ? (
              <div className="statistics-panel mb-4">
                <h3>Statistics for {selectedClient.name}</h3>
                <div className="row">
                  <div className="col-md-4">
                    <div className="stat-box p-3 rounded">
                      <h4>Spent This Month</h4>
                      <p>
                        €
                        {calculateTotalSpentThisMonth(selectedClient.movements)}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box p-3 rounded">
                      <h4>Spent This Year</h4>
                      <p>
                        €{calculateTotalSpentThisYear(selectedClient.movements)}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box p-3 rounded">
                      <h4>Top Article Type</h4>
                      <p>{calculateTopArticleType(selectedClient.movements)}</p>
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
                      <p>€{totalRevenue}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-box p-3 rounded">
                      <h4>Total Orders Made</h4>
                      <p>{totalOrders}</p>
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
              <h3>
                {selectedClient
                  ? `Upcoming Visits for ${selectedClient.name}`
                  : "Your Upcoming Visits"}
              </h3>
              <ul className="list-group">
                {selectedClient ? (
                  selectedClient.visits.map((visit, index) => (
                    <li key={index} className="list-group-item">
                      {visit.note} on {visit.date}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="list-group-item">Visit 1</li>
                    <li className="list-group-item">Visit 2</li>
                    <li className="list-group-item">Visit 3</li>
                  </>
                )}
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
              <h3>
                {selectedClient
                  ? `Active Promotions for ${selectedClient.name}`
                  : "Active Promotions with Your Clients"}
              </h3>
              <ul className="list-group">
                {selectedClient ? (
                  selectedClient.promos.map((promo) => (
                    <li key={promo.id} className="list-group-item">
                      {promo.name}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="list-group-item">Promo 1</li>
                    <li className="list-group-item">Promo 2</li>
                    <li className="list-group-item">Promo 3</li>
                  </>
                )}
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
