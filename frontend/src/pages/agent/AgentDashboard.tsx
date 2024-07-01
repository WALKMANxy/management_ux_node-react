/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../app/store";
import GlobalSearch from "../../components/common/GlobalSearch";
import useAgentStats from "../../features/hooks/useAgentStats";
import {
  Box,
  Typography,
  Grid,
  Button,
  useMediaQuery,
  useTheme,
  Skeleton,
  Divider,
  Paper,
  Fab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarComponent from "../../components/common/CalendarComponent";
import TopBrandsSold from "../../components/charts/TopBrandSold";
import SalesDistribution from "../../components/charts/SalesDistribution";
import MonthOverMonthSpendingTrend from "../../components/charts/MonthOverMonthSpendingTrend";

import { setVisits } from "../../features/calendar/calendarSlice";
import {
  calculateTotalRevenue,
  calculateTotalOrders,
  calculateTopBrandsData,
  calculateSalesDistributionData,
} from "../../utils/dataUtils";
import { calculateMonthlyData } from "../../utils/dataLoader";
import TotalEarning from "../../components/common/TotalRevenue";
import TotalOrder from "../../components/common/TotalOrders";
import { gradients, brandColors } from "../../utils/constants";
import UpcomingVisits from "../../components/common/UpcomingVisits";
import ActivePromotions from "../../components/common/ActivePromotions";

const AgentDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const loggedInAgentId = useSelector((state: RootState) => state.auth.id);
  const {
    agentDetails,
    selectedClient,
    selectClient,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTopArticleType,
  } = useAgentStats(loggedInAgentId);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClientSelect = useCallback((clientName: string) => {
    selectClient(clientName);
  }, [selectClient]);

  useEffect(() => {
    if (agentDetails) {
      dispatch(
        setVisits(agentDetails.clients.flatMap((client) => client.visits))
      );
    }
  }, [agentDetails, dispatch]);

  const totalRevenue = useMemo(() => agentDetails
    ? parseFloat(calculateTotalRevenue(agentDetails.clients))
    : 0, [agentDetails]);
  
  const totalOrders = useMemo(() => agentDetails
    ? calculateTotalOrders(agentDetails.clients)
    : 0, [agentDetails]);
  
  const topBrandsData = useMemo(() => agentDetails
    ? calculateTopBrandsData(agentDetails.clients)
    : [], [agentDetails]);
  
  const salesDistributionData = useMemo(() => agentDetails
    ? calculateSalesDistributionData(agentDetails.clients, isMobile)
    : [], [agentDetails, isMobile]);

  const { months, revenueData, ordersData } = useMemo(() => agentDetails
    ? calculateMonthlyData(agentDetails.clients)
    : { months: [], revenueData: [], ordersData: [] }, [agentDetails]);

  const yearlyOrders = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return ordersData.reduce((acc, orders, index) => {
      const year = parseInt(months[index].split('-')[0]);
      acc[year] = (acc[year] || 0) + orders;
      return acc;
    }, {} as { [key: number]: number });
  }, [ordersData, months]);
  
  const yearlyCategories = useMemo(() => Object.keys(yearlyOrders).map(String), [yearlyOrders]);
  const yearlyOrdersData = useMemo(() => yearlyCategories.map(year => yearlyOrders[parseInt(year)]), [yearlyCategories, yearlyOrders]);

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
      <Grid container spacing={4} mt={2 }>
        <Grid item xs={12} md={8}>
          {selectedClient ? (
            <Box mb={4}>
              <Typography variant="h5" gutterBottom>
                Statistics for {selectedClient.name}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  {agentDetails ? (
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        borderRadius: "12px",
                        background: gradients[0],
                      }}
                    >
                      <Box
                        sx={{
                          display: "inline-block",
                          backgroundColor: "rgba(0, 0, 0, 1%)",
                          borderRadius: "24px",
                          px: 2,
                          py: 0.5,
                          mb: 2.5,
                        }}
                      >
                        <Typography variant="h6">Spent This Month</Typography>
                      </Box>
                      <Typography variant="body1">
                        €
                        {calculateTotalSpentThisMonth(selectedClient.movements)}
                      </Typography>
                    </Paper>
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  {agentDetails ? (
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        borderRadius: "12px",
                        background: gradients[1],
                      }}
                    >
                      <Box
                        sx={{
                          display: "inline-block",
                          backgroundColor: "rgba(0, 0, 0, 1%)",
                          borderRadius: "24px",
                          px: 2,
                          py: 0.5,
                          mb: 2.5,
                        }}
                      >
                        <Typography variant="h6">Spent This Year</Typography>
                      </Box>
                      <Typography variant="body1">
                        €{calculateTotalSpentThisYear(selectedClient.movements)}
                      </Typography>
                    </Paper>
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  {agentDetails ? (
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        borderRadius: "12px",
                        background: gradients[2],
                      }}
                    >
                      <Box
                        sx={{
                          display: "inline-block",
                          backgroundColor: "rgba(0, 0, 0, 1%)",
                          borderRadius: "24px",
                          px: 2,
                          py: 0.5,
                          mb: 2.5,
                        }}
                      >
                        <Typography variant="h6">Top Article Type</Typography>
                      </Box>
                      <Typography variant="body1">
                        {calculateTopArticleType(selectedClient.movements)}
                      </Typography>
                    </Paper>
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: "12px" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
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
