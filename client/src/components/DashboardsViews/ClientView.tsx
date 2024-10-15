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
import { calculateTopBrandsData } from "../../utils/dataUtils";
import ActivePromotions from "../dashboard/ActivePromotions";
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
  userRole,
  loadingState,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isTablet = useMediaQuery("(min-width:900px) and (max-width:1250px)");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const topBrandsForSelectedClient = React.useMemo(() => {
    if (selectedClient) {
      return calculateTopBrandsData(selectedClient.movements);
    }
    return [];
  }, [selectedClient]);

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
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 100, // Now using the lighter custom font weight
            }}
          >
            {" "}
            {userRole === "client"
              ? t("dashboard.yourStatistics")
              : t("dashboard.statisticsFor", {
                  name: selectedClient.name,
                })}
          </Typography>
        )}
        {isTablet && (
          <React.Fragment>
            {loadingState ? (
              <Skeleton
                animation="wave"
                variant="circular"
                width={40}
                height={40}
                sx={{
                  borderRadius: "50%",
                  zIndex: 1000,
                }}
                aria-label={t("dashboard.loadingCalendarButton")}
              />
            ) : (
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
              height={300}
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
              height={300}
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
              netRevenueData={calculateMonthlyData([selectedClient]).netRevenueData}
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
              topBrandsData={topBrandsForSelectedClient}
              brandColors={brandColors}
              isMobile={isMobile}
              isAgentSelected={false}
            />
          )}
        </Grid>
      </Grid>
      <Box pt={2.5}>
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
          <ActivePromotions clientSelected={selectedClient.id} />
        )}
      </Box>

      {/* Conditionally render the Close Selection FAB */}
      {userRole !== "client" &&
        (loadingState ? (
          // Show Skeleton when loadingState is true
          <Skeleton
            animation="wave"
            variant="circular"
            width={40}
            height={40}
            sx={{
              borderRadius: "50%",
              position: "fixed",
              bottom: isMobile ? 10 : 16,
              right: isMobile ? 5 : 16,
              zIndex: 1300,
            }}
            aria-label={t("dashboard.loadingCalendarButton")}
          />
        ) : (
          // Show FAB when not loading
          <Fab
            color="secondary"
            aria-label={t("dashboard.closeButton")}
            sx={{
              position: "fixed",
              bottom: isMobile ? 10 : 16,
              right: isMobile ? 5 : 16,
              zIndex: 1300,
            }}
            onClick={() => clearSelection!()}
          >
            <CloseIcon fontSize="small" />
          </Fab>
        ))}
    </Box>
  );
};

export default ClientView;
