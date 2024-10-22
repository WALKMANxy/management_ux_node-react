// src/components/dashboard/WelcomeMessage.tsx
import { Skeleton, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface WelcomeMessageProps {
  name?: string;
  loading: boolean;
  role: string;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  name,
  role,
  loading,
}) => {
  const { t } = useTranslation();

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

  // Split name on space and take the first word
  const displayName = name
    ? name.split(" ")[0]
    : t(`${role}Dashboard.defaultName`);

  return (
    <Typography
      variant="h4"
      sx={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 100, // Now using the lighter custom font weight

      }}
    >
      {t(`dashboard.welcomeBack`, {
        name: displayName,
      })}
    </Typography>
  );
};

export default React.memo(WelcomeMessage);
