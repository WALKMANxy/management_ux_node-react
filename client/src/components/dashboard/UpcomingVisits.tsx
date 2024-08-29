import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  selectVisits,
  VisitWithAgent,
} from "../../features/utility/utilitySlice"; // Updated import
import { UpcomingVisitsProps } from "../../models/propsModels";

const UpcomingVisits: React.FC<UpcomingVisitsProps> = ({ isLoading }) => {
  const { t } = useTranslation();
  const visits = useSelector(selectVisits);

  const getUpcomingVisits = () => {
    // Filter visits to include only those that are pending and not completed
    const filteredVisits = visits.filter(
      (visit) => visit.pending && !visit.completed
    );

    // Sort the visits by date (earliest first)
    const sortedVisits = filteredVisits.sort(
      (a, b) => +new Date(a.date) - +new Date(b.date)
    );

    // Return the top 3 upcoming visits
    return sortedVisits.slice(0, 3);
  };

  const renderVisitList = () => {
    const upcomingVisits = getUpcomingVisits();

    if (upcomingVisits.length === 0) {
      return (
        <Typography variant="body1">
          {t("upcomingVisits.noProgrammedVisits")}
        </Typography>
      );
    }

    return (
      <List>
        {upcomingVisits.map((visit: VisitWithAgent) => (
          <ListItem key={visit.id}>
            <ListItemText
              primary={t("upcomingVisits.visitDetails", {
                type: visit.type,
                reason: visit.reason,
                clientId: visit.clientId,
                agentName: visit.agentName,
              })}
              secondary={t("upcomingVisits.visitDate", {
                date: visit.date.toLocaleDateString(),
                pending: visit.pending ? t("common.yes") : t("common.no"),
              })}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        {t("upcomingVisits.title")}
      </Typography>
      <Box sx={{ maxHeight: 200, overflow: "auto" }}>
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={200}
            sx={{ borderRadius: 2 }}
          />
        ) : (
          renderVisitList()
        )}
      </Box>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3, borderRadius: 2 }}
      >
        {t("upcomingVisits.planVisit")}
      </Button>
    </Box>
  );
};

export default UpcomingVisits;
