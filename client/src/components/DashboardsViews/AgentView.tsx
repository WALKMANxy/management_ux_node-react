/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
// src/components/dashboard/AgentView.tsx
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Fab,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { brandColors } from "../../utils/constants";
import { calculateTopBrandsData } from "../../utils/dataUtils";
import AgentActivityOverview from "../dashboard/AgentActivityOverview";
import SpentThisMonth from "../dashboard/SpentThisMonth";
import SpentThisYear from "../dashboard/SpentThisYear";
import TopArticleType from "../dashboard/TopArticleType";
import MonthOverMonthSpendingTrend from "../statistics/charts/MonthOverMonthSpendingTrend";
import TopBrandsSold from "../statistics/charts/TopBrandSold";

interface AgentViewProps {
  selectedAgentData: any; // Replace `any` with appropriate type
  handleToggleDrawer: () => void;
  clearSelection: () => void;
  calculateTotalSpentThisMonth: Function; // Replace `Function` with specific type
  calculateTotalSpentThisYearForAgents: Function;
  calculateTopArticleType: Function;
  calculateMonthlyData: Function;
  agentComparativeStatisticsMonthly: any; // Replace `any` with appropriate type
  agentComparativeStatistics: any;
  salesDistributionDataAgents: any;
}

const AgentView: React.FC<AgentViewProps> = ({
  selectedAgentData,
  handleToggleDrawer,
  clearSelection,
  calculateTotalSpentThisMonth,
  calculateTotalSpentThisYearForAgents,
  calculateTopArticleType,
  calculateMonthlyData,
  agentComparativeStatisticsMonthly,
  agentComparativeStatistics,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isTablet = useMediaQuery("(min-width:900px) and (max-width:1250px)");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const topBrandsForSelectedAgent = React.useMemo(() => {
    if (selectedAgentData) {
      const movements = selectedAgentData.clients.flatMap(
        (client: any) => client.movements
      );
      return calculateTopBrandsData(movements);
    }
    return [];
  }, [selectedAgentData]);

  return (
    <Box mb={4}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          {t("adminDashboard.statisticsFor", {
            name: selectedAgentData.name,
          })}
        </Typography>
        {isTablet && (
          <Fab
            color="primary"
            aria-label={t("adminDashboard.calendarButton")}
            onClick={handleToggleDrawer}
            sx={{
              zIndex: 1000,
            }}
          >
            <CalendarMonthIcon />
          </Fab>
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <SpentThisMonth
            amount={
              calculateTotalSpentThisMonth(
                selectedAgentData.clients.flatMap(
                  (client: any) => client.movements
                )
              ).totalRevenue
            }
            comparison={{
              value: parseFloat(
                `${agentComparativeStatisticsMonthly?.revenuePercentage || "0"}`
              ),
            }}
            isAgentSelected={true}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SpentThisYear
            amount={calculateTotalSpentThisYearForAgents(
              selectedAgentData.clients
            )}
            comparison={{
              value: parseFloat(
                `${agentComparativeStatistics?.revenuePercentage || "0"}`
              ),
            }}
            isAgentSelected={true}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TopArticleType
            articles={calculateTopArticleType(
              selectedAgentData.clients.flatMap(
                (client: any) => client.movements
              )
            )}
            isAgentSelected={true}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <MonthOverMonthSpendingTrend
            months={calculateMonthlyData(selectedAgentData.clients).months}
            revenueData={
              calculateMonthlyData(selectedAgentData.clients).revenueData
            }
            userRole="admin"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TopBrandsSold
            topBrandsData={topBrandsForSelectedAgent}
            brandColors={brandColors}
            isMobile={isMobile}
            isAgentSelected={true}
          />
        </Grid>
        <Grid item xs={12}>
          <AgentActivityOverview selectedAgent={selectedAgentData} />
        </Grid>
      </Grid>

      {/* Close Selection FAB */}
      <Fab
        color="secondary"
        aria-label={t("adminDashboard.closeButton")}
        sx={{
          position: "fixed",
          bottom: isMobile ? 20 : 16,
          right: isMobile ? 120 : 16,
          zIndex: 1300,
        }}
        onClick={() => clearSelection()}
      >
        <CloseIcon fontSize="small" />
      </Fab>
    </Box>
  );
};

export default AgentView;
