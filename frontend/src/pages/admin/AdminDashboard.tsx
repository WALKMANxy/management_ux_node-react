// src/pages/admin/AdminDashboard.tsx
import React from 'react';
import ExampleComponent from '../../components/ExampleComponent/ExampleComponent';
import DebugToggle from '../../components/DebugToggle/DebugToggle';

const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ExampleComponent />
      <DebugToggle />
    </div>
  );
};

export default AdminDashboard;
