// src/pages/admin/AdminDashboard.tsx
import { Box, Grid, Skeleton, useMediaQuery, useTheme } from "@mui/material";
import React, { Suspense, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import GlobalSearch from "../../components/Header/GlobalSearch";

import WelcomeMessage from "../../components/dashboard/WelcomeMessage";
import DrawerContainer from "../../components/dashboard/tabletCalendarContainer";

import CalendarAndVisitsView from "../../components/DashboardsViews/CalendarAndVisitsView";
import DashboardView from "../../components/DashboardsViews/DashboardView";
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
  const isTablet = useMediaQuery("(min-width:900px) and (max-width:1250px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

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
  } = useStats(isMobile);

  const user = useAppSelector(selectCurrentUser);

  const userRole = user?.role;

  const selectedAgentData = useMemo(() => {
    if (selectedAgent && salesDistributionDataAgents.agents.length > 0) {
      return salesDistributionDataAgents.agents.find(
        (agent) => agent.id === selectedAgent.id
      );
    }
    return null;
  }, [selectedAgent, salesDistributionDataAgents.agents]);

  return (
    <Box className="admin-dashboard">
      <WelcomeMessage
        name={user?.entityName}
        role="admin" // or "agent" or "client"
        loading={loadingState}
      />

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

      <Grid container spacing={6} mt={2}>
        <Grid item xs={!isTablet ? 12 : 12} md={!isTablet ? 9 : 12}>
          {selectedAgentData && selectedAgent ? (
            <Suspense>
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
            <Suspense>
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
            <DashboardView
              t={t}
              isTablet={isTablet}
              handleToggleDrawer={handleToggleDrawer}
              loadingState={loadingState}
              totalRevenue={totalRevenue}
              totalOrders={totalOrders}
              ordersData={ordersData}
              yearlyOrdersData={yearlyOrdersData}
              months={months}
              yearlyCategories={yearlyCategories}
              revenueData={revenueData}
              topBrandsData={topBrandsData}
              salesDistributionDataClients={salesDistributionDataClients}
              salesDistributionDataAgents={salesDistributionDataAgents}
              isMobile={isMobile}
              userRole={userRole!}
            />
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
    </Box>
  );
};

export default React.memo(AdminDashboard);
