import { Box, Grid, Skeleton, useMediaQuery, useTheme } from "@mui/material";
import React, { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import SearchTitle from "../../components/dashboard/SearchTitle";
import DrawerContainer from "../../components/dashboard/tabletCalendarContainer";
import CalendarAndVisitsView from "../../components/DashboardsViews/CalendarAndVisitsView";
import DashboardView from "../../components/DashboardsViews/DashboardView";
import SkeletonView from "../../components/DashboardsViews/SkeletonView";
import GlobalSearch from "../../components/Header/GlobalSearch";
import { selectCurrentUser } from "../../features/users/userSlice";
import useLoadingData from "../../hooks/useLoadingData";
import useSelectionState from "../../hooks/useSelectionState";
import useStats from "../../hooks/useStats";
import { calculateMonthlyData } from "../../utils/dataUtils";

const ClientView = React.lazy(
  () => import("../../components/DashboardsViews/ClientView")
);

const AgentDashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery("(min-width:900px) and (max-width:1390px)");
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
    totalNetRevenue,
    netRevenueData,
  } = useStats(isMobile);

  return (
    <>
      <Box py={1}>
        <SearchTitle
          name={user?.entityName}
          role={userRole!} // or "agent" or "client"
          loading={loadingState}
        />
      </Box>
      {!loadingState ? (
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
      <Grid container spacing={6} mt={isMobile ? -3 : -3}>
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
              totalNetRevenue={totalNetRevenue}
              netRevenueData={netRevenueData}
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
    </>
  );
};

export default React.memo(AgentDashboard);
