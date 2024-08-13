import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box, Divider, Paper, Skeleton, Typography } from "@mui/material";
import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import { monthMap } from "../../../utils/constants";
import { currencyFormatter } from "../../../utils/dataUtils";

interface MonthOverMonthSpendingTrendProps {
  months: string[];
  revenueData: number[];
  userRole: "agent" | "client" | "admin";
}

const MonthOverMonthSpendingTrend: React.FC<MonthOverMonthSpendingTrendProps> = React.memo(
  ({ months, revenueData, userRole }) => {
    const { t } = useTranslation();
    const loading = revenueData.length === 0;

    const data = useMemo(
      () =>
        months.map((month, index) => {
          const [year, monthNum] = month.split("-");
          const monthName = monthMap[monthNum as keyof typeof monthMap];
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
            formatter: (value: number) => currencyFormatter(value),
          },
          axisTicks: {
            show: false,
          },
        },
        dataLabels: { enabled: false },
        tooltip: {
          y: {
            formatter: (val: number) => currencyFormatter(val),
            title: {
              formatter: () =>
                userRole === "agent"
                  ? t("monthOverMonthSpendingTrend.revenue")
                  : t("monthOverMonthSpendingTrend.expense"),
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
      }),
      [data, t, userRole]
    );

    const series = useMemo(
      () => [
        {
          name:
            userRole === "agent"
              ? t("monthOverMonthSpendingTrend.revenue")
              : t("monthOverMonthSpendingTrend.expense"),
          data: data.map((d) => d.revenue),
        },
      ],
      [data, t, userRole]
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
            backgroundColor: "rgba(0, 0, 0, 0.03)",
            borderRadius: "24px",
            px: 1,
            py: 1.5,
            mb: -2.5,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {t("monthOverMonthSpendingTrend.title")}
          </Typography>
        </Box>
        <Divider sx={{ my: 1, borderRadius: "8px" }} />
        <Box sx={{ width: "100%", height: "300px" }}>
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
  }
);

export default MonthOverMonthSpendingTrend;