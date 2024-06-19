// src/pages/common/ClientsPage.tsx
import React, { useState } from 'react';
import GlobalSearch from '../../components/common/GlobalSearch';
import DetailComponent from '../../components/common/DetailComponent';
import HistoryComponent from '../../components/common/HistoryComponent';
import './ClientsPage.module.css';

const ClientsPage: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const handleClientSelect = (client: string) => {
    setSelectedClient(client);
  };

  const mockClientDetails = {
    name: "Client 1",
    address: "123 Main St",
    email: "client1@example.com",
    phone: "123-456-7890"
  };

  const mockVisitsHistory = [
    { date: "2023-01-01", note: "Initial consultation" },
    { date: "2023-02-15", note: "Follow-up visit" },
    { date: "2023-03-10", note: "Routine check" }
  ];

  return (
    <div className="clients-page">
      <div className="content-wrapper p-4">
        <GlobalSearch filter="client" onSelect={handleClientSelect} />
        <div className="client-details mt-4">
          {selectedClient ? (
            <>
              <h2>{selectedClient} Details</h2>
              <DetailComponent detail={mockClientDetails} />
              <h3 className="mt-4">Visits History</h3>
              <HistoryComponent history={mockVisitsHistory} />
            </>
          ) : (
            <h2>Select a client to view details</h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
