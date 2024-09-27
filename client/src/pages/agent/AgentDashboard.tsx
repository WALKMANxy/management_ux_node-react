import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";

import {
  Box,
  Divider,
  Fab,
  Grid,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ActivePromotions from "../../components/dashboard/ActivePromotions";
import CalendarComponent from "../../components/dashboard/CalendarComponent";
import SpentThisMonth from "../../components/dashboard/SpentThisMonth";
import SpentThisYear from "../../components/dashboard/SpentThisYear";
import DrawerContainer from "../../components/dashboard/tabletCalendarContainer";
import TopArticleType from "../../components/dashboard/TopArticleType";
import TotalOrder from "../../components/dashboard/TotalOrders";
import TotalEarning from "../../components/dashboard/TotalRevenue";
import UpcomingVisits from "../../components/dashboard/UpcomingVisits";
import GlobalSearch from "../../components/Header/GlobalSearch";
import MonthOverMonthSpendingTrend from "../../components/statistics/charts/MonthOverMonthSpendingTrend";
import SalesDistribution from "../../components/statistics/charts/SalesDistribution";
import TopBrandsSold from "../../components/statistics/charts/TopBrandSold";
import useLoadingData from "../../hooks/useLoadingData";
import useSelectionState from "../../hooks/useSelectionState";
import useStats from "../../hooks/useStats";
import { brandColors } from "../../utils/constants";
import { calculateMonthlyData } from "../../utils/dataUtils";

const AgentDashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery("(min-width:900px) and (max-width:1250px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const {
    selectedClient,
    handleSelect,
    clearSelection,
    clientComparativeStatistics,
    clientComparativeStatisticsMonthly,
  } = useSelectionState(isMobile);

  const { loadingState } = useLoadingData();

  const {
    details,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTopArticleType,
    totalRevenue,
    totalOrders,
    topBrandsData,
    salesDistributionDataClients,
    months,
    revenueData,
    ordersData,
    yearlyCategories,
    yearlyOrdersData,
  } = useStats(isMobile);

  return (
    <Box
      className="agent-dashboard"
      sx={{ p: isMobile ? 0 : 4, bgcolor: "#f4f5f7" }}
    >
      {" "}
      {loadingState ? (
        <Skeleton
          animation="wave"
          variant="text"
          width="50%"
          height={30}
          sx={{ borderRadius: "4px" }}
          aria-label="loading-statistics"
        />
      ) : (
        <Typography variant="h4" gutterBottom>
          {details && "name" in details ? (
            <>{t("agentDashboard.welcomeBack", { name: details.name })}</>
          ) : (
            <Skeleton animation="wave" width="30%" />
          )}
        </Typography>
      )}
      {details && "clients" in details ? (
        <GlobalSearch filter="client" onSelect={handleSelect} />
      ) : (
        <Skeleton
          animation="wave"
          variant="rectangular"
          width="100%"
          height={50}
          sx={{ borderRadius: "12px" }}
          aria-label="skeleton"
        />
      )}
      {/* FAB Button for Calendar - Positioned Top Right */}
      {isTablet && (
        <Fab
          color="primary"
          aria-label="calendar"
          onClick={handleToggleDrawer}
          sx={{
            position: "absolute",
            top: 220, // Adjust as needed based on layout
            right: 32, // Adjust as needed based on layout
            zIndex: 1000,
          }}
        >
          <CalendarMonthIcon />
        </Fab>
      )}
      <Grid container spacing={6} mt={2}>
        <Grid item xs={!isTablet ? 12 : 0} md={!isTablet ? 9 : 0}>
          {selectedClient ? (
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
                  {t("agentDashboard.statisticsFor", {
                    name: selectedClient.name,
                  })}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <SpentThisMonth
                    amount={
                      calculateTotalSpentThisMonth(selectedClient.movements)
                        .totalRevenue
                    }
                    comparison={{
                      value: parseFloat(
                        `${
                          clientComparativeStatisticsMonthly?.revenuePercentage ||
                          "0"
                        }`
                      ),
                    }}
                    isAgentSelected={false}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <SpentThisYear
                    amount={calculateTotalSpentThisYear(
                      selectedClient.movements
                    )}
                    comparison={{
                      value: parseFloat(
                        `${
                          clientComparativeStatistics?.revenuePercentage || "0"
                        }`
                      ),
                    }}
                    isAgentSelected={false}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TopArticleType
                    articles={calculateTopArticleType(selectedClient.movements)}
                    isAgentSelected={false}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MonthOverMonthSpendingTrend
                    months={calculateMonthlyData([selectedClient]).months}
                    revenueData={
                      calculateMonthlyData([selectedClient]).revenueData
                    }
                    userRole="agent" // Pass the user role
                    isAgentSelected={false}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TopBrandsSold
                    topBrandsData={topBrandsData}
                    brandColors={brandColors}
                    isMobile={isMobile}
                    isAgentSelected={false}
                  />
                </Grid>
              </Grid>

              <Fab
                color="secondary"
                aria-label="close"
                sx={{
                  position: "fixed",
                  bottom: isMobile ? 20 : 16,
                  right: isMobile ? 20 : 16,
                  zIndex: 1300,
                }}
                onClick={() => clearSelection()}
              >
                <CloseIcon fontSize="small" />{" "}
              </Fab>
            </Box>
          ) : (
            <Box mb={4}>
              {loadingState ? (
                <Skeleton
                  animation="wave"
                  variant="text"
                  width="50%"
                  height={30}
                  sx={{ borderRadius: "4px" }}
                  aria-label="loading-statistics"
                />
              ) : (
                <Typography variant="h5" gutterBottom>
                  {details && "name" in details ? (
                    t("agentDashboard.yourStatistics")
                  ) : (
                    <Skeleton animation="wave" width="40%" />
                  )}
                </Typography>
              )}

              <Divider sx={{ my: 2, borderRadius: "12px" }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {!loadingState ? (
                    <TotalEarning totalEarning={totalRevenue} />
                  ) : (
                    <Skeleton
                      animation="wave"
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: "12px" }}
                      aria-label="skeleton"
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {!loadingState ? (
                    <TotalOrder
                      totalOrder={totalOrders}
                      monthlyOrders={ordersData}
                      yearlyOrders={yearlyOrdersData}
                      monthlyCategories={months}
                      yearlyCategories={yearlyCategories}
                    />
                  ) : (
                    <Skeleton
                      animation="wave"
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: "12px" }}
                      aria-label="skeleton"
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {!loadingState ? (
                    <MonthOverMonthSpendingTrend
                      months={months}
                      revenueData={revenueData}
                      userRole="agent" // Pass the user role
                      isAgentSelected={true}
                    />
                  ) : (
                    <Skeleton
                      animation="wave"
                      variant="rectangular"
                      width="100%"
                      height={300}
                      sx={{ borderRadius: "12px" }}
                      aria-label="skeleton"
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {!loadingState ? (
                    <TopBrandsSold
                      topBrandsData={topBrandsData}
                      isMobile={isMobile}
                      brandColors={brandColors}
                      isAgentSelected={true}
                    />
                  ) : (
                    <Skeleton
                      animation="wave"
                      variant="rectangular"
                      width="100%"
                      height={300}
                      sx={{ borderRadius: "12px" }}
                      aria-label="skeleton"
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  {!loadingState ? (
                    <SalesDistribution
                      salesDistributionDataClients={
                        salesDistributionDataClients
                      }
                    />
                  ) : (
                    <Skeleton
                      animation="wave"
                      variant="rectangular"
                      width="100%"
                      height={300}
                      sx={{ borderRadius: "12px" }}
                      aria-label="skeleton"
                    />
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={200}
              sx={{ borderRadius: "12px" }}
              aria-label="skeleton"
            />
          ) : (
            <ActivePromotions />
          )}
        </Grid>
        {/* Calendar and Upcoming Visits section */}
        {!isTablet && (
          <Grid item xs={12} md={3}>
            <Box mb={4}>
              {loadingState ? (
                <Skeleton
                  animation="wave"
                  variant="text"
                  height={30}
                  sx={{ borderRadius: "4px" }}
                  aria-label="loading-text"
                />
              ) : (
                <Typography variant="h5" gutterBottom>
                  {details && "name" in details ? (
                    t("agentDashboard.calendar")
                  ) : (
                    <Skeleton animation="wave" width="30%" />
                  )}
                </Typography>
              )}
              <Divider sx={{ my: 2, borderRadius: "12px" }} />
              {loadingState ? (
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width="100%"
                  height={300}
                  sx={{ borderRadius: "12px" }}
                  aria-label="skeleton"
                />
              ) : (
                <Box sx={{ margin: "0 auto" }}>
                  <CalendarComponent />
                </Box>
              )}
            </Box>
            {loadingState ? (
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="100%"
                height={200}
                sx={{ borderRadius: "12px" }}
                aria-label="skeleton"
              />
            ) : (
              <UpcomingVisits />
            )}
          </Grid>
        )}
      </Grid>
      {/* Drawer Container for Calendar and Upcoming Visits */}
      {isTablet && (
        <DrawerContainer open={drawerOpen} onClose={handleToggleDrawer} />
      )}
    </Box>
  );
};

export default React.memo(AgentDashboard);
