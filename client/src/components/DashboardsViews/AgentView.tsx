/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
// src/components/dashboard/AgentView.tsx
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Fab,
  Grid,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { memo } from "react";
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
  loadingState: boolean;
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
  loadingState,
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
        {loadingState ? (
          <Skeleton
            animation="wave"
            variant="text"
            width="50%"
            height={30}
            sx={{ borderRadius: "4px" }}
            aria-label={t("dashboard.loadingStatistics")}
          />
        ) : (
          <Typography variant="h5" gutterBottom fontWeight={100}>
            {" "}
            {t("dashboard.statisticsFor", {
              name: selectedAgentData.name,
            })}
          </Typography>
        )}
        {isTablet && (
          <React.Fragment>
            {loadingState ? (
              <Skeleton
                animation="wave"
                variant="circular"
                width={56}
                height={56}
                sx={{
                  borderRadius: "50%",
                  zIndex: 1000,
                }}
              />
            ) : (
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
          </React.Fragment>
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ borderRadius: "12px" }}
              aria-label={t("dashboard.skeleton")}
            />
          ) : (
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
                  `${
                    agentComparativeStatisticsMonthly?.revenuePercentage || "0"
                  }`
                ),
              }}
              isAgentSelected={true}
            />
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ borderRadius: "12px" }}
              aria-label={t("dashboard.skeleton")}
            />
          ) : (
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
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ borderRadius: "12px" }}
              aria-label={t("dashboard.skeleton")}
            />
          ) : (
            <TopArticleType
              articles={calculateTopArticleType(
                selectedAgentData.clients.flatMap(
                  (client: any) => client.movements
                )
              )}
              isAgentSelected={true}
            />
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ borderRadius: "12px" }}
              aria-label={t("dashboard.skeleton")}
            />
          ) : (
            <MonthOverMonthSpendingTrend
              months={calculateMonthlyData(selectedAgentData.clients).months}
              revenueData={
                calculateMonthlyData(selectedAgentData.clients).revenueData
              }
              netRevenueData={
                calculateMonthlyData(selectedAgentData.clients).netRevenueData
              }
              userRole="admin"
            />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ borderRadius: "12px" }}
              aria-label={t("dashboard.skeleton")}
            />
          ) : (
            <TopBrandsSold
              topBrandsData={topBrandsForSelectedAgent}
              brandColors={brandColors}
              isMobile={isMobile}
              isAgentSelected={true}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <AgentActivityOverview selectedAgent={selectedAgentData} />
        </Grid>
      </Grid>

      {/* Close Selection FAB */}
      {loadingState ? (
        <Skeleton
          animation="wave"
          variant="circular"
          width={40}
          height={40}
          sx={{ borderRadius: "50%" }}
          aria-label={t("dashboard.loadingCalendarButton")}
        />
      ) : (
        <Fab
          color="secondary"
          aria-label={t("adminDashboard.closeButton")}
          sx={{
            position: "fixed",
            bottom: isMobile ? 10 : 16,
            right: isMobile ? 5 : 16,
            zIndex: 1300,
          }}
          onClick={() => clearSelection()}
        >
          <CloseIcon fontSize="small" />
        </Fab>
      )}
    </Box>
  );
};

export default memo(AgentView);
