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
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import GlobalSearch from "../../components/Header/GlobalSearch";
import ActivePromotions from "../../components/dashboard/ActivePromotions";
import AgentActivityOverview from "../../components/dashboard/AgentActivityOverview";
import CalendarComponent from "../../components/dashboard/CalendarComponent";
import SpentThisMonth from "../../components/dashboard/SpentThisMonth";
import SpentThisYear from "../../components/dashboard/SpentThisYear";
import TopArticleType from "../../components/dashboard/TopArticleType";
import TotalOrder from "../../components/dashboard/TotalOrders";
import TotalEarning from "../../components/dashboard/TotalRevenue";
import UpcomingVisits from "../../components/dashboard/UpcomingVisits";
import DrawerContainer from "../../components/dashboard/tabletCalendarContainer";
import MonthOverMonthSpendingTrend from "../../components/statistics/charts/MonthOverMonthSpendingTrend";
import SalesDistribution from "../../components/statistics/charts/SalesDistribution";
import TopBrandsSold from "../../components/statistics/charts/TopBrandSold";
import { selectCurrentUser } from "../../features/users/userSlice";
import useSelectionState from "../../hooks/useSelectionState";
import useStats from "../../hooks/useStats";
import { brandColors } from "../../utils/constants";
import {
  calculateMonthlyData,
  calculateTopBrandsData,
} from "../../utils/dataUtils";

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery("(min-width:900px) and (max-width:1250px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const {
    handleSelect,
    clearSelection,
    clientComparativeStatistics,
    clientComparativeStatisticsMonthly,
    agentComparativeStatistics,
    agentComparativeStatisticsMonthly,
  } = useSelectionState(isMobile);

  const {
    selectedClient,
    selectedAgent,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTotalSpentThisYearForAgents,
    calculateTopArticleType,
    totalRevenue,
    totalOrders,
    topBrandsData,
    salesDistributionDataClients,
    salesDistributionDataAgents,
    months,
    revenueData,
    ordersData,
    yearlyCategories,
    yearlyOrdersData,
    isLoading,
  } = useStats(isMobile);

  const [fakeLoading, setFakeLoading] = useState(true);

  const user = useAppSelector(selectCurrentUser);

  useEffect(() => {
    if (selectedClient) {
      console.log("Selected client:", selectedClient);
    }
  }, [selectedClient]);

  useEffect(() => {
    if (selectedAgent) {
      console.log("Selected client:", selectedAgent);
    }
  }, [selectedAgent]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFakeLoading(false);
    }, 400); // Fake loading for 700ms

    return () => clearTimeout(timer);
  }, []);

  const selectedAgentData = useMemo(() => {
    if (selectedAgent && salesDistributionDataAgents.agents.length > 0) {
      return salesDistributionDataAgents.agents.find(
        (agent) => agent.id === selectedAgent.id
      );
    }
    return null;
  }, [selectedAgent, salesDistributionDataAgents.agents]);

  const topBrandsForSelectedAgent = useMemo(() => {
    if (selectedAgentData) {
      const movements = selectedAgentData.clients.flatMap(
        (client) => client.movements
      );
      return calculateTopBrandsData(movements);
    }
    return [];
  }, [selectedAgentData]);

  const loadingState = isLoading || fakeLoading;

  return (
    <Box
      className="admin-dashboard"
      sx={{ p: isMobile ? 0 : 4, bgcolor: "#f4f5f7" }}
    >
      {loadingState ? (
        <Skeleton
          animation="wave"
          variant="text"
          width="60%"
          height={40}
          sx={{ borderRadius: "4px" }}
          aria-label="loading-welcome"
        />
      ) : (
        <Typography variant="h4" gutterBottom>
          {t("adminDashboard.welcomeBack", {
            name: user?.entityName || "Admin",
          })}
        </Typography>
      )}
      {loadingState ? (
        <Skeleton
          animation="wave"
          variant="rectangular"
          width="100%"
          height={50}
          sx={{ borderRadius: "12px" }}
          aria-label="skeleton"
        />
      ) : (
        <GlobalSearch filter="admin" onSelect={handleSelect} />
      )}

      <Grid container spacing={6} mt={2}>
        <Grid item xs={!isTablet ? 12 : 0} md={!isTablet ? 9 : 0}>
          {selectedAgentData && selectedAgent ? (
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
                    name: selectedAgent.name,
                  })}
                </Typography>
                {isTablet && (
                  <Fab
                    color="primary"
                    aria-label="calendar"
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
                          (client) => client.movements
                        )
                      ).totalRevenue
                    }
                    comparison={{
                      value: parseFloat(
                        `${
                          agentComparativeStatisticsMonthly?.revenuePercentage ||
                          "0"
                        }`
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
                        `${
                          agentComparativeStatistics?.revenuePercentage || "0"
                        }`
                      ),
                    }}
                    isAgentSelected={true}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TopArticleType
                    articles={calculateTopArticleType(
                      selectedAgentData.clients.flatMap(
                        (client) => client.movements
                      )
                    )}
                    isAgentSelected={true}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MonthOverMonthSpendingTrend
                    months={
                      calculateMonthlyData(selectedAgentData.clients).months
                    }
                    revenueData={
                      calculateMonthlyData(selectedAgentData.clients)
                        .revenueData
                    }
                    userRole="admin"
                    isAgentSelected={true}
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

              {/* Updated Fab */}
              <Fab
                color="secondary"
                aria-label="close"
                sx={{
                  position: "fixed",
                  bottom: isMobile ? 20 : 16,
                  right: isMobile ? 120 : 16,
                  zIndex: 1300,
                }}
                onClick={() => clearSelection()}
              >
                <CloseIcon fontSize="small" />{" "}
                {/* Optional: Adjust icon size */}
              </Fab>
            </Box>
          ) : selectedClient ? (
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
                    name: selectedClient.name,
                  })}
                </Typography>
                {isTablet && (
                  <Fab
                    color="primary"
                    aria-label="calendar"
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
                    userRole="admin"
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
                  right: isMobile ? 120 : 16,
                  zIndex: 1300,
                }}
                onClick={() => clearSelection()}
              >
                <CloseIcon fontSize="small" />{" "}
              </Fab>
            </Box>
          ) : (
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
                    aria-label="loading-statistics"
                  />
                ) : (
                  <Typography variant="h5" gutterBottom>
                    {t("adminDashboard.yourStatistics")}
                  </Typography>
                )}
                {isTablet && (
                  <Fab
                    color="primary"
                    aria-label="calendar"
                    onClick={handleToggleDrawer}
                    sx={{
                      zIndex: 1000,
                    }}
                  >
                    <CalendarMonthIcon />
                  </Fab>
                )}
              </Box>

              <Divider sx={{ my: 2, borderRadius: "12px" }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
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
                    <TotalEarning
                      totalEarning={totalRevenue}
                      isLoading={isLoading}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
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
                    <TotalOrder
                      totalOrder={totalOrders}
                      isLoading={isLoading}
                      monthlyOrders={ordersData}
                      yearlyOrders={yearlyOrdersData}
                      monthlyCategories={months}
                      yearlyCategories={yearlyCategories}
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
                      aria-label="skeleton"
                    />
                  ) : (
                    <MonthOverMonthSpendingTrend
                      months={months}
                      revenueData={revenueData}
                      userRole="admin"
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
                      aria-label="skeleton"
                    />
                  ) : (
                    <TopBrandsSold
                      topBrandsData={topBrandsData}
                      isMobile={isMobile}
                      brandColors={brandColors}
                      isAgentSelected={true}
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
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
                    <SalesDistribution
                      salesDistributionDataClients={
                        salesDistributionDataClients
                      }
                      salesDistributionDataAgents={
                        salesDistributionDataAgents.data
                      }
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
              height={300}
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
                  {t("adminDashboard.calendar")}
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
                height={150}
                sx={{ borderRadius: "12px" }}
                aria-label="skeleton"
              />
            ) : (
              <UpcomingVisits isLoading={isLoading} />
            )}
          </Grid>
        )}
      </Grid>

      {/* Drawer Container for Calendar and Upcoming Visits */}
      {isTablet && (
        <DrawerContainer
          open={drawerOpen}
          onClose={handleToggleDrawer}
          isLoading={isLoading}
        />
      )}
    </Box>
  );
};

export default React.memo(AdminDashboard);
