// src/components/charts/MonthOverMonthSpendingTrend.tsx
import React from "react";
import { Box, Paper, Typography, Divider, Skeleton } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

const monthMap: { [key: string]: string } = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};

const MonthOverMonthSpendingTrend: React.FC<{ months: string[], revenueData: number[] }> = ({ months, revenueData }) => {
  const loading = revenueData.length === 0;

  const data = months.map((month, index) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [year, monthNum] = month.split("-");
    const monthName = monthMap[monthNum];
    const revenue = revenueData[index];
    return { month: monthName, revenue };
  });

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', background: 'linear-gradient(135deg, #fffde7 30%, #fff9c4 100%)' }}>
      <Box
        sx={{
          display: 'inline-block',
          backgroundColor: 'rgba(0, 0, 0, 3%)',
          borderRadius: '24px',
          px: 1,
          py: 1.5,
          mb: -2.5,
        }}
      >
        <Typography variant="h6" gutterBottom>Month Over Month Spending Trend</Typography>
      </Box>
      <Divider sx={{ my: 1, borderRadius: '8px' }} />
      <Box sx={{ width: "100%", height: "300px" }}>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: "12px" }} />
        ) : (
          <LineChart
            dataset={data}
            xAxis={[{ dataKey: 'month', scaleType: 'band' }]}
            yAxis={[{ dataKey: 'revenue', scaleType: 'linear', valueFormatter: (value) => `€${value.toFixed(2)}` }]}
            series={[{ dataKey: 'revenue', type: 'line', area: true }]}
            grid={{ vertical: true, horizontal: true }}
            width={500}
            height={300}
          />
        )}
      </Box>
    </Paper>
  );
};

export default MonthOverMonthSpendingTrend;
