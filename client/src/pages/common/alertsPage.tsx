// src/components/Alerts/AlertsPage.tsx
import React from 'react';
import { Box, Divider, IconButton, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AlertsList from '../../components/alertsPage/alertsList';
import AlertDetails from '../../components/alertsPage/alertsDetails';

const AlertsPage: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Left Scaffold */}
      <Box
        sx={{
          width: '25%',
          borderRight: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Alerts</Typography>
          <Box>
            <IconButton>
              <SearchIcon />
            </IconButton>
            <IconButton>
              <AddIcon />
            </IconButton>
          </Box>
        </Box>
        <Divider />
        <AlertsList />
      </Box>

      {/* Right Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AlertDetails />
      </Box>
    </Box>
  );
};

export default AlertsPage;
