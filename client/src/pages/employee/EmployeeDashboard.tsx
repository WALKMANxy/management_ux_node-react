import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Box, Fab, Grid, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import DrawerContainer from "../../components/dashboard/tabletCalendarContainer";
import WelcomeMessage from "../../components/dashboard/WelcomeMessage";
import CalendarAndVisitsView from "../../components/DashboardsViews/CalendarAndVisitsView";
import Clock from "../../components/employeeDashboard/Clock";
import Navigation from "../../components/employeeDashboard/Navigation";
import Weather from "../../components/employeeDashboard/Weather";
import Whiteboard from "../../components/employeeDashboard/Whiteboard";
import { selectCurrentUser } from "../../features/users/userSlice";

const EmployeeDashboard: React.FC = () => {
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

  const [loadingState, setLoadingState] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoadingState(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      className="employee-dashboard"
      sx={{ p: isMobile ? 2 : 4, bgcolor: "#f4f5f7", position: "relative" }}
    >
      {/* Welcome Message */}
      <WelcomeMessage
        name={user?.entityName}
        role={userRole || "employee"}
        loading={loadingState}
      />

      {/* FAB Button for Calendar - Positioned Top Right (Tablet Only) */}
      {isTablet && (
        <Fab
          color="primary"
          aria-label="calendar"
          onClick={handleToggleDrawer}
          sx={{
            position: "absolute",
            top: 40,
            right: 32,
            zIndex: 1000,
          }}
        >
          <CalendarMonthIcon />
        </Fab>
      )}

      <Grid container spacing={6} mt={2}>
        {/* Left Side Components */}
        <Grid item xs={!isTablet ? 12 : 0} md={!isTablet ? 9 : 0}>
          <Grid container spacing={3}>
            {/* Top Left: Clock Component */}
            <Grid item xs={6}>
              <Clock />
            </Grid>

            {/* Top Right: Weather Component */}
            <Grid item xs={6}>
              <Weather />
            </Grid>

            {/* Bottom Left: Whiteboard Component */}
            <Grid item xs={6}>
              <Whiteboard />
            </Grid>

            {/* Bottom Right: Navigation Component */}
            <Grid item xs={6}>
              <Navigation />
            </Grid>
          </Grid>
        </Grid>

        {/* Calendar and Upcoming Visits section */}
        {!isTablet && (
          <CalendarAndVisitsView loadingState={loadingState} t={t} disableUpcomingVisits />
        )}
      </Grid>
      {/* Drawer Container for Calendar and Upcoming Visits */}
      {isTablet && (
        <DrawerContainer open={drawerOpen} onClose={handleToggleDrawer} disableUpcomingVisits />
      )}
    </Box>
  );
};

export default React.memo(EmployeeDashboard);
