import React from "react";
import { Box, Paper, Typography, Divider } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

const SalesDistribution: React.FC<{ salesDistributionData: any[] }> = ({ salesDistributionData }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', background: 'linear-gradient(135deg, #e8f5e9 30%, #c8e6c9 100%)' }}>
      <Box
        sx={{
          display: 'inline-block',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '8px',
          px: 1,
          py: 0.5,
          mb: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>Sales Distribution Through Clients</Typography>
      </Box>
      <Divider sx={{ my: 2, borderRadius: '12px' }} />
      <Box sx={{ width: "100%", height: "300px" }}>
        <BarChart
          xAxis={[{ scaleType: "band", dataKey: "label" }]}
          yAxis={[{ scaleType: "linear" }]}
          series={[{ dataKey: "value", label: "Revenue" }]}
          dataset={salesDistributionData}
          layout="vertical"
        />
      </Box>
    </Paper>
  );
};

export default SalesDistribution;
