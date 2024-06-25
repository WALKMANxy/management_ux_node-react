// src/layout/Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import { Box } from '@mui/material';

const Layout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
