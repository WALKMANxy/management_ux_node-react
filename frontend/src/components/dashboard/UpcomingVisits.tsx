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
import { UpcomingVisitsProps } from "../../models/models";
import { useSelector } from "react-redux";
import { selectVisits } from "../../features/visits/visitsSlice";

const UpcomingVisits: React.FC<UpcomingVisitsProps> = ({ isLoading }) => {
  const { t } = useTranslation();
  const visits = useSelector(selectVisits);

  // Debugging output
  //console.log("Visits: ", visits);

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        {t("upcomingVisits.title")}
      </Typography>
      <Box sx={{ maxHeight: "200px", overflow: "auto" }}>
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={200}
            sx={{ borderRadius: "12px" }}
          />
        ) : visits.length > 0 ? (
          <List>
            {visits.map((visit) => (
              <ListItem key={visit.id}>
                <ListItemText primary={`${visit.note} on ${visit.date}`} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1">
            {t('upcomingVisits.noProgrammedVisits')}
          </Typography>
        )}
      </Box>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3, borderRadius: "8px" }}
      >
        {t("upcomingVisits.planVisit")}
      </Button>
    </Box>
  );
};

export default UpcomingVisits;
