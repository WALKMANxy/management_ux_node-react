// src/components/dashboard/WelcomeMessage.tsx
import { Skeleton, Typography, useMediaQuery } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface SearchTitleProps {
  name?: string;
  loading: boolean;
  role: string;
}

const SearchTitle: React.FC<SearchTitleProps> = ({ role, loading }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:600px)");

  if (loading) {
    return (
      <Skeleton
        animation="wave"
        variant="text"
        width="50%"
        height={30}
        sx={{ borderRadius: "4px" }}
        aria-label="loading-welcome"
      />
    );
  }

  // Determine the translation key based on the role
  const getTitleKey = () => {
    if (role === "agent") {
      return t("dashboard.SearchTitleAgent", "Search for clients");
    }
    if (role === "admin") {
      return t("dashboard.SearchTitleAdmin", "Search for clients or agents");
    }
    return "";
  };

  return (
    <Typography
      variant={isMobile ? "h5" : "h4"}
      sx={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 100, // Using the lighter custom font weight
        fontSize: isMobile ? "1.7rem" : null,
      }}
    >
      {t(getTitleKey())}
    </Typography>
  );
};

export default React.memo(SearchTitle);
