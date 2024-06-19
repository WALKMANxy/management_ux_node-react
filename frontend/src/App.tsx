// src/App.tsx
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import store, { RootState } from './app/store';
import Layout from './layout/Layout';
import LandingPage from './pages/landing/LandingPage';
import AgentDashboard from './pages/agent/AgentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientsPage from './pages/common/ClientsPage';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/" />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: 'agent-dashboard', element: <ProtectedRoute><AgentDashboard /></ProtectedRoute> },
      { path: 'admin-dashboard', element: <ProtectedRoute><AdminDashboard /></ProtectedRoute> },
      { path: 'client-dashboard', element: <ProtectedRoute><ClientDashboard /></ProtectedRoute> },
      { path: 'clients', element: <ProtectedRoute><ClientsPage /></ProtectedRoute> },
    ],
  },
]);

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
