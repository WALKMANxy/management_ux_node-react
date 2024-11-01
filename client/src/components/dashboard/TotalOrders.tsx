//src/components/dashboard/TotalOrders.tsx
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import {
  Avatar,
  Box,
  Button,
  Grid,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";

interface TotalOrderProps {
  totalOrder: number;
  monthlyOrders: number[];
  yearlyOrders: number[];
  monthlyCategories: string[];
  yearlyCategories: string[];
}

const TotalOrder: React.FC<TotalOrderProps> = ({
  monthlyOrders,
  yearlyOrders,
  monthlyCategories,
  yearlyCategories,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [timeValue, setTimeValue] = React.useState<boolean>(true);

  // Get the current month index (0 = January, 1 = February, etc.)
  const currentMonthIndex = useMemo(() => new Date().getMonth(), []);

  const handleChangeTime = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: boolean
  ) => {
    setTimeValue(newValue);
  };

  // Display the current month's orders or the total orders based on timeValue
  const displayedTotal = useMemo(() => {
    return timeValue ? monthlyOrders[currentMonthIndex] || 0 : yearlyOrders;
  }, [timeValue, monthlyOrders, yearlyOrders, currentMonthIndex]);

  // Format categories to display month numbers or years
  const formattedMonthlyCategories = useMemo(
    () => monthlyCategories.map((date) => dayjs(date).format("MM")),
    [monthlyCategories]
  );

  const formattedYearlyCategories = useMemo(
    () => yearlyCategories.map((date) => dayjs(date).format("YYYY")),
    [yearlyCategories]
  );

  // Configure ApexCharts options to match the style of MonthOverMonthSpendingTrend
  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        background: "transparent",
        toolbar: { show: false },
      },
      xaxis: {
        categories: timeValue
          ? formattedMonthlyCategories
          : formattedYearlyCategories,
        labels: { rotate: 0 },
      },
      yaxis: {
        labels: {
          formatter: (value: number) =>
            new Intl.NumberFormat(undefined, {
              style: "decimal",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value),
        },
        axisTicks: {
          show: false,
        },
      },
      dataLabels: { enabled: false },
      tooltip: {
        shared: true, // Enable shared tooltips to display both series
        y: {
          formatter: (val: number) =>
            new Intl.NumberFormat(undefined, {
              style: "decimal",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(val),
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
      timeValue,
      formattedMonthlyCategories,
      formattedYearlyCategories,
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.text.primary,
    ]
  );

  // Define series with Orders
  const series = useMemo(() => {
    const baseSeries = [
      {
        name: t("totalOrder.orders", "Orders"),
        data: timeValue ? monthlyOrders : yearlyOrders,
      },
    ];

    return baseSeries;
  }, [timeValue, monthlyOrders, yearlyOrders, t]);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: "12px",
        background: "linear-gradient(135deg, #ffe0b2 30%, #ffcc80 100%)",
        color: "#000",
        position: "relative",
        overflow: "hidden",
        minHeight: "250px",
        height: "auto",
        "&:after": {
          content: '""',
          position: "absolute",
          width: 210,
          height: 210,
          background: theme.palette.primary.main,
          borderRadius: "50%",
          top: -85,
          right: -95,
        },
        "&:before": {
          content: '""',
          position: "absolute",
          width: 210,
          height: 210,
          background: theme.palette.primary.main,
          borderRadius: "50%",
          top: -125,
          right: -15,
          opacity: 0.5,
        },
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <Grid container direction="column" sx={{ height: "auto" }} wrap="wrap">
          <Grid item>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Avatar
                  variant="rounded"
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: "#000",
                    mt: 1,
                  }}
                >
                  <LocalMallOutlinedIcon fontSize="inherit" />
                </Avatar>
              </Grid>
              <Grid item>
                <Button
                  disableElevation
                  variant={timeValue ? "contained" : "text"}
                  size="small"
                  sx={{
                    color: "#fff",
                    bgcolor: timeValue ? "#000" : "transparent",
                    zIndex: 1,
                    "&:hover": {
                      bgcolor: "#000",
                      color: "#fff",
                    },
                    mr: 1,
                  }}
                  onClick={(e) => handleChangeTime(e, true)}
                >
                  {t("totalOrder.month", "Month")}
                </Button>
                <Button
                  disableElevation
                  variant={!timeValue ? "contained" : "text"}
                  size="small"
                  sx={{
                    color: "#fff",
                    bgcolor: !timeValue ? "#000" : "transparent",
                    zIndex: 1,
                    "&:hover": {
                      bgcolor: "#000",
                      color: "#fff",
                    },
                  }}
                  onClick={(e) => handleChangeTime(e, false)}
                >
                  {t("totalOrder.year", "Year")}
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item sx={{ mb: 0.5 }}>
            <Grid
              container
              alignItems="center"
              direction={isMobile ? "column" : "row"}
            >
              <Grid item xs={10} md={5} textAlign="left">
                <Grid container alignItems="center" justifyContent="flex-start">
                  <Grid item>
                    <Tooltip
                      title={t(
                        "totalOrder.tooltipTotalOrders",
                        "Total orders:"
                      )}
                    >
                      <Typography
                        sx={{
                          fontSize: "2.5rem",
                          fontWeight: 500,
                          mr: 1,
                          mt: 1.5,
                          mb: 0.5,
                          cursor: "pointer",
                        }}
                      >
                        {displayedTotal}
                      </Typography>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Avatar
                      sx={{
                        cursor: "pointer",
                        bgcolor: theme.palette.primary.light,
                        color: "#000",
                      }}
                    >
                      <ArrowDownwardIcon
                        fontSize="inherit"
                        sx={{ transform: "rotate3d(1, 1, 1, 45deg)" }}
                      />
                    </Avatar>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={10} md={6} sx={{}}>
                <Chart
                  options={options}
                  series={series}
                  type="area"
                  height={isMobile ? 150 : 150}
                  key={timeValue ? 'monthly' : 'yearly'} // Add this line

                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography
              sx={{
                fontSize: "1.4rem",
                fontWeight: 500,
                color: "#000",
              }}
            >
              {timeValue
                ? t("totalOrder.ordersThisMonth", "Orders this month")
                : t("totalOrder.totalOrders", "Total orders")}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default React.memo(TotalOrder);
