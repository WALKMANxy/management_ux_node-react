// src/components/clientpage/ActivePromotions.tsx

import LoyaltyIcon from "@mui/icons-material/Loyalty";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import { Box, IconButton, Typography, Tooltip } from "@mui/material";
import dayjs from "dayjs";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectPromos } from "../../features/data/dataSelectors";
import { Promo } from "../../models/dataModels";
import { useTranslation } from "react-i18next"; // Ensure useTranslation is imported

const ActivePromotions: React.FC = () => {
  const promos = useAppSelector(selectPromos);
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialize translation

  // Function to format the end date without time
  const formatEndDate = (date: Date | string) => {
    return dayjs(date).format("DD/MM/YYYY");
  };

  // Filter and sort active promotions (non-expired, limited to 5 oldest based on createdAt)
  const activePromos = promos
    .filter((promo: Promo) => dayjs(promo.endDate).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.createdAt).diff(dayjs(b.createdAt))) // Sort from oldest to newest
    .slice(0, 5); // Limit to 5 promos

  // Render Actual Promotions
  const renderPromotions = () => (
    <Timeline position="alternate">
      {activePromos.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          {t("activePromotions.noActivePromotions", "No active promotions.")}
        </Typography>
      ) : (
        activePromos.map((promo: Promo) => (
          <TimelineItem key={promo._id || promo.name}>
            <TimelineOppositeContent
              sx={{ m: "auto 0" }}
              align="right"
              variant="body2"
              color="text.secondary"
            >
              {t("activePromotions.endsAt", "Ends at")} {formatEndDate(promo.endDate)}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot color="primary">
                <LoyaltyIcon />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: "12px", px: 2 }}>
              <Typography variant="h6" component="span">
                {promo.promoType}
              </Typography>
              <Typography>{promo.discount}</Typography>
            </TimelineContent>
          </TimelineItem>
        ))
      )}
    </Timeline>
  );

  return (
    <Box
      sx={{
        pt: 4,
        bgcolor: "background.paper",
        p: 2,
        borderRadius: "12px",
        position: "relative",
        minWidth: "100%",
      }}
    >
      <Typography variant="h5" gutterBottom>
        {t("activePromotions.title", "Active Promotions")}
      </Typography>
      {renderPromotions()}
      <Tooltip title={t("activePromotions.viewAllPromotions", "View All Promotions")} arrow>
        <IconButton
          onClick={() => navigate("/promos")}
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
            borderRadius: 2,
            backgroundColor: "darkseagreen",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#c8e6c9",
            },
          }}
          aria-label={t("activePromotions.viewAllPromotions", "View All Promotions")}
        >
          <MonetizationOnIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ActivePromotions;
