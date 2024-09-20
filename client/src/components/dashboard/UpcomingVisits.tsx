import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import { Timeline, timelineItemClasses } from "@mui/lab";
import { Box, IconButton, Paper, Skeleton, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectVisits } from "../../features/data/dataSelectors";
import { UpcomingVisitsProps } from "../../models/propsModels";
import { VisitItem } from "./VisitItem";

const UpcomingVisits: React.FC<UpcomingVisitsProps> = ({ isLoading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const visits = useAppSelector(selectVisits);

  // Memoize the upcoming visits computation
  const upcomingVisits = useMemo(() => {
    // Filter visits to include only those that are pending and not completed
    const filteredVisits = visits.filter(
      (visit) => visit.pending === true && visit.completed === false
    );

    // Sort the visits by date (earliest first)
    const sortedVisits = filteredVisits.sort(
      (a, b) => +new Date(a.date) - +new Date(b.date)
    );

    // Return the top 3 upcoming visits
    return sortedVisits.slice(0, 3);
  }, [visits]);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #e8f5e9 30%, #c8e6c9 100%)",
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
      <Box sx={{ position: "relative", zIndex: 1,  }}>
        <Typography variant="h5" gutterBottom>
          {t("upcomingVisits.title")}
        </Typography>
        <Box sx={{ maxHeight: 420, overflow: "auto" }}>
          {isLoading ? (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={200}
              sx={{ borderRadius: 2 }}
            />
          ) : upcomingVisits.length === 0 ? (
            <Typography variant="body1">
              {t("upcomingVisits.noProgrammedVisits")}
            </Typography>
          ) : (
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
        <IconButton
          onClick={() => navigate("/visits")}
          sx={{
            mt: 3,
            borderRadius: 2,
            position: "relative",

            backgroundColor: "gray",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#c8e6c9",
            },
          }}
        >
          <AirplaneTicketIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default UpcomingVisits;
