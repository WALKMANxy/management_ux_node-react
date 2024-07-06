import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Divider,
  Fab,
  Grid,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect } from "react";
import { useDispatch} from "react-redux";
import { useTranslation } from "react-i18next";
import ActivePromotions from "../../components/dashboard/ActivePromotions";
import CalendarComponent from "../../components/dashboard/CalendarComponent";
import SpentThisMonth from "../../components/dashboard/SpentThisMonth";
import SpentThisYear from "../../components/dashboard/SpentThisYear";
import TopArticleType from "../../components/dashboard/TopArticleType";
import TotalOrder from "../../components/dashboard/TotalOrders";
import TotalEarning from "../../components/dashboard/TotalRevenue";
import UpcomingVisits from "../../components/dashboard/UpcomingVisits";
import GlobalSearch from "../../components/Header/GlobalSearch";
import MonthOverMonthSpendingTrend from "../../components/statistics/charts/MonthOverMonthSpendingTrend";
import SalesDistribution from "../../components/statistics/charts/SalesDistribution";
import TopBrandsSold from "../../components/statistics/charts/TopBrandSold";
import { setVisits } from "../../features/calendar/calendarSlice";
import useAdminStats from "../../hooks/useAdminStats";
import { brandColors } from "../../utils/constants";
import AgentActivityOverview from "../../components/dashboard/AgentActivityOverview";
import { calculateMonthlyData } from "../../utils/dataLoader";
import { SearchResult } from "../../models/models";

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    agentsData,
    selectedClient,
    selectedAgent,
    selectClient,
    selectAgent,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
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
  } = useAdminStats(isMobile);

  const handleSelect = useCallback(
    (item: SearchResult) => {
      if (item.type === "client") {
        selectClient(item.name);
      } else if (item.type === "agent") {
        selectAgent(item.name);
      } else {
        // Handle other types here if necessary
        console.log(`Selected ${item.type}: ${item.name}`);
      }
    },
    [selectClient, selectAgent]
  );

  useEffect(() => {
    if (agentsData) {
      dispatch(
        setVisits(
          agentsData.flatMap((agent) =>
            agent.clients.flatMap((client) => client.visits)
          )
        )
      );
    }
  }, [agentsData, dispatch]);

  return (
    <Box
      className="admin-dashboard"
      sx={{ p: isMobile ? 0 : 4, bgcolor: "#f4f5f7" }}
    >
      <Typography variant="h4" gutterBottom>
        {t("adminDashboard.welcomeBack", { name: "Admin" })}
      </Typography>
      {isLoading ? (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={50}
          sx={{ borderRadius: "12px" }}
          aria-label="skeleton"
        />
      ) : (
        <GlobalSearch
          filter="admin"
          onSelect={handleSelect} // Single callback
        />
      )}
      <Grid container spacing={6} mt={2}>
        <Grid item xs={12} md={9}>
          {selectedAgent ? (
            <Box mb={4}>
              <Typography variant="h5" gutterBottom>
                {t("adminDashboard.statisticsFor", {
                  name: selectedAgent.name,
                })}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <SpentThisMonth
                    amount={calculateTotalSpentThisMonth(
                      selectedAgent.clients.flatMap(
                        (client) => client.movements
                      )
                    )}
                    comparison={{ value: 30, trend: "up" }} // Placeholder for comparison
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <SpentThisYear
                    amount={calculateTotalSpentThisYear(
                      selectedAgent.clients.flatMap(
                        (client) => client.movements
                      )
                    )}
                    comparison={{ value: 20, trend: "down" }} // Placeholder for comparison
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TopArticleType
                    articles={calculateTopArticleType(
                      selectedAgent.clients.flatMap(
                        (client) => client.movements
                      )
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MonthOverMonthSpendingTrend
                    months={calculateMonthlyData(selectedAgent.clients).months}
                    revenueData={
                      calculateMonthlyData(selectedAgent.clients).revenueData
                    }
                    userRole="admin" // Pass the user role
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TopBrandsSold
                    topBrandsData={topBrandsData}
                    brandColors={brandColors}
                    isMobile={isMobile}
                    userRole="admin" // Pass the user role
                  />
                </Grid>
                <Grid item xs={12}>
                  <AgentActivityOverview
                    list={[
                      {
                        id: 1,
                        type: "visits",
                        title: "Visits This Month",
                        time: new Date(),
                      },
                      {
                        id: 2,
                        type: "sales",
                        title: "Sales This Month",
                        time: new Date(),
                      },
                      {
                        id: 3,
                        type: "alerts",
                        title: "Alerts This Month",
                        time: new Date(),
                      },
                    ]}
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3, borderRadius: "8px" }}
              >
                {t("adminDashboard.viewMore")}
              </Button>
              <Fab
                color="secondary"
                aria-label="close"
                sx={{ position: "fixed", bottom: 16, right: 16 }}
                onClick={() => selectAgent("")}
              >
                <CloseIcon />
              </Fab>
            </Box>
          ) : selectedClient ? (
            <Box mb={4}>
              <Typography variant="h5" gutterBottom>
                {t("adminDashboard.statisticsFor", {
                  name: selectedClient.name,
                })}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <SpentThisMonth
                    amount={calculateTotalSpentThisMonth(
                      selectedClient.movements
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <SpentThisYear
                    amount={calculateTotalSpentThisYear(
                      selectedClient.movements
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TopArticleType
                    articles={calculateTopArticleType(selectedClient.movements)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MonthOverMonthSpendingTrend
                    months={calculateMonthlyData([selectedClient]).months}
                    revenueData={
                      calculateMonthlyData([selectedClient]).revenueData
                    }
                    userRole="admin" // Pass the user role
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TopBrandsSold
                    topBrandsData={topBrandsData}
                    brandColors={brandColors}
                    isMobile={isMobile}
                    userRole="admin" // Pass the user role
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3, borderRadius: "8px" }}
              >
                {t("adminDashboard.viewMore")}
              </Button>
              <Fab
                color="secondary"
                aria-label="close"
                sx={{ position: "fixed", bottom: 16, right: 16 }}
                onClick={() => selectClient("")}
              >
                <CloseIcon />
              </Fab>
            </Box>
          ) : (
            <Box mb={4}>
              <Typography variant="h5" gutterBottom>
                {t("adminDashboard.yourStatistics")}
              </Typography>

              <Divider sx={{ my: 2, borderRadius: "12px" }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {isLoading ? (
                    <Skeleton
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
                  {isLoading ? (
                    <Skeleton
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
                  {isLoading ? (
                    <Skeleton
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
                      userRole="admin" // Pass the user role
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {isLoading ? (
                    <Skeleton
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
                      userRole="admin" // Pass the user role
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  {isLoading ? (
                    <Skeleton
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
                      salesDistributionDataAgents={salesDistributionDataAgents}
                    />
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
          <UpcomingVisits
            selectedClient={selectedClient}
            agentDetails={selectedAgent} // Update prop name accordingly
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Box mb={4}>
            <Typography variant="h5" gutterBottom>
              {t("adminDashboard.calendar")}
            </Typography>

            <Divider sx={{ my: 2, borderRadius: "12px" }} />
            {isLoading ? (
              <Skeleton
                variant="rectangular"
                width="100%"
                height={300}
                sx={{ borderRadius: "12px" }}
                aria-label="skeleton"
              />
            ) : (
              <Box sx={{ maxWidth: "400px", margin: "0 auto" }}>
                <CalendarComponent />
              </Box>
            )}
          </Box>
          <ActivePromotions
            selectedClient={selectedClient}
            agentDetails={selectedAgent} // Update prop name accordingly
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(AdminDashboard);
