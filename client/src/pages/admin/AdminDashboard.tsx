// src/pages/admin/AdminDashboard.tsx
import { Box, Grid, Skeleton, useMediaQuery, useTheme } from "@mui/material";
import React, { Suspense, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import CalendarAndVisitsView from "../../components/DashboardsViews/CalendarAndVisitsView";
import DashboardView from "../../components/DashboardsViews/DashboardView";
import SkeletonView from "../../components/DashboardsViews/SkeletonView";
import GlobalSearch from "../../components/Header/GlobalSearch";
import SearchTitle from "../../components/dashboard/SearchTitle";
import DrawerContainer from "../../components/dashboard/tabletCalendarContainer";
import { selectCurrentUser } from "../../features/users/userSlice";
import useLoadingData from "../../hooks/useLoadingData";
import useSelectionState from "../../hooks/useSelectionState";
import useStats from "../../hooks/useStats";
import { calculateMonthlyData } from "../../utils/dataUtils";

const AgentView = React.lazy(
  () => import("../../components/DashboardsViews/AgentView")
);
const ClientView = React.lazy(
  () => import("../../components/DashboardsViews/ClientView")
);

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery("(min-width:900px) and (max-width:1390px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleToggleDrawer = useCallback(() => {
    setDrawerOpen((prevOpen) => !prevOpen);
  }, []);
  const { loadingState } = useLoadingData();

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
    totalNetRevenue,
    netRevenueData,
  } = useStats(isMobile);

  const user = useAppSelector(selectCurrentUser);

  const userRole = user?.role;

  // Optimized Implementation
  const selectedAgentData = useMemo(() => {
    if (!selectedAgent) return null;
    return (
      salesDistributionDataAgents.agents.find(
        (agent) => agent.id === selectedAgent.id
      ) || null
    );
  }, [selectedAgent, salesDistributionDataAgents.agents]);

  // Example: Memoizing Props for DashboardView
  const dashboardViewProps = useMemo(
    () => ({
      t,
      isTablet,
      handleToggleDrawer,
      loadingState,
      totalRevenue,
      totalOrders,
      ordersData,
      yearlyOrdersData,
      months,
      yearlyCategories,
      revenueData,
      topBrandsData,
      salesDistributionDataClients,
      salesDistributionDataAgents,
      isMobile,
      userRole: userRole!,
      totalNetRevenue,
      netRevenueData,
    }),
    [
      t,
      isTablet,
      handleToggleDrawer,
      loadingState,
      totalRevenue,
      totalOrders,
      ordersData,
      yearlyOrdersData,
      months,
      yearlyCategories,
      revenueData,
      topBrandsData,
      salesDistributionDataClients,
      salesDistributionDataAgents,
      isMobile,
      userRole,
      totalNetRevenue,
      netRevenueData,
    ]
  );

  return (
    <>
      <Box py={1}>
        <SearchTitle
          name={user?.entityName}
          role={userRole!} // or "agent" or "client"
          loading={loadingState}
        />
      </Box>

      {loadingState ? (
        <Skeleton
          animation="wave"
          variant="rectangular"
          width="100%"
          height={50}
          sx={{ borderRadius: "12px" }}
          aria-label={t("adminDashboard.skeleton")}
        />
      ) : (
        <GlobalSearch filter="admin" onSelect={handleSelect} />
      )}

      <Grid container spacing={6} mt={isMobile ? -3 : -3}>
        <Grid item xs={!isTablet ? 12 : 12} md={!isTablet ? 9 : 12}>
          {selectedAgentData && selectedAgent ? (
            <Suspense fallback={<SkeletonView />}>
              <AgentView
                selectedAgentData={selectedAgentData}
                handleToggleDrawer={handleToggleDrawer}
                clearSelection={clearSelection}
                calculateTotalSpentThisMonth={calculateTotalSpentThisMonth}
                calculateTotalSpentThisYearForAgents={
                  calculateTotalSpentThisYearForAgents
                }
                calculateTopArticleType={calculateTopArticleType}
                calculateMonthlyData={calculateMonthlyData}
                agentComparativeStatisticsMonthly={
                  agentComparativeStatisticsMonthly
                }
                agentComparativeStatistics={agentComparativeStatistics}
                salesDistributionDataAgents={salesDistributionDataAgents}
                loadingState={loadingState}
              />
            </Suspense>
          ) : selectedClient ? (
            <Suspense fallback={<SkeletonView />}>
              <ClientView
                loadingState={loadingState}
                selectedClient={selectedClient}
                handleToggleDrawer={handleToggleDrawer}
                clearSelection={clearSelection}
                calculateTotalSpentThisMonth={calculateTotalSpentThisMonth}
                calculateTotalSpentThisYear={calculateTotalSpentThisYear}
                calculateTopArticleType={calculateTopArticleType}
                calculateMonthlyData={calculateMonthlyData}
                topBrandsData={topBrandsData}
                clientComparativeStatisticsMonthly={
                  clientComparativeStatisticsMonthly
                }
                clientComparativeStatistics={clientComparativeStatistics}
                userRole={userRole}
              />
            </Suspense>
          ) : (
            <DashboardView {...dashboardViewProps} />
          )}
        </Grid>
        {/* Calendar and Upcoming Visits section */}
        {!isTablet && (
          <CalendarAndVisitsView loadingState={loadingState} t={t} />
        )}
      </Grid>

      {/* Drawer Container for Calendar and Upcoming Visits */}
      {isTablet && (
        <DrawerContainer open={drawerOpen} onClose={handleToggleDrawer} />
      )}
    </>
  );
};

export default React.memo(AdminDashboard);
