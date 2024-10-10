import { Box, Grid, Skeleton, useMediaQuery, useTheme } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import ActivePromotions from "../../components/dashboard/ActivePromotions";
import DrawerContainer from "../../components/dashboard/tabletCalendarContainer";
import WelcomeMessage from "../../components/dashboard/WelcomeMessage";

import CalendarAndVisitsSection from "../../components/DashboardsViews/CalendarAndVisitsView";
import ClientView from "../../components/DashboardsViews/ClientView";
import { selectCurrentUser } from "../../features/users/userSlice";
import useLoadingData from "../../hooks/useLoadingData";
import useStats from "../../hooks/useStats"; // Use the new unified hook
import { calculateMonthlyData } from "../../utils/dataUtils";

const ClientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery("(min-width:600px) and (max-width:1250px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { loadingState } = useLoadingData();

  const user = useAppSelector(selectCurrentUser);

  const {
    details: selectedClient,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTopArticleType,
    topBrandsData,
  } = useStats(isMobile);

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box className="client-dashboard">
      <WelcomeMessage
        name={user?.entityName}
        role="admin" // or "agent" or "client"
        loading={loadingState}
      />

      <Grid container spacing={6} mt={isMobile ? 0 : 2}>
        {/* Main Content Area */}
        <Grid item xs={!isTablet ? 12 : 12} md={!isTablet ? 9 : 12}>
          {/* Render ClientView if a client is selected */}
          <ClientView
            loadingState={loadingState}
            selectedClient={selectedClient}
            handleToggleDrawer={handleToggleDrawer}
            calculateTotalSpentThisMonth={calculateTotalSpentThisMonth}
            calculateTotalSpentThisYear={calculateTotalSpentThisYear}
            calculateTopArticleType={calculateTopArticleType}
            calculateMonthlyData={calculateMonthlyData}
            topBrandsData={topBrandsData}
            userRole="client" // Pass the user role as "client"
          />

          {/* Active Promotions */}
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ borderRadius: "12px" }}
              aria-label={t("clientDashboard.skeleton")}
            />
          ) : (
            <ActivePromotions />
          )}
        </Grid>

        {/* Calendar and Upcoming Visits section */}
        {!isTablet && selectedClient && (
          <CalendarAndVisitsSection loadingState={loadingState} t={t} />
        )}
      </Grid>

      {/* Drawer Container for Calendar and Upcoming Visits */}
      {isTablet && (
        <DrawerContainer open={drawerOpen} onClose={handleToggleDrawer} />
      )}
    </Box>
  );
};

export default React.memo(ClientDashboard);
