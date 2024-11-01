//src/components/statistics/charts/SalesDistribution.tsx
import PollIcon from "@mui/icons-material/Poll";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ApexOptions } from "apexcharts";
import React, { useCallback, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { SalesDistributionProps } from "../../../models/propsModels";
import { currencyFormatter } from "../../../utils/dataUtils";


const SalesDistribution: React.FC<SalesDistributionProps> = ({
  salesDistributionDataClients,
  salesDistributionDataAgents,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"clients" | "agents">("clients");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const userRole = useSelector((state: RootState) => state.auth.role);

  const loading =
    (viewMode === "clients" && salesDistributionDataClients.length === 0) ||
    (viewMode === "agents" && salesDistributionDataAgents?.length === 0);

  const dataset = useMemo(() => {
    if (viewMode === "clients") {
      return salesDistributionDataClients;
    } else {
      return salesDistributionDataAgents || [];
    }
  }, [viewMode, salesDistributionDataClients, salesDistributionDataAgents]);

  // State to track the clicked data point
  const [selectedPoint, setSelectedPoint] = useState<{
    x: string;
    y: number;
  } | null>(null);

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: {
          show: false,
        },
        background: "transparent",
        events: {
          // Handle click events on data points
          dataPointSelection: (_event, _chartContext, config) => {
            const dataPointIndex = config.dataPointIndex;
            const seriesIndex = config.seriesIndex;
            const x = config.w.globals.labels[dataPointIndex];
            const y = config.w.globals.series[seriesIndex][dataPointIndex];

            // Toggle the selected point
            if (
              selectedPoint &&
              selectedPoint.x === x &&
              selectedPoint.y === y
            ) {
              setSelectedPoint(null);
            } else {
              setSelectedPoint({ x, y });
            }
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 4,
        },
      },
      xaxis: {
        categories: dataset.map((data) => data.label.split(" ")[0]),
        labels: {
          rotate: -45,
          style: {
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (value: number) => currencyFormatter(value),
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (value: number) => currencyFormatter(value),
        },
      },
      theme: {
        palette: "palette2",
      },
      fill: {
        colors: ["#26a69a"],
      },
      annotations: selectedPoint
        ? {
            points: [
              {
                x: selectedPoint.x,
                y: selectedPoint.y,
                marker: {
                  size: 6,
                  fillColor: "#fff",
                  strokeColor: theme.palette.success.main,
                  radius: 2,
                },
                label: {
                  borderColor: theme.palette.success.main,
                  offsetY: -10,
                  style: {
                    color: "#fff",
                    background: theme.palette.success.main,
                  },
                  text: currencyFormatter(selectedPoint.y),
                },
              },
            ],
          }
        : {},
    }),
    [dataset, selectedPoint, theme.palette.success.main]
  );

  // Define series data
  const series = useMemo(
    () => [
      {
        name:
          viewMode === "agents"
            ? t("salesDistribution.revenue")
            : t("salesDistribution.expense"),
        data: dataset.map((data) => data.value),
      },
    ],
    [dataset, t, viewMode]
  );

  const handleViewModeToggle = useCallback((mode: "clients" | "agents") => {
    setViewMode(mode);
    setSelectedPoint(null);
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #e8f5e9 30%, #c8e6c9 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          width: 900,
          height: 210,
          background: theme.palette.success.main,
          borderRadius: "50%",
          top: -150,
          right: -95,
          opacity: 0.2,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          width: 700,
          height: 180,
          background: theme.palette.success.light,
          borderRadius: "50%",
          bottom: -150,
          left: -95,
          zIndex: 5,
          opacity: 0.3,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          mb: 1,
        }}
      >
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: theme.palette.primary.main,
            color: "#fff",
            mt: 1,
            left: 18,
            top: 12,
          }}
        >
          <PollIcon fontSize="inherit" />
        </Avatar>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          top: 26,
          left: "54%",
          transform: "translateX(-50%)",
          zIndex: 1,
          height: "auto",
        }}
      >
        <Typography variant="h6" gutterBottom>
          {t("salesDistribution.title")}
        </Typography>
      </Box>

      {/* Admin-specific Buttons */}
      {userRole === "admin" && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            mb: 2,
            zIndex: 1,
            mt: isMobile ? 5 : 0,
          }}
        >
          <Tooltip
            title={t("salesDistribution.viewClients", "View Clients")}
            arrow
          >
            <Button
              variant={viewMode === "clients" ? "contained" : "outlined"}
              onClick={() => handleViewModeToggle("clients")}
            >
              {t("salesDistribution.clients", "Clients")}
            </Button>
          </Tooltip>
          <Tooltip
            title={t("salesDistribution.viewAgents", "View Agents")}
            arrow
          >
            <Button
              variant={viewMode === "agents" ? "contained" : "outlined"}
              onClick={() => handleViewModeToggle("agents")}
            >
              {t("salesDistribution.agents", "Agents")}
            </Button>
          </Tooltip>
        </Box>
      )}

      {/* Divider */}
      <Divider sx={{ my: 2, borderRadius: "12px", zIndex: 1 }} />

      {/* Chart or Skeleton */}
      <Box
        sx={{ width: "100%", height: isMobile ? "250px" : "300px", zIndex: 2 }}
      >
        {loading ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={isMobile ? 250 : 300}
            sx={{ borderRadius: "12px" }}
          />
        ) : (
          <Chart
            options={options}
            series={series}
            type="bar"
            height={isMobile ? 250 : 300}
          />
        )}
      </Box>
    </Paper>
  );
};

export default React.memo(SalesDistribution);
