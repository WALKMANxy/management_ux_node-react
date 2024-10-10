import { Box, Grid, Skeleton, useMediaQuery, useTheme } from "@mui/material";
import React, { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import DrawerContainer from "../../components/dashboard/tabletCalendarContainer";
import WelcomeMessage from "../../components/dashboard/WelcomeMessage";
import CalendarAndVisitsView from "../../components/DashboardsViews/CalendarAndVisitsView";
import DashboardView from "../../components/DashboardsViews/DashboardView";
import GlobalSearch from "../../components/Header/GlobalSearch";
import { selectCurrentUser } from "../../features/users/userSlice";
import useLoadingData from "../../hooks/useLoadingData";
import useSelectionState from "../../hooks/useSelectionState";
import useStats from "../../hooks/useStats";
import { calculateMonthlyData } from "../../utils/dataUtils";
import SkeletonView from "../../components/DashboardsViews/SkeletonView";

const ClientView = React.lazy(
  () => import("../../components/DashboardsViews/ClientView")
);

const AgentDashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery("(min-width:900px) and (max-width:1250px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const user = useAppSelector(selectCurrentUser);

  const userRole = user?.role;

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
      <WelcomeMessage
        name={user?.entityName}
        role="admin" // or "agent" or "client"
        loading={loadingState}
      />
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
      <Grid container spacing={6} mt={isMobile? 0 :2}>
      <Grid item xs={!isTablet ? 12 : 12} md={!isTablet ? 9 : 12}>
          {selectedClient ? (
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

export default React.memo(AgentDashboard);
