// src/components/MonthOverMonthSpendingTrend.tsx
import ShowChartIcon from "@mui/icons-material/ShowChart"; // Import the ShowChart icon
import {
  Avatar,
  Box,
  Divider,
  Paper,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import { ApexOptions } from "apexcharts";
import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { UserRole } from "../../../models/entityModels";
import { currencyFormatter } from "../../../utils/dataUtils";

interface MonthOverMonthSpendingTrendProps {
  months: string[];
  revenueData: number[];
  netRevenueData: number[];
  userRole: UserRole;
}

const MonthOverMonthSpendingTrend: React.FC<
  MonthOverMonthSpendingTrendProps
> = ({ months, revenueData, netRevenueData, userRole }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const loading =
    revenueData.length === 0 ||
    (userRole !== "client" && netRevenueData.length === 0);

  // Process data to include both revenue and net revenue with translated month names
  const data = useMemo(
    () =>
      months.map((month, index) => {
        const [year, monthNum] = month.split("-");
        const monthName = t(`months.${monthNum}`, "Month");
        return {
          month: `${monthName} ${year}`,
          revenue: revenueData[index],
          netRevenue: netRevenueData[index],
        };
      }),
    [months, revenueData, netRevenueData, t]
  );

  // Configure ApexCharts options for multiple series
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
          formatter: (value: number) => currencyFormatter(value),
        },
        axisTicks: {
          show: false,
        },
      },
      dataLabels: { enabled: false },
      tooltip: {
        shared: true,
        y: {
          formatter: (val: number) => currencyFormatter(val),
          title: {
            formatter: () => "",
          },
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
        size: 3,
      },
      grid: {
        show: true,
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
      colors: [theme.palette.primary.main, theme.palette.secondary.main],
      legend: {
        position: "top",
        horizontalAlign: "center",
        labels: {
          colors: theme.palette.text.primary,
        },
      },
    }),
    [
      data,
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.text.primary,
    ]
  );

  const series = useMemo(() => {
    const baseSeries = [
      {
        name:
          userRole === "agent" || userRole === "admin"
            ? t("monthOverMonthSpendingTrend.revenue", "Revenue")
            : t("monthOverMonthSpendingTrend.expense", "Expense"),
        data: data.map((d) => d.revenue),
      },
    ];

    if (userRole !== "client") {
      baseSeries.push({
        name: t("monthOverMonthSpendingTrend.netRevenue", "Net Revenue"),
        data: data.map((d) => d.netRevenue),
      });
    }

    return baseSeries;
  }, [data, t, userRole]);

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: "12px",
        background: "linear-gradient(135deg, #fffde7 30%, #fff9c4 100%)",
        position: "relative",
        overflow: "hidden",
        "&::after": {
          content: '""',
          position: "absolute",
          width: 700,
          height: 200,
          background: theme.palette.primary.main,
          borderRadius: "100%",
          top: -100,
          right: 109,
          opacity: 0.1,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          width: 250,
          height: 180,
          background: theme.palette.primary.light,
          borderRadius: "50%",
          bottom: -125,
          left: -100,
          opacity: 0.3,
        },
      }}
    >
      {/* Header with Icon */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          mb: 0,
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: theme.palette.primary.main,
            color: "#fff",
            mt: 1,
            left: 39,
            top: 16,
          }}
        >
          <ShowChartIcon fontSize="inherit" />
        </Avatar>
      </Box>

      {/* Title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          top: 26,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1,
          width: "100%",
        }}
      >
        <Typography variant="h6" gutterBottom>
          {t("monthOverMonthSpendingTrend.title", "Monthly Trend")}
        </Typography>
      </Box>

      {/* Divider */}
      <Divider
        sx={{ width: "100%", mt: 2, zIndex: 1, position: "relative", top: 10 }}
      />

      {/* Chart or Skeleton */}
      <Box sx={{ width: "100%", height: "auto", p: 2 }}>
        {loading ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={300}
            sx={{ borderRadius: "12px" }}
          />
        ) : (
          <Chart options={options} series={series} type="area" height={300} />
        )}
      </Box>
    </Paper>
  );
};

export default React.memo(MonthOverMonthSpendingTrend);
