import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Box, Fab, Grid, Skeleton, useMediaQuery } from "@mui/material";
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
import useLoadingData from "../../hooks/useLoadingData";

const EmployeeDashboard: React.FC = () => {
  const { t } = useTranslation();
  const isTablet = useMediaQuery("(min-width:900px) and (max-width:1390px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { loadingState } = useLoadingData();

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const user = useAppSelector(selectCurrentUser);
  const userRole = user?.role;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Box py={2}>
        {/* Welcome Message */}
        <WelcomeMessage
          name={user?.entityName}
          role={userRole || "employee"}
          loading={loading}
        />
      </Box>

      {/* FAB Button for Calendar - Positioned Top Right (Tablet Only) */}
      {isTablet &&
        (loading ? (
          <Skeleton
            animation="wave"
            variant="circular"
            width={40}
            height={40}
            sx={{
              borderRadius: "50%",
              position: "absolute",
              top: 40,
              right: 32,
              zIndex: 1000,
            }}
            aria-label={t("dashboard.loadingCalendarButton")}
          />
        ) : (
          <Fab
            color="primary"
            aria-label="calendar"
            onClick={handleToggleDrawer}
            sx={{
              position: "absolute",
              top: 80,
              right: 32,
              zIndex: 1000,
            }}
          >
            <CalendarMonthIcon />
          </Fab>
        ))}

      <Grid container spacing={6} mt={-4}>
        {/* Left Side Components */}
        <Grid item xs={!isTablet ? 12 : 12} md={!isTablet ? 9 : 12}>
          <Grid container spacing={3}>
            {/* Top Left: Clock Component */}
            <Grid item xs={6}>
              {loading ? (
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width="100%"
                  height={300} // Adjust height as needed
                  sx={{ borderRadius: "12px" }}
                  aria-label="Loading Clock"
                />
              ) : (
                <Clock />
              )}
            </Grid>

            {/* Top Right: Weather Component */}
            <Grid item xs={6}>
              {loading ? (
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width="100%"
                  height={300} // Adjust height as needed
                  sx={{ borderRadius: "12px" }}
                  aria-label="Loading Weather"
                />
              ) : (
                <Weather />
              )}
            </Grid>

            {/* Bottom Left: Whiteboard Component */}
            {userRole !== "client" && (
              <Grid item xs={6}>
                {loading ? (
                  <Skeleton
                    animation="wave"
                    variant="rectangular"
                    width="100%"
                    height={300} // Adjust height as needed
                    sx={{ borderRadius: "12px" }}
                    aria-label="Loading Whiteboard"
                  />
                ) : (
                  <Whiteboard />
                )}
              </Grid>
            )}

            {/* Bottom Right: Navigation Component */}
            <Grid item xs={6}>
              {loading ? (
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width="100%"
                  height={300} // Adjust height as needed
                  sx={{ borderRadius: "12px" }}
                  aria-label="Loading Navigation"
                />
              ) : (
                <Navigation />
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* Calendar and Upcoming Visits section */}
        {!isTablet && (
          <CalendarAndVisitsView
            loadingState={
              userRole === "employee" || userRole === "client"
                ? loading
                : loading || loadingState
            }
            t={t}
            disableUpcomingVisits
          />
        )}
      </Grid>
      {/* Drawer Container for Calendar and Upcoming Visits */}
      {isTablet && (
        <DrawerContainer
          open={drawerOpen}
          onClose={handleToggleDrawer}
          disableUpcomingVisits
        />
      )}
    </>
  );
};

export default React.memo(EmployeeDashboard);
