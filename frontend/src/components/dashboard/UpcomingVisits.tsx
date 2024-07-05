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

const UpcomingVisits: React.FC<UpcomingVisitsProps> = ({
  selectedClient,
  agentDetails,
}) => {
  const { t } = useTranslation();

  const visits = selectedClient
    ? selectedClient.visits
    : agentDetails?.clients.flatMap((client) => client.visits);

  return (
    <Box mb={4}>
      <Typography variant="h5" gutterBottom>
        {selectedClient ? (
          t("upcomingVisits.titleForClient", { clientName: selectedClient.name })
        ) : agentDetails ? (
          t("upcomingVisits.titleForAgent")
        ) : (
          <Skeleton width="50%" />
        )}
      </Typography>
      <Box sx={{ maxHeight: "200px", overflow: "auto" }}>
        {agentDetails ? (
          <List>
            {visits ? (
              visits.map((visit, index) => (
                <ListItem key={index}>
                  <ListItemText primary={`${visit.note} on ${visit.date}`} />
                </ListItem>
              ))
            ) : (
              <>
                <ListItem>
                  <ListItemText primary={t("upcomingVisits.visitPlaceholder1")} />
                </ListItem>
                <ListItem>
                  <ListItemText primary={t("upcomingVisits.visitPlaceholder2")} />
                </ListItem>
                <ListItem>
                  <ListItemText primary={t("upcomingVisits.visitPlaceholder3")} />
                </ListItem>
              </>
            )}
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
