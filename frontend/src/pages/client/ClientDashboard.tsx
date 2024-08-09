import {
  Box,
  Grid,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import ActivePromotions from "../../components/dashboard/ActivePromotions";
import CalendarComponent from "../../components/dashboard/CalendarComponent";
import SpentThisMonth from "../../components/dashboard/SpentThisMonth";
import SpentThisYear from "../../components/dashboard/SpentThisYear";
import TopArticleType from "../../components/dashboard/TopArticleType";
import UpcomingVisits from "../../components/dashboard/UpcomingVisits";
import MonthOverMonthSpendingTrend from "../../components/statistics/charts/MonthOverMonthSpendingTrend";
import TopBrandsSold from "../../components/statistics/charts/TopBrandSold";
import { setVisits } from "../../features/calendar/calendarSlice";
import useStats from "../../hooks/useStats"; // Use the new unified hook
import { brandColors } from "../../utils/constants";

const ClientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  useEffect(() => {
    if (clientDetails && "visits" in clientDetails) {
      dispatch(setVisits(clientDetails.visits));
    }
  }, [clientDetails, dispatch]);

  return (
    <Box
      className="client-dashboard"
      sx={{ p: isMobile ? 0 : 4, bgcolor: "#f4f5f7" }}
    >
      <Typography variant="h4" gutterBottom>
        {clientDetails && "name" in clientDetails ? (
          <>{t("clientDashboard.welcomeBack", { name: clientDetails.name })}</>
        ) : (
          <Skeleton width="30%" />
        )}
      </Typography>
      <Grid container spacing={6} mt={2}>
        <Grid item xs={12} md={9}>
          <Box mb={4}>
            <Typography variant="h5" gutterBottom>
              {t("clientDashboard.yourStatistics")}
            </Typography>

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
                {clientDetails ? (
                  <MonthOverMonthSpendingTrend
                    months={months}
                    revenueData={revenueData}
                    userRole="client" // Pass the user role
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
                {clientDetails ? (
                  <TopBrandsSold
                    topBrandsData={topBrandsData}
                    brandColors={brandColors}
                    isMobile={isMobile}
                    userRole="client" // Pass the user role
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
            {clientDetails && "visits" in clientDetails && (
              <UpcomingVisits
                isLoading={isLoading} // Update this line
              />
            )}
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <Box mb={4}>
            <Typography variant="h5" gutterBottom>
              {t("clientDashboard.calendar")}
            </Typography>

            <Box sx={{ maxWidth: "400px", margin: "0 auto" }}>
              {clientDetails ? (
                <CalendarComponent />
              ) : (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={300}
                  sx={{ borderRadius: "12px" }}
                />
              )}
            </Box>
          </Box>
          {clientDetails && "promos" in clientDetails && (
            <ActivePromotions
              isLoading={isLoading} // Update this line
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default React.memo(ClientDashboard);
