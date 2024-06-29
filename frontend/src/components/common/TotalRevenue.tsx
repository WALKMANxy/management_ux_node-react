// src/components/TotalRevenue.tsx
import React from 'react';
import { Typography, Paper, Box } from '@mui/material';
import CountUp from 'react-countup';

interface TotalRevenueProps {
  totalRevenue: number;
}

const TotalRevenue: React.FC<TotalRevenueProps> = ({ totalRevenue }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #fffde7 30%, #fff9c4 100%)',
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
          Total Revenue:
        </Typography>
      </Box>
      <Typography variant="body1" sx={{ fontWeight: 'bold', paddingBottom: '10px' }}>
        €<CountUp end={totalRevenue} duration={2} separator="," />
      </Typography>
    </Paper>
  );
};

export default TotalRevenue;
