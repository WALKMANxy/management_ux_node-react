// src/components/dashboard/CalendarAndVisitsSection.tsx
import { Box, Divider, Grid, Skeleton, Typography } from "@mui/material";
import React from "react";
import CalendarComponent from "../dashboard/CalendarComponent";
import UpcomingVisits from "../dashboard/UpcomingVisits";

interface CalendarAndVisitsSectionProps {
  loadingState: boolean;
  t: (key: string) => string;
  disableUpcomingVisits?: boolean; // New prop
}

const CalendarAndVisitsSection: React.FC<CalendarAndVisitsSectionProps> = ({
  loadingState,
  disableUpcomingVisits = false,
  t,
}) => {
  return (
    <Grid item xs={12} md={3}>
      <Box mb={4}>
        {loadingState ? (
          <Skeleton
            animation="wave"
            variant="text"
            height={30}
            sx={{ borderRadius: "4px" }}
            aria-label={t("dashboard.loadingText")}
          />
        ) : (
          <Typography
            variant="h6"
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 100,
            }}
          >
            {t("dashboard.calendar")}
          </Typography>
        )}
        <Divider sx={{ my: 1, mb: 1.5, borderRadius: "12px" }} />
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
          <Box sx={{ margin: "0 auto" }}>
            <CalendarComponent />
          </Box>
        )}
      </Box>
      {!disableUpcomingVisits && (
        <>
          {loadingState ? (
            <Skeleton
              animation="wave"
              variant="rectangular"
              width="100%"
              height={150}
              sx={{ borderRadius: "12px" }}
              aria-label={t("dashboard.skeleton")}
            />
          ) : (
            <UpcomingVisits />
          )}
        </>
      )}
    </Grid>
  );
};

export default CalendarAndVisitsSection;
