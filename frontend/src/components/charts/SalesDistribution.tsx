import React, { useMemo } from "react";
import { Box, Paper, Typography, Divider, Skeleton } from "@mui/material";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface SalesDistributionProps {
  salesDistributionData: { label: string; value: number }[];
}

const SalesDistribution: React.FC<SalesDistributionProps> = ({
  salesDistributionData,
}) => {
  const loading = salesDistributionData.length === 0;

  // Memoize the chart dataset to prevent unnecessary re-renders
  const dataset = useMemo(() => salesDistributionData, [salesDistributionData]);

  // Define the options and series for ApexCharts
  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: {
          show: false,
        },
        background: "transparent", // Set the background to transparent
      },
      plotOptions: {
        bar: {
          horizontal: false, // Change to false for vertical bars
          borderRadius: 4,
        },
      },
      xaxis: {
        categories: dataset.map((data) => data.label.split(" ")[0]), // Use only the first word of each label
        labels: {
          rotate: -45, // Set rotation to 0 for horizontal labels
          style: {
            fontSize: "12px",
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          const fullLabel = dataset[dataPointIndex].label;
          const value = series[seriesIndex][dataPointIndex].toFixed(2);
          const x = w.globals.dom.baseEl.getBoundingClientRect().left;
          const tooltipWidth = 150; // estimated tooltip width

          // Calculate the tooltip position
          const positionLeft = x + tooltipWidth > window.innerWidth;

          return `<div class="tooltip-custom" style="font-size: 14px; padding: 8px; white-space: nowrap; background: #fff; border: 1px solid #ccc; border-radius: 4px; ${
            positionLeft ? "right: 0;" : "left: 0;"
          }">
            <span>${fullLabel}</span>: <strong>€${value}</strong>
          </div>`;
        },
        fixed: {
          enabled: true,
          position: "topRight",
        },
      },
      theme: {
        palette: "palette2",
      },
      fill: {
        colors: ["#26a69a"],
      },
    }),
    [dataset]
  );

  const series = useMemo(
    () => [
      {
        name: "Revenue",
        data: dataset.map((data) => data.value),
      },
    ],
    [dataset]
  );

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #e8f5e9 30%, #c8e6c9 100%)",
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
          display: "inline-block",
          backgroundColor: "rgba(0, 0, 0, 4%)",
          borderRadius: "24px",
          px: 2,
          py: 0.5,
          mb: 2,
          zIndex: 1,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Sales Distribution Through Clients
        </Typography>
      </Box>
      <Divider sx={{ my: 2, borderRadius: "12px", zIndex: 1 }} />
      <Box sx={{ width: "100%", height: "300px", zIndex: 1 }}>
        {loading ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={300}
            sx={{ borderRadius: "12px" }}
          />
        ) : (
          <Chart options={options} series={series} type="bar" height={300} />
        )}
      </Box>
    </Paper>
  );
};

export default React.memo(SalesDistribution);
