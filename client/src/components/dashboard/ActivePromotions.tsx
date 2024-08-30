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
import { selectPromos } from "../../features/utility/utilitySelectors"; // Updated import
import { ActivePromotionsProps } from "../../models/propsModels";

const ActivePromotions: React.FC<ActivePromotionsProps> = ({ isLoading }) => {
  const { t } = useTranslation();
  const promos = useSelector(selectPromos); // Using the updated selector

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t("promotions.activePromotions")}
      </Typography>
      <Box sx={{ maxHeight: "200px", overflow: "auto" }}>
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={200}
            sx={{ borderRadius: "12px" }}
          />
        ) : promos.length > 0 ? (
          <List>
            {promos.map((promo) => (
              <ListItem key={promo.id}>
                <ListItemText primary={promo.name} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1">
            {t("promotions.noActivePromotions")}
          </Typography>
        )}
      </Box>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3, borderRadius: "8px" }}
      >
        {t("promotions.viewMore")}
      </Button>
    </Box>
  );
};

export default ActivePromotions;
