// src/components/promosPage/PromoDetailsCard.tsx

import { Box, Button, Typography } from "@mui/material";
import dayjs from "dayjs";
import React from "react";
import { useAppSelector } from "../../app/hooks";
import { selectPromos } from "../../features/data/dataSelectors";
import { Promo } from "../../models/dataModels";

interface PromoDetailsCardProps {
  promoId: string;
  onEditPromo: () => void;
  onDeselectPromo: () => void;
}

const PromoDetailsCard: React.FC<PromoDetailsCardProps> = ({
  promoId,
  onEditPromo,
  onDeselectPromo,
}) => {
  const promos = useAppSelector(selectPromos);
  const promo: Promo | undefined = promos[promoId];

  if (!promo) {
    return (
      <Typography variant="body1" sx={{ p: 2 }}>
        Promo not found.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {promo.name}
      </Typography>
      <Typography variant="body1">Type: {promo.promoType}</Typography>
      <Typography variant="body1">Discount: {promo.discount}</Typography>
      <Typography variant="body1">
        Start Date: {dayjs(promo.startDate).format("DD/MM/YYYY")}
      </Typography>
      <Typography variant="body1">
        End Date: {dayjs(promo.endDate).format("DD/MM/YYYY")}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={onEditPromo}>
          Edit Promo
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onDeselectPromo}
          sx={{ ml: 2 }}
        >
          Deselect Promo
        </Button>
      </Box>
    </Box>
  );
};

export default PromoDetailsCard;
