// src/components/promosPage/PromoListItem.tsx
import {
  Avatar,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Promo } from "../../models/dataModels";

interface PromoListItemProps {
  promo: Promo;
  isSelected: boolean;
  onSelect: (promo: Promo) => void;
  isActive: boolean;
}

const PromoListItem: React.FC<PromoListItemProps> = ({
  promo,
  isSelected,
  onSelect,
  isActive,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <ListItem
        button
        selected={isSelected}
        onClick={() => onSelect(promo)}
        sx={{
          display: "flex",
          alignItems: "center",
          bgcolor: isActive
            ? "rgba(144, 238, 144, 0.05)"
            : "rgba(255, 165, 0, 0.05)",
          "&:hover": {
            bgcolor: isActive
              ? "rgba(144, 238, 144, 0.2)"
              : "rgba(255, 165, 0, 0.2)",
          },
          borderRadius: "12px",
          mb: 1,
        }}
      >
        <ListItemAvatar>
          <Avatar>{promo.name.charAt(0).toUpperCase()}</Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={promo.name}
          secondary={`${t("promosSidebar.type", "Type")}: ${promo.promoType}`}
        />
      </ListItem>
      <Divider />
    </>
  );
};

export default React.memo(PromoListItem);
