import React from "react";
import { Box, Paper, Typography, Divider, Skeleton } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

const MonthOverMonthSpendingTrend: React.FC<{ months: string[], revenueData: number[] }> = ({ months, revenueData }) => {
  // Ensure no NaN values are passed to the chart
  const validRevenueData = revenueData.map(value => isNaN(value) ? 0 : value);
  const loading = revenueData.length === 0;

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', background: 'linear-gradient(135deg, #fffde7 30%, #fff9c4 100%)' }}>
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
        <Typography variant="h6" gutterBottom>Month Over Month Spending Trend</Typography>
      </Box>
      <Divider sx={{ my: 2, borderRadius: '8px' }} />
      <Box sx={{ width: "100%", height: "300px" }}>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: "12px" }} />
        ) : (
          <LineChart
            xAxis={[{ data: months }]}
            series={[
              {
                data: validRevenueData,
              },
            ]}
            width={500}
            height={300}
          />
        )}
      </Box>
    </Paper>
  );
};

export default MonthOverMonthSpendingTrend;
