import {
  Box,
  Button,
  Divider,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import { ApexOptions } from "apexcharts";
import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { SalesDistributionProps } from "../../../models/propsModels";
import { currencyFormatter } from "../../../utils/dataUtils";

// SalesDistribution.tsx

const SalesDistribution: React.FC<SalesDistributionProps> = ({
  salesDistributionDataClients,
  salesDistributionDataAgents,
}) => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"clients" | "agents">("clients");

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

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: {
          show: false,
        },
        background: "transparent",
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
          formatter: (value) => {
            return currencyFormatter(value);
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          const fullLabel = dataset[dataPointIndex].label;
          const value = series[seriesIndex][dataPointIndex];
          const formattedValue = currencyFormatter(value);
          const x = w.globals.dom.baseEl.getBoundingClientRect().left;
          const tooltipWidth = 150;

          const positionLeft = x + tooltipWidth > window.innerWidth;

          return `<div class="tooltip-custom" style="font-size: 14px; padding: 8px; white-space: nowrap; background: #fff; border: 1px solid #ccc; border-radius: 4px; ${
            positionLeft ? "right: 0;" : "left: 0;"
          }">
            <span>${fullLabel}</span>: <strong>${formattedValue}</strong>
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
        name: t("salesDistribution.revenue"),
        data: dataset.map((data) => data.value),
      },
    ],
    [dataset, t]
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
          {t("salesDistribution.title")}
        </Typography>
      </Box>

      {userRole === "admin" && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            mb: 2,
            zIndex: 1,
          }}
        >
          <Button
            variant={viewMode === "clients" ? "contained" : "outlined"}
            onClick={() => setViewMode("clients")}
          >
            {t("salesDistribution.clients")}
          </Button>
          <Button
            variant={viewMode === "agents" ? "contained" : "outlined"}
            onClick={() => setViewMode("agents")}
          >
            {t("salesDistribution.agents")}
          </Button>
        </Box>
      )}

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

export default SalesDistribution;
React.memo(SalesDistribution);
