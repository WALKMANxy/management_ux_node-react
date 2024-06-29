// src/components/TotalOrders.tsx
import React from 'react';
import { Typography, Paper, Box } from '@mui/material';
import CountUp from 'react-countup';

interface TotalOrdersProps {
  totalOrders: number;
}

const TotalOrders: React.FC<TotalOrdersProps> = ({ totalOrders }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #ffe0b2 30%, #ffcc80 100%)',
      }}
    >
      <Box
        sx={{
          display: 'inline-block',
          backgroundColor: 'rgba(0, 0, 0, 1%)',
          borderRadius: '24px',
          px: 2,
          py: 0.5,
          mb: 2.5,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Total Orders:
        </Typography>
      </Box>
      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
        <CountUp end={totalOrders} duration={2} separator="," />
      </Typography>
    </Paper>
  );
};

export default TotalOrders;
