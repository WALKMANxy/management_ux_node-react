// src/components/promosPage/PromoDetailsCard.tsx

import { Avatar, Box, Button, Divider, Typography } from "@mui/material";
import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import usePromos from "../../hooks/usePromos";

interface PromoDetailsCardProps {
  onEditPromo: () => void;
  onDeselectPromo: () => void;
  onTerminatePromo: () => void;
}

const infoStyles = {
  title: {
    fontFamily: "'Open Sans', sans-serif",
    color: "#4d4b5f",
    fontSize: "1.25rem",
    lineHeight: 1.2,
    fontWeight: 600,
    marginBottom: "0.5rem",
    marginRight: "0.2rem",
  },
  subtitle: {
    fontFamily: "'Open Sans', sans-serif",
    color: "#696c6f",
    fontWeight: 500,
    fontSize: "0.9rem",
    lineHeight: 1.4,
    wordBreak: "break-word", // Ensures long text wraps appropriately
  },
};

const PromoDetailsCard: React.FC<PromoDetailsCardProps> = ({
  onEditPromo,
  onDeselectPromo,
  onTerminatePromo,
}) => {
  const { selectedPromo } = usePromos(); // Get selectedPromo from the hook
  const { t } = useTranslation();

  const users = useAppSelector((state) => state.users.users);
  const promoIssuedByName: string | undefined =
    selectedPromo?.promoIssuedBy !== undefined
      ? users[selectedPromo.promoIssuedBy]?.entityName
      : undefined;

  if (!selectedPromo) {
    return (
      <Typography variant="body1" sx={{ p: 2 }}>
        {t("promoDetails.notFound")}
      </Typography>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      p={2}
      m={2}
      gap={1.5}
      bgcolor="white"
      borderRadius={4}
      sx={{
        width: "auto", // Full width to ensure responsiveness
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
        "@media (min-width: 600px)": {
          flexDirection: "row", // Stack horizontally on larger screens
        },
      }}
    >
      <Avatar sx={{ borderRadius: 3, width: 60, height: 60 }}>
        {selectedPromo.name.charAt(0).toUpperCase()}
      </Avatar>

      <Box sx={{ flex: "auto" }}>
        <Typography sx={infoStyles.title}>{selectedPromo.name}</Typography>
        <Typography sx={infoStyles.subtitle}>
          {t("promo.type")}: {selectedPromo.promoType}
        </Typography>
        <Divider sx={{ m: 1 }} />

        <Typography sx={infoStyles.subtitle}>
          {t("promo.discount")}: {selectedPromo.discount}
        </Typography>
        <Divider sx={{ m: 1 }} />

        <Typography sx={infoStyles.subtitle}>
          {t("promo.startDate")}:{" "}
          {dayjs(selectedPromo.startDate).format("DD/MM/YYYY")}
        </Typography>
        <Divider sx={{ m: 1 }} />

        <Typography sx={infoStyles.subtitle}>
          {t("promo.endDate")}:{" "}
          {dayjs(selectedPromo.endDate).format("DD/MM/YYYY")}
        </Typography>
        <Divider sx={{ m: 1 }} />

        <Typography sx={infoStyles.subtitle}>
          {t("promo.global")}:{" "}
          {selectedPromo.global ? t("promo.global") : t("promo.notGlobal")}
        </Typography>
        <Divider sx={{ m: 1 }} />

        <Typography sx={infoStyles.subtitle}>
          {t("promo.issuedBy")}: {promoIssuedByName}
        </Typography>
        <Divider sx={{ m: 1 }} />

        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button variant="contained" color="primary" onClick={onEditPromo}>
            {t("promo.edit")}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onTerminatePromo}
          >
            {t("promo.terminate")}
          </Button>
          <Button variant="outlined" color="error" onClick={onDeselectPromo}>
            {t("promo.deselect")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PromoDetailsCard;
