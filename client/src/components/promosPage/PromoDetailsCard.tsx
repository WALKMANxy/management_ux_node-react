// src/components/promosPage/PromoDetailsCard.tsx

import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import { selectUserRole } from "../../features/auth/authSlice";
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
    marginBottom: "1rem",
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

const PromoDetailsCard: React.FC<PromoDetailsCardProps> = React.memo(
  ({ onEditPromo, onDeselectPromo, onTerminatePromo }) => {
    const { selectedPromo } = usePromos(); // Get selectedPromo from the hook
    const { t } = useTranslation();

    const userRole = useAppSelector(selectUserRole);

    const users = useAppSelector((state) => state.users.users);
    const promoIssuedByName: string | undefined =
      selectedPromo?.promoIssuedBy !== undefined
        ? users[selectedPromo.promoIssuedBy]?.entityName
        : undefined;

    // Memoize styles to avoid recreating them on every render
    const boxStyles = useMemo(
      () => ({
        display: "flex",
        flexDirection: "column" as const,
        p: 2,
        m: 2,
        gap: 1.5,
        bgcolor: "white",
        borderRadius: 4,
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
        width: "auto", // Full width to ensure responsiveness
        position: "relative" as const,
        "@media (min-width: 600px)": {
          flexDirection: "row", // Stack horizontally on larger screens
        },
      }),
      []
    );

    // Memoize button styles
    const buttonStyles = useMemo(
      () => ({
        backgroundColor: "primary.main",
        color: "white",
        "&:hover": { backgroundColor: "primary.dark" },
        borderRadius: "50%",
        width: 48,
        height: 48,
        transition: "transform 0.2s",
        "&:active": {
          transform: "scale(0.95)",
        },
      }),
      []
    );

    // Memoize outlined button styles
    const outlinedButtonStyles = useMemo(
      () => ({
        backgroundColor: "secondary.main",
        color: "white",
        "&:hover": {
          backgroundColor: "secondary.dark",
        },
        borderRadius: "50%",
        width: 48,
        height: 48,
        transition: "transform 0.2s",
        "&:active": {
          transform: "scale(0.95)",
        },
      }),
      []
    );

    // Memoize error button styles
    const errorButtonStyles = useMemo(
      () => ({
        backgroundColor: "error.main",
        color: "white",
        "&:hover": {
          backgroundColor: "error.dark",
        },
        borderRadius: "50%",
        width: 48,
        height: 48,
        transition: "transform 0.2s",
        "&:active": {
          transform: "scale(0.95)",
        },
      }),
      []
    );

    if (!selectedPromo) {
      return (
        <Typography variant="body1" sx={{ p: 2 }}>
          {t("promoDetails.notFound", "Promo details not found.")}
        </Typography>
      );
    }

    return (
      <Box sx={boxStyles}>
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

          {/* Action Buttons */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
            }}
          >
            <React.Fragment>
              {userRole === "admin" && (
                <Tooltip title={t("promo.editTooltip", "Edit Promo")}>
                  <IconButton
                    onClick={onEditPromo}
                    sx={buttonStyles}
                    aria-label={t("promo.edit", "Edit Promo")}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}

              {userRole === "admin" && (
                <Tooltip title={t("promo.terminateTooltip", "Terminate Promo")}>
                  <IconButton
                    onClick={onTerminatePromo}
                    sx={outlinedButtonStyles}
                    aria-label={t("promo.terminate", "Terminate Promo")}
                  >
                    <HourglassEmptyIcon />
                  </IconButton>
                </Tooltip>
              )}

              {/* Allow all roles to access the Deselect button */}
              <Tooltip title={t("promo.deselectTooltip", "Deselect Promo")}>
                <IconButton
                  onClick={onDeselectPromo}
                  sx={errorButtonStyles}
                  aria-label={t("promo.deselect", "Deselect Promo")}
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </React.Fragment>
          </Box>
        </Box>
      </Box>
    );
  }
);

export default PromoDetailsCard;
