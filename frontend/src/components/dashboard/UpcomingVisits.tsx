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

const UpcomingVisits: React.FC<UpcomingVisitsProps> = ({ getVisits }) => {
  const { t } = useTranslation();
  const visits = getVisits();

  // Debugging output
  console.log("Visits: ", visits);

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        {visits.length > 0 ? (
          t("upcomingVisits.title")
        ) : (
          <Skeleton width="50%" />
        )}
      </Typography>
      <Box sx={{ maxHeight: "200px", overflow: "auto" }}>
        {visits.length > 0 ? (
          <List>
            {visits.map((visit) => (
              <ListItem key={visit.id}>
                <ListItemText primary={`${visit.note} on ${visit.date}`} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={200}
            sx={{ borderRadius: "12px" }}
          />
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
