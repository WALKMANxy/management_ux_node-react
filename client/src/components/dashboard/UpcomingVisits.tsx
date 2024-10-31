//src/components/dashboard/UpcomingVisits.tsx
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@mui/lab";
import {
  Box,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectVisits } from "../../features/promoVisits/promoVisitsSelectors";
import useStats from "../../hooks/useStats";
import { VisitItem } from "./VisitItem";

const UpcomingVisits: React.FC = () => {
  const { t } = useTranslation();

  const isMobile = useMediaQuery("(max-width:600px)");

  const { selectedClient } = useStats(isMobile);

  const navigate = useNavigate();
  const visits = useAppSelector(selectVisits);

  const now = useMemo(() => new Date(), []);

  const upcomingVisits = useMemo(() => {
    return visits
      .filter((visit) => {
        const isPendingAndUpcoming =
          visit.pending === true &&
          visit.completed === false &&
          new Date(visit.date) >= now;

        // Filter by selectedClient if it exists, otherwise include all clients
        const isForSelectedClient = selectedClient
          ? visit.clientId === selectedClient.id
          : true;

        return isPendingAndUpcoming && isForSelectedClient;
      })
      .sort((a, b) => +new Date(a.date) - +new Date(b.date)) // Sort by date ascending
      .slice(0, 3); // Limit to top 3 upcoming visits
  }, [visits, now, selectedClient]);

  // Define the renderVisits constant inspired by renderPromotions syntax
  const renderVisits = () => (
    <Timeline position="left">
      {upcomingVisits.length === 0 ? (
        // No Upcoming Visits
        <TimelineItem>
          <TimelineSeparator>
            <TimelineDot color="grey" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="body1" color="text.secondary">
              {t(
                "upcomingVisits.noProgrammedVisits",
                "No upcoming visits scheduled."
              )}
            </Typography>
          </TimelineContent>
        </TimelineItem>
      ) : (
        // Display Upcoming Visits
        upcomingVisits.map((visit, index) => (
          <VisitItem
            key={visit._id}
            visit={visit}
            lastTimeline={index === upcomingVisits.length - 1}
          />
        ))
      )}
    </Timeline>
  );

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
        <Box sx={{ maxHeight: 420, overflow: "auto" }}>{renderVisits()}</Box>

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
