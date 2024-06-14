// src/pages/client/ClientDashboard.tsx
import React from 'react';
import ExampleComponent from '../../components/ExampleComponent/ExampleComponent';
import DebugToggle from '../../components/DebugToggle/DebugToggle';

const ClientDashboard: React.FC = () => {
  return (
    <div>
      <h1>Client Dashboard</h1>
      <ExampleComponent />
      <DebugToggle />
    </div>
  );
};

export default ClientDashboard;
