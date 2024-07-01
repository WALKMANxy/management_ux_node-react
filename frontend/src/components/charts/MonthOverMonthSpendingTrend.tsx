import React, { useMemo } from "react";
import { Box, Paper, Typography, Divider, Skeleton } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { monthMap } from "../../utils/constants";
import useResizeObserver from "../../features/hooks/useResizeObserver";


const MonthOverMonthSpendingTrend: React.FC<{ months: string[], revenueData: number[] }> = ({ months, revenueData }) => {
  const loading = revenueData.length === 0;
  const { containerRef, dimensions } = useResizeObserver();

  const data = useMemo(() => months.map((month, index) => {
    const [year, monthNum] = month.split("-");
    const monthName = monthMap[monthNum];
    const revenue = revenueData[index];
    return { month: `${monthName} ${year}`, revenue };
  }), [months, revenueData]);

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
      <Box ref={containerRef} sx={{ width: "100%", height: "300px" }}>
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: "12px" }} />
        ) : (
          <LineChart
            dataset={data}
            xAxis={[{ dataKey: 'month', scaleType: 'band' }]}
            yAxis={[{ dataKey: 'revenue', scaleType: 'linear', valueFormatter: (value) => `€${value.toFixed(2)}` }]}
            series={[{ dataKey: 'revenue', type: 'line', area: true }]}
            grid={{ vertical: true, horizontal: true }}
            width={dimensions.width} // Use the detected width
            height={300}
          />
        )}
      </Box>
    </Paper>
  );
};

export default React.memo(MonthOverMonthSpendingTrend);
