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
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "../../app/store";
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
import useStats from "../../hooks/useStats";
import { brandColors } from "../../utils/constants";
import { Agent, SearchResult } from "../../models/models";
import { calculateMonthlyData, getTrend } from "../../utils/dataUtils";

const AgentDashboard: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const loggedInAgentId = useSelector((state: RootState) => state.auth.id);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    details,
    selectedClient,
    selectClient,
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
    clientComparativeStatistics,
    clientComparativeStatisticsMonthly,
  } = useStats("agent", loggedInAgentId, isMobile);

  const handleClientSelect = useCallback(
    (result: SearchResult) => {
      if (result.type === "client") {
        selectClient(result.name);
      } else {
        console.error("Selected item is not a client");
      }
    },
    [selectClient]
  );

  useEffect(() => {
    if (details && "AgentVisits" in details) {
      dispatch(setVisits(details.AgentVisits));
    }
  }, [details, dispatch]);

  return (
    <Box
      className="agent-dashboard"
      sx={{ p: isMobile ? 0 : 4, bgcolor: "#f4f5f7" }}
    >
      <Typography variant="h4" gutterBottom>
        {details && "name" in details ? (
          <>{t("agentDashboard.welcomeBack", { name: details.name })}</>
        ) : (
          <Skeleton width="30%" />
        )}
      </Typography>
      {details && "clients" in details ? (
        <GlobalSearch filter="client" onSelect={handleClientSelect} />
      ) : (
        <Skeleton
          variant="rectangular"
          width="100%"
          height={50}
          sx={{ borderRadius: "12px" }}
          aria-label="skeleton"
        />
      )}
      <Grid container spacing={6} mt={2}>
        <Grid item xs={12} md={9}>
          {selectedClient ? (
            <Box mb={4}>
              <Typography variant="h5" gutterBottom>
                {t("agentDashboard.statisticsFor", {
                  name: selectedClient.name,
                })}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <SpentThisMonth
                    amount={calculateTotalSpentThisMonth(
                      selectedClient.movements
                    )}
                    comparison={{
                      value: parseFloat(
                        `${
                          clientComparativeStatisticsMonthly?.revenuePercentage ||
                          "0"
                        }`
                      ), // Ensure string type
                      trend: getTrend(
                        clientComparativeStatisticsMonthly?.revenuePercentage ||
                          "0"
                      ), // Ensure string type
                    }}
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
                      ), // Ensure string type
                      trend: getTrend(
                        clientComparativeStatistics?.revenuePercentage || "0"
                      ), // Ensure string type
                    }}
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
                    userRole="agent" // Pass the user role
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TopBrandsSold
                    topBrandsData={topBrandsData}
                    brandColors={brandColors}
                    isMobile={isMobile}
                    userRole="agent" // Pass the user role
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3, borderRadius: "8px" }}
              >
                {t("agentDashboard.viewMore")}
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
                {details && "name" in details ? (
                  t("agentDashboard.yourStatistics")
                ) : (
                  <Skeleton width="40%" />
                )}
              </Typography>

              <Divider sx={{ my: 2, borderRadius: "12px" }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {details && "clients" in details ? (
                    <TotalEarning
                      totalEarning={totalRevenue}
                      isLoading={!details}
                    />
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: "12px" }}
                      aria-label="skeleton"
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {details && "clients" in details ? (
                    <TotalOrder
                      totalOrder={totalOrders}
                      isLoading={!details}
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
                      aria-label="skeleton"
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {details && "clients" in details ? (
                    <MonthOverMonthSpendingTrend
                      months={months}
                      revenueData={revenueData}
                      userRole="agent" // Pass the user role
                    />
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={300}
                      sx={{ borderRadius: "12px" }}
                      aria-label="skeleton"
                    />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  {details && "clients" in details ? (
                    <TopBrandsSold
                      topBrandsData={topBrandsData}
                      isMobile={isMobile}
                      brandColors={brandColors}
                      userRole="agent" // Pass the user role
                    />
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={300}
                      sx={{ borderRadius: "12px" }}
                      aria-label="skeleton"
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  {details && "clients" in details ? (
                    <SalesDistribution
                      salesDistributionDataClients={
                        salesDistributionDataClients
                      }
                    />
                  ) : (
                    <Skeleton
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
          <UpcomingVisits
            selectedClient={selectedClient}
            agentDetails={
              details && "AgentVisits" in details
                ? (details as Agent)
                : undefined
            }
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Box mb={4}>
            <Typography variant="h5" gutterBottom>
              {details && "name" in details ? (
                t("agentDashboard.calendar")
              ) : (
                <Skeleton width="30%" />
              )}
            </Typography>

            <Divider sx={{ my: 2, borderRadius: "12px" }} />
            {details && "clients" in details ? (
              <Box sx={{ maxWidth: "400px", margin: "0 auto" }}>
                <CalendarComponent />
              </Box>
            ) : (
              <Skeleton
                variant="rectangular"
                width="100%"
                height={300}
                sx={{ borderRadius: "12px" }}
                aria-label="skeleton"
              />
            )}
          </Box>
          <ActivePromotions
            selectedClient={selectedClient}
            agentDetails={
              details && "AgentPromos" in details
                ? (details as Agent)
                : undefined
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(AgentDashboard);
