/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../app/store";
import useAgentStats from "../../hooks/useAgentStats";
import {
  Box,
  Typography,
  Grid,
  Button,
  useMediaQuery,
  useTheme,
  Skeleton,
  Divider,
  Fab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarComponent from "../../components/dashboard/CalendarComponent";
import { setVisits } from "../../features/calendar/calendarSlice";
import TotalEarning from "../../components/dashboard/TotalRevenue";
import TotalOrder from "../../components/dashboard/TotalOrders";
import { brandColors } from "../../utils/constants";
import UpcomingVisits from "../../components/dashboard/UpcomingVisits";
import ActivePromotions from "../../components/dashboard/ActivePromotions";
import SpentThisMonth from "../../components/dashboard/SpentThisMonth";
import SpentThisYear from "../../components/dashboard/SpentThisYear";
import TopArticleType from "../../components/dashboard/TopArticleType";
import { calculateAgentMonthlyData } from "../../utils/dataLoader";
import GlobalSearch from "../../components/Header/GlobalSearch";
import MonthOverMonthSpendingTrend from "../../components/statistics/charts/MonthOverMonthSpendingTrend";
import TopBrandsSold from "../../components/statistics/charts/TopBrandSold";
import SalesDistribution from "../../components/statistics/charts/SalesDistribution";

const AgentDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const loggedInAgentId = useSelector((state: RootState) => state.auth.id);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    agentDetails,
    selectedClient,
    selectClient,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTopArticleType,
    totalRevenue,
    totalOrders,
    topBrandsData,
    salesDistributionData,
    months,
    revenueData,
    ordersData,
    yearlyCategories,
    yearlyOrdersData,
  } = useAgentStats(loggedInAgentId, isMobile);

  const handleClientSelect = useCallback(
    (clientName: string) => {
      selectClient(clientName);
    },
    [selectClient]
  );

  useEffect(() => {
    if (agentDetails) {
      dispatch(
        setVisits(agentDetails.clients.flatMap((client) => client.visits))
      );
    }
  }, [agentDetails, dispatch]);

  return (
    <Box
      className="agent-dashboard"
      sx={{ p: isMobile ? 0 : 4, bgcolor: "#f4f5f7" }}
    >
      <Typography variant="h4" gutterBottom>
        {agentDetails ? (
          <>Welcome back, {agentDetails.name}</>
        ) : (
          <Skeleton width="30%" />
        )}
      </Typography>
      {agentDetails ? (
        <GlobalSearch filter="client" onSelect={handleClientSelect} />
      ) : (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={50}
          sx={{ borderRadius: "12px" }}
        />
      )}
      <Grid container spacing={6} mt={2}>
        <Grid item xs={12} md={9}>
          {selectedClient ? (
            <Box mb={4}>
              <Typography variant="h5" gutterBottom>
                Statistics for {selectedClient.name}
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
                    months={calculateAgentMonthlyData([selectedClient]).months}
                    revenueData={
                      calculateAgentMonthlyData([selectedClient]).revenueData
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TopBrandsSold
                    topBrandsData={topBrandsData}
                    brandColors={brandColors}
                    isMobile={isMobile}
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3, borderRadius: "8px" }}
              >
                View More
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
                {agentDetails ? "Your Statistics" : <Skeleton width="40%" />}
              </Typography>

              <Divider sx={{ my: 2, borderRadius: "12px" }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {agentDetails ? (
                    <TotalEarning
                      totalEarning={totalRevenue}
                      isLoading={!agentDetails}
                    />
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {agentDetails ? (
                    <TotalOrder
                      totalOrder={totalOrders}
                      isLoading={!agentDetails}
                      monthlyOrders={ordersData}
                      yearlyOrders={yearlyOrdersData}
                      monthlyCategories={months}
                      yearlyCategories={yearlyCategories}
                    />
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {agentDetails ? (
                    <MonthOverMonthSpendingTrend
                      months={months}
                      revenueData={revenueData}
                    />
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={300}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {agentDetails ? (
                    <TopBrandsSold
                      topBrandsData={topBrandsData}
                      isMobile={isMobile}
                      brandColors={brandColors}
                    />
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={300}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  {agentDetails ? (
                    <SalesDistribution
                      salesDistributionData={salesDistributionData}
                    />
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={300}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
          <UpcomingVisits
            selectedClient={selectedClient}
            agentDetails={agentDetails}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Box mb={4}>
            <Typography variant="h5" gutterBottom>
              {agentDetails ? "Calendar" : <Skeleton width="30%" />}
            </Typography>

            <Divider sx={{ my: 2, borderRadius: "12px" }} />
            {agentDetails ? (
              <Box sx={{ maxWidth: "400px", margin: "0 auto" }}>
                <CalendarComponent />
              </Box>
            ) : (
              <Skeleton
                variant="rectangular"
                width="100%"
                height={300}
                sx={{ borderRadius: "12px" }}
              />
            )}
          </Box>
          <ActivePromotions
            selectedClient={selectedClient}
            agentDetails={agentDetails}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(AgentDashboard);
