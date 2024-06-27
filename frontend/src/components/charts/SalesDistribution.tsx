import React from "react";
import { Box, Paper, Typography, Divider, Skeleton } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

const SalesDistribution: React.FC<{ salesDistributionData: any[] }> = ({ salesDistributionData }) => {
  const loading = salesDistributionData.length === 0;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #e8f5e9 30%, #c8e6c9 100%)',
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundImage: `url('/struckaxiom.png')`,
          backgroundSize: "cover",
          opacity: 0.1,
          zIndex: 0,
        },
      }}
    >
      <Box
        sx={{
          display: 'inline-block',
          backgroundColor: 'rgba(0, 0, 0, 4%)',
          borderRadius: '24px',
          px: 2,
          py: 0.5,
          mb: 2,
          zIndex: 1,
        }}
      >
        <Typography variant="h6" gutterBottom>Sales Distribution Through Clients</Typography>
      </Box>
      <Divider sx={{ my: 2, borderRadius: '12px', zIndex: 1 }} />
      <Box sx={{ width: "100%", height: "300px", zIndex: 1 }}>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: "12px" }} />
        ) : (
          <BarChart
            xAxis={[{ scaleType: "band", dataKey: "label" }]}
            yAxis={[{ scaleType: "linear" }]}
            series={[{ dataKey: "value", label: "Revenue" }]}
            dataset={salesDistributionData}
            layout="vertical"
          />
        )}
      </Box>
    </Paper>
  );
};

export default SalesDistribution;
