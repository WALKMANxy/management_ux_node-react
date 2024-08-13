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
import { selectVisits } from "../../features/visits/visitsSlice";
import { UpcomingVisitsProps } from "../../models/propsModels";
import { Visit } from "../../models/dataModels";

const UpcomingVisits: React.FC<UpcomingVisitsProps> = ({ isLoading }) => {
  const { t } = useTranslation();
  const visits = useSelector(selectVisits);

  const renderVisitList = () => {
    if (visits.length === 0) {
      return (
        <Typography variant="body1">
          {t("upcomingVisits.noProgrammedVisits")}
        </Typography>
      );
    }

    return (
      <List>
        {visits.map((visit: Visit) => (
          <ListItem key={visit.id}>
            <ListItemText
              primary={t("upcomingVisits.visitDetails", {
                type: visit.type,
                reason: visit.reason,
              })}
              secondary={t("upcomingVisits.visitDate", {
                date: visit.date,
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
