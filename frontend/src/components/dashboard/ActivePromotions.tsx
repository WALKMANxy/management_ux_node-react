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

const ActivePromotions: React.FC<ActivePromotionsProps> = ({ getPromos }) => {
  const { t } = useTranslation();
  const promos = getPromos();

  // Debugging output
  console.log("Promos: ", promos);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {promos.length > 0 ? (
          t('promotions.activePromotions')
        ) : (
          <Skeleton width="50%" />
        )}
      </Typography>
      <Box sx={{ maxHeight: "200px", overflow: "auto" }}>
        {promos.length > 0 ? (
          <List>
            {promos.map((promo) => (
              <ListItem key={promo.id}>
                <ListItemText primary={promo.name} />
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
        {t('promotions.viewMore')}
      </Button>
    </Box>
  );
};

export default ActivePromotions;
