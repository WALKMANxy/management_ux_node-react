// src/components/UpcomingVisits.tsx

import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import { Timeline, timelineItemClasses } from "@mui/lab";
import { Box, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectVisits } from "../../features/promoVisits/promoVisitsSelectors";
import { VisitItem } from "./VisitItem";

const UpcomingVisits: React.FC = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const visits = useAppSelector(selectVisits);

  const now = useMemo(() => new Date(), []);
  const upcomingVisits = useMemo(() => {
    // Filter visits to include only those that are pending and not completed
    const filteredVisits = visits.filter(
      (visit) =>
        visit.pending === true &&
        visit.completed === false &&
        new Date(visit.date) >= now
    );

    // Sort the visits by date (earliest first)
    const sortedVisits = filteredVisits.sort(
      (a, b) => +new Date(a.date) - +new Date(b.date)
    );

    // Return the top 3 upcoming visits
    return sortedVisits.slice(0, 3);
  }, [visits, now]);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: "12px",
        background: "linear-gradient(135deg, #e8f5e9 30%, #c8e6c9 100%)",
        color: "#000",
        position: "relative",
        overflow: "hidden",
        height: "auto",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundImage: `url('/funky-lines.png')`,
          backgroundSize: "cover",
          opacity: 0.1,
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Title */}
        <Typography variant="h5" gutterBottom sx={{ wordBreak: "break-word" }}>
          {t("upcomingVisits.title", "Upcoming Visits")}
        </Typography>

        {/* Content Area */}
        <Box sx={{ maxHeight: 420, overflow: "auto" }}>
          {upcomingVisits.length === 0 ? (
            // No Upcoming Visits
            <Typography variant="body1">
              {t(
                "upcomingVisits.noProgrammedVisits",
                "No upcoming visits scheduled."
              )}
            </Typography>
          ) : (
            // Display Upcoming Visits
            <Timeline
              position="left"
              sx={{
                m: 0,
                mt: 2,
                mb: 2,
                p: 0,
                [`& .${timelineItemClasses.root}:before`]: {
                  flex: 0,
                  padding: 0,
                },
              }}
            >
              {upcomingVisits.map((visit, index) => (
                <VisitItem
                  key={visit._id}
                  visit={visit}
                  lastTimeline={index === upcomingVisits.length - 1}
                />
              ))}
            </Timeline>
          )}
        </Box>

        {/* Navigate to All Visits */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Tooltip
            title={t("upcomingVisits.viewAllVisits", "View All Visits")}
            arrow
          >
            <IconButton
              onClick={() => navigate("/visits")}
              sx={{
                mt: 3,
                borderRadius: 2,
                backgroundColor: (theme) => theme.palette.grey[700],
                color: "#fff",
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.grey[500],
                },
              }}
              aria-label={t("upcomingVisits.viewAllVisits", "View All Visits")}
            >
              <AirplaneTicketIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

export default UpcomingVisits;
