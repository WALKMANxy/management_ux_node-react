// src/components/ActivePromotions.tsx
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
import { ActivePromotionsProps } from "../../models/models";

const ActivePromotions: React.FC<ActivePromotionsProps> = ({
  selectedClient,
  agentDetails,
}) => {
  const { t } = useTranslation();
  const promos = selectedClient
    ? selectedClient.promos
    : agentDetails?.clients.flatMap((client) => client.promos);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {selectedClient ? (
          `${t('promotions.activePromotionsFor')} ${selectedClient.name}`
        ) : agentDetails ? (
          t('promotions.activePromotionsWithClients')
        ) : (
          <Skeleton width="50%" />
        )}
      </Typography>
      <Box sx={{ maxHeight: "200px", overflow: "auto" }}>
        {agentDetails ? (
          <List>
            {promos ? (
              promos.map((promo, index) => (
                <ListItem key={promo.id}>
                  <ListItemText primary={promo.name} />
                </ListItem>
              ))
            ) : (
              <>
                <ListItem>
                  <ListItemText primary={t('promotions.promo1')} />
                </ListItem>
                <ListItem>
                  <ListItemText primary={t('promotions.promo2')} />
                </ListItem>
                <ListItem>
                  <ListItemText primary={t('promotions.promo3')} />
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
        {t('promotions.viewMore')}
      </Button>
    </Box>
  );
};

export default ActivePromotions;
