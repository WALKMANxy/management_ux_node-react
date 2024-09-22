import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  Box,
  Fab,
  Grid,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ActivePromotions from "../../components/dashboard/ActivePromotions";
import CalendarComponent from "../../components/dashboard/CalendarComponent";
import SpentThisMonth from "../../components/dashboard/SpentThisMonth";
import SpentThisYear from "../../components/dashboard/SpentThisYear";
import DrawerContainer from "../../components/dashboard/tabletCalendarContainer";
import TopArticleType from "../../components/dashboard/TopArticleType";
import UpcomingVisits from "../../components/dashboard/UpcomingVisits";
import MonthOverMonthSpendingTrend from "../../components/statistics/charts/MonthOverMonthSpendingTrend";
import TopBrandsSold from "../../components/statistics/charts/TopBrandSold";
import useStats from "../../hooks/useStats"; // Use the new unified hook
import { brandColors } from "../../utils/constants";

const ClientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery("(min-width:600px) and (max-width:1250px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    details: clientDetails,
    calculateTotalSpentThisMonth,
    calculateTotalSpentThisYear,
    calculateTopArticleType,
    topBrandsData,
    months,
    revenueData,
    isLoading,
  } = useStats(isMobile);

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box
      className="client-dashboard"
      sx={{ p: isMobile ? 0 : 4, bgcolor: "#f4f5f7" }}
    >
      {isLoading ? (
        <Skeleton
          animation="wave"
          variant="text"
          width="50%"
          height={30}
          sx={{ borderRadius: "4px" }}
          aria-label="loading-statistics"
        />
      ) : (
        <Typography variant="h4" gutterBottom>
          {clientDetails && "name" in clientDetails ? (
            <>
              {t("clientDashboard.welcomeBack", { name: clientDetails.name })}
            </>
          ) : (
            <Skeleton animation="wave" width="30%" />
          )}
        </Typography>
      )}
      {/* FAB Button for Calendar - Positioned Top Right */}
      {isTablet && (
        <Fab
          color="primary"
          aria-label="calendar"
          onClick={handleToggleDrawer}
          sx={{
            position: "absolute",
            top: 100, // Adjust as needed based on layout
            right: 32, // Adjust as needed based on layout
            zIndex: 1000,
          }}
        >
          <CalendarMonthIcon />
        </Fab>
      )}
      <Grid container spacing={6} mt={2}>
        <Grid item xs={!isTablet ? 12 : 0} md={!isTablet ? 9 : 0}>
          <Box mb={4}>
            {isLoading ? (
              <Skeleton
                animation="wave"
                variant="text"
                width="50%"
                height={30}
                sx={{ borderRadius: "4px" }}
                aria-label="loading-statistics"
              />
            ) : (
              <Typography variant="h5" gutterBottom>
                {t("clientDashboard.yourStatistics")}
              </Typography>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                {clientDetails && "movements" in clientDetails ? (
                  <SpentThisMonth
                    amount={
                      calculateTotalSpentThisMonth(clientDetails.movements)
                        .totalRevenue
                    }
                  />
                ) : (
                  <Skeleton
                    animation="wave"
                    variant="rectangular"
                    width="100%"
                    height={200}
                    sx={{ borderRadius: "12px" }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {clientDetails && "movements" in clientDetails ? (
                  <SpentThisYear
                    amount={calculateTotalSpentThisYear(
                      clientDetails.movements
                    )}
                  />
                ) : (
                  <Skeleton
                    animation="wave"
                    variant="rectangular"
                    width="100%"
                    height={200}
                    sx={{ borderRadius: "12px" }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={4}>
                {clientDetails && "movements" in clientDetails ? (
                  <TopArticleType
                    articles={calculateTopArticleType(clientDetails.movements)}
                    isAgentSelected={false}
                  />
                ) : (
                  <Skeleton
                    animation="wave"
                    variant="rectangular"
                    width="100%"
                    height={200}
                    sx={{ borderRadius: "12px" }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {clientDetails ? (
                  <MonthOverMonthSpendingTrend
                    months={months}
                    revenueData={revenueData}
                    userRole="client" // Pass the user role
                    isAgentSelected={false}
                  />
                ) : (
                  <Skeleton
                    animation="wave"
                    variant="rectangular"
                    width="100%"
                    height={300}
                    sx={{ borderRadius: "12px" }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {clientDetails ? (
                  <TopBrandsSold
                    topBrandsData={topBrandsData}
                    brandColors={brandColors}
                    isMobile={isMobile}
                    isAgentSelected={false}
                  />
                ) : (
                  <Skeleton
                    animation="wave"
                    variant="rectangular"
                    width="100%"
                    height={300}
                    sx={{ borderRadius: "12px" }}
                  />
                )}
              </Grid>
              <Grid container item xs={12} md={6}>
                {clientDetails ? (
                  <ActivePromotions />
                ) : (
                  <Skeleton
                    animation="wave"
                    variant="rectangular"
                    width="100%"
                    height={300}
                    sx={{ borderRadius: "12px" }}
                  />
                )}
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Conditionally render CalendarComponent and UpcomingVisits based on screen size */}
        {!isTablet && (
          <Grid item xs={12} md={3}>
            <Box mb={4}>
              <Typography variant="h5" gutterBottom>
                {t("clientDashboard.calendar")}
              </Typography>

              <Box sx={{ margin: "0 auto" }}>
                {clientDetails ? (
                  <CalendarComponent />
                ) : (
                  <Skeleton
                    animation="wave"
                    variant="rectangular"
                    width="100%"
                    height={300}
                    sx={{ borderRadius: "12px" }}
                  />
                )}
              </Box>
            </Box>

            <UpcomingVisits isLoading={isLoading} />
          </Grid>
        )}
      </Grid>

      {/* Drawer with CalendarComponent and UpcomingVisits */}
      <DrawerContainer
        open={drawerOpen}
        onClose={handleToggleDrawer}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default React.memo(ClientDashboard);
