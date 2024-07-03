import React, { useMemo } from "react";
import { Box, Paper, Typography, Divider, Skeleton } from "@mui/material";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import useResizeObserver from "../../../hooks/useResizeObserver";
import { monthMap } from "../../../utils/constants";
import { currencyFormatter } from "../../../utils/dataUtils";

const MonthOverMonthSpendingTrend: React.FC<{
  months: string[];
  revenueData: number[];
}> = ({ months, revenueData }) => {
  const loading = revenueData.length === 0;
  const { containerRef, dimensions } = useResizeObserver();

  const data = useMemo(
    () =>
      months.map((month, index) => {
        const [year, monthNum] = month.split("-");
        const monthName = monthMap[monthNum];
        const revenue = revenueData[index];
        return { month: `${monthName} ${year}`, revenue };
      }),
    [months, revenueData]
  );

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        background: "transparent",
        toolbar: { show: false },
      },
      xaxis: {
        categories: data.map((d) => d.month.split(" ")[0]),
        labels: { rotate: 0 },
      },
      yaxis: {
        labels: {
          formatter: (value: number) => currencyFormatter(value), // Use currency formatter
        },
        axisTicks: {
          show: false, // Disable tick marks on the y-axis
        },
      },
      dataLabels: { enabled: false },
      tooltip: {
        y: {
          formatter: (val: number) => currencyFormatter(val), // Use currency formatter
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
        },
      },
      stroke: {
        curve: "smooth",
      },
      markers: {
        size: 3, // Add markers for each data point
      },
      grid: {
        show: true, // Show grid
        borderColor: "#e0e0e0",
        strokeDashArray: 1,
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: false,
          },
        },
      },
      theme: {
        palette: "palette2",
      },
    }),
    [data]
  );

  const series = useMemo(
    () => [
      {
        name: "Revenue",
        data: data.map((d) => d.revenue),
      },
    ],
    [data]
  );

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: "12px",
        background: "linear-gradient(135deg, #fffde7 30%, #fff9c4 100%)",
      }}
    >
      <Box
        sx={{
          display: "inline-block",
          backgroundColor: "rgba(0, 0, 0, 3%)",
          borderRadius: "24px",
          px: 1,
          py: 1.5,
          mb: -2.5,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Month Over Month Spending Trend
        </Typography>
      </Box>
      <Divider sx={{ my: 1, borderRadius: "8px" }} />
      <Box ref={containerRef} sx={{ width: "100%", height: "300px" }}>
        {loading ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={300}
            sx={{ borderRadius: "12px" }}
          />
        ) : (
          <Chart
            options={options}
            series={series}
            type="area"
            height={300}
            width={dimensions.width} // Use the detected width
          />
        )}
      </Box>
    </Paper>
  );
};

export default React.memo(MonthOverMonthSpendingTrend);
