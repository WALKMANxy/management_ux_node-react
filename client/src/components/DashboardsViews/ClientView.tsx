/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/dashboard/ClientView.tsx
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
import React from "react";
import { useTranslation } from "react-i18next";

import { brandColors } from "../../utils/constants";
import SpentThisMonth from "../dashboard/SpentThisMonth";
import SpentThisYear from "../dashboard/SpentThisYear";
import TopArticleType from "../dashboard/TopArticleType";
import MonthOverMonthSpendingTrend from "../statistics/charts/MonthOverMonthSpendingTrend";
import TopBrandsSold from "../statistics/charts/TopBrandSold";

interface ClientViewProps {
  selectedClient: any; // Replace `any` with appropriate type
  handleToggleDrawer: () => void;
  clearSelection?: () => void;
  calculateTotalSpentThisMonth: Function; // Replace `Function` with specific type
  calculateTotalSpentThisYear: Function;
  calculateTopArticleType: Function;
  calculateMonthlyData: Function;
  clientComparativeStatisticsMonthly?: any; // Replace `any` with appropriate type
  clientComparativeStatistics?: any;
  topBrandsData: any;
  userRole: any;
  loadingState: boolean; // New prop to handle loading
}

const ClientView: React.FC<ClientViewProps> = ({
  selectedClient,
  handleToggleDrawer,
  clearSelection,
  calculateTotalSpentThisMonth,
  calculateTotalSpentThisYear,
  calculateTopArticleType,
  calculateMonthlyData,
  clientComparativeStatisticsMonthly,
  clientComparativeStatistics,
  topBrandsData,
  userRole,
  loadingState,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isTablet = useMediaQuery("(min-width:900px) and (max-width:1250px)");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
          <Typography variant="h5" gutterBottom>
            {userRole === "client"
              ? t("dashboard.yourStatistics")
              : t("dashboard.statisticsFor", {
                  name: selectedClient.name,
                })}
          </Typography>
        )}
        {isTablet && (
          <Fab
            color="primary"
            aria-label={t("dashboard.calendarButton")}
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
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={150}
              sx={{ borderRadius: "12px" }}
              aria-label={t("dashboard.skeleton")}
            />
          ) : (
            <SpentThisMonth
              amount={
                calculateTotalSpentThisMonth(selectedClient.movements)
                  .totalRevenue
              }
              {...(clientComparativeStatisticsMonthly && {
                comparison: {
                  value: parseFloat(
                    `${
                      clientComparativeStatisticsMonthly.revenuePercentage ||
                      "0"
                    }`
                  ),
                },
              })}
              isAgentSelected={false}
            />
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={150}
              sx={{ borderRadius: "12px" }}
              aria-label={t("dashboard.skeleton")}
            />
          ) : (
            <SpentThisYear
              amount={calculateTotalSpentThisYear(selectedClient.movements)}
              {...(clientComparativeStatistics && {
                comparison: {
                  value: parseFloat(
                    `${clientComparativeStatistics.revenuePercentage || "0"}`
                  ),
                },
              })}
              isAgentSelected={false}
            />
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={150}
              sx={{ borderRadius: "12px" }}
              aria-label={t("dashboard.skeleton")}
            />
          ) : (
            <TopArticleType
              articles={calculateTopArticleType(selectedClient.movements)}
              isAgentSelected={false}
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
              months={calculateMonthlyData([selectedClient]).months}
              revenueData={calculateMonthlyData([selectedClient]).revenueData}
              userRole={userRole}
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
              topBrandsData={topBrandsData}
              brandColors={brandColors}
              isMobile={isMobile}
              isAgentSelected={false}
            />
          )}
        </Grid>
      </Grid>

      {/* Conditionally render the Close Selection FAB */}
      {userRole !== "client" &&
        !loadingState && ( // Do not render FAB if userRole is "client" or loading
          <Fab
            color="secondary"
            aria-label={t("dashboard.closeButton")}
            sx={{
              position: "fixed",
              bottom: isMobile ? 20 : 16,
              right: isMobile ? 120 : 16,
              zIndex: 1300,
            }}
            onClick={() => clearSelection!()}
          >
            <CloseIcon fontSize="small" />
          </Fab>
        )}
    </Box>
  );
};

export default ClientView;
