/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/dashboard/DashboardView.tsx
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Box, Divider, Fab, Grid, Skeleton, Typography } from "@mui/material";
import React from "react";

import { UserRole } from "../../models/entityModels";
import { brandColors } from "../../utils/constants";
import ActivePromotions from "../dashboard/ActivePromotions";
import TotalOrder from "../dashboard/TotalOrders";
import TotalEarning from "../dashboard/TotalRevenue";
import MonthOverMonthSpendingTrend from "../statistics/charts/MonthOverMonthSpendingTrend";
import SalesDistribution from "../statistics/charts/SalesDistribution";
import TopBrandsSold from "../statistics/charts/TopBrandSold";

interface DashboardViewProps {
  t: any;
  isTablet: boolean;
  handleToggleDrawer: () => void;
  loadingState: boolean;
  totalRevenue: number;
  totalOrders: number;
  ordersData: any;
  yearlyOrdersData: any;
  months: string[];
  yearlyCategories: string[];
  revenueData: number[];
  topBrandsData: any;
  salesDistributionDataClients: any;
  salesDistributionDataAgents?: any;
  isMobile: boolean;
  userRole: UserRole;
}

const DashboardView: React.FC<DashboardViewProps> = ({
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
}) => {
  return (
    <Box mb={4}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        {loadingState ? (
          <Skeleton
            animation="wave"
            variant="text"
            width="50%"
            height={30}
            sx={{ borderRadius: "4px" }}
            aria-label={t("dashboard.loadingStatistics")}
          />
        ) : (
          <Typography
            variant="h5"
            gutterBottom
            fontWeight={100}
          >
            {t("dashboard.yourStatistics")}
          </Typography>
        )}
        {isTablet &&
          (loadingState ? (
            <Skeleton
              animation="wave"
              variant="circular"
              width={40}
              height={40}
              sx={{ borderRadius: "50%" }}
              aria-label={t("dashboard.loadingCalendarButton")}
            />
          ) : (
            <Fab
              color="primary"
              aria-label={t("dashboard.calendarButton")}
              onClick={handleToggleDrawer}
              sx={{
                zIndex: 0,
              }}
            >
              <CalendarMonthIcon />
            </Fab>
          ))}
      </Box>

      <Divider sx={{ my: 2, borderRadius: "12px" }} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={200}
              sx={{ borderRadius: "12px" }}
              aria-label={t("dashboard.skeleton")}
            />
          ) : (
            <TotalEarning totalEarning={totalRevenue} />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={200}
              sx={{ borderRadius: "12px" }}
              aria-label={t("dashboard.skeleton")}
            />
          ) : (
            <TotalOrder
              totalOrder={totalOrders}
              monthlyOrders={ordersData}
              yearlyOrders={yearlyOrdersData}
              monthlyCategories={months}
              yearlyCategories={yearlyCategories}
            />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ borderRadius: "12px" }}
              aria-label={t("dashboard.skeleton")}
            />
          ) : (
            <MonthOverMonthSpendingTrend
              months={months}
              revenueData={revenueData}
              userRole={userRole}
            />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ borderRadius: "12px" }}
              aria-label={t("dashboard.skeleton")}
            />
          ) : (
            <TopBrandsSold
              topBrandsData={topBrandsData}
              isMobile={isMobile}
              brandColors={brandColors}
              isAgentSelected={true}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={300}
              sx={{ borderRadius: "12px" }}
              aria-label={t("dashboard.skeleton")}
            />
          ) : (
            <SalesDistribution
              salesDistributionDataClients={salesDistributionDataClients}
              {...(salesDistributionDataAgents?.data && {
                salesDistributionDataAgents: salesDistributionDataAgents.data,
              })}
            />
          )}
        </Grid>
      </Grid>
      <Box pt={2.5}>
        {loadingState ? (
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height={300}
            sx={{ borderRadius: "12px" }}
            aria-label={t("dashboard.skeleton")}
          />
        ) : (
          <ActivePromotions />
        )}
      </Box>
    </Box>
  );
};

export default DashboardView;
