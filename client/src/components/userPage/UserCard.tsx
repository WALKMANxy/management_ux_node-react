// src/components/UserPage/UserCard.tsx

import { Avatar, Box, Tooltip, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";

// Define styled components for better maintainability
const CardContainer = styled(Box)(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ theme, isnew }: { theme: any; isnew: boolean }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    backgroundColor: isnew
      ? "rgba(76,175,80,0.1)"
      : theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: isnew ? theme.shadows[4] : theme.shadows[1],
    width: "100%",
    maxWidth: 400,
    transition: "box-shadow 0.3s, background-color 0.3s",
  })
);

const UserInfo = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
}));

const Label = styled(Typography)(({ theme }) => ({
  fontFamily: "'Open Sans', sans-serif",
  color: theme.palette.text.secondary,
  fontSize: "0.75rem",
  fontWeight: 500,
  lineHeight: 1.4,
}));

const Value = styled(Typography)(({ theme }) => ({
  fontFamily: "'Open Sans', sans-serif",
  color: theme.palette.text.primary,
  fontSize: "1rem",
  fontWeight: 600,
  lineHeight: 1.2,
  marginBottom: theme.spacing(0.5),
}));

// Define the interface for props
interface UserCardProps {
  email: string;
  avatar?: string;
  details: {
    role?: string;
    code?: string;
    name?: string;
  };
  isNew?: boolean; // Indicates if this is a new entity
}

// Functional Component with React.memo for performance optimization
const UserCard: React.FC<UserCardProps> = React.memo(
  ({ email, avatar, details, isNew = false }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    return (
      <CardContainer
        isnew={isNew}
        theme={theme}
        sx={{ borderRadius: 6, width: "fit-content" }}
      >
        {/* User Avatar */}
        <Avatar
          src={avatar || "/default-avatar.png"} // Use user's avatar or fallback to default
          alt={t("userCard.avatarAlt", "Avatar for") + ` ${email}`}
          sx={{ borderRadius: 2, width: 56, height: 56 }}
        />

        {/* User Information */}
        <UserInfo>
          <Tooltip title={email} arrow placement="top">
            <Value>{email}</Value>
          </Tooltip>

          {/* Role */}
          <Box display="flex" alignItems="center">
            <Label>{t("userCard.role", "Role")}:</Label>
            <Typography sx={{ ml: 0.5 }}>
              {details.role || t("userCard.none", "None")}
            </Typography>
          </Box>

          {/* Entity Code */}
          <Box display="flex" alignItems="center">
            <Label>{t("userCard.code", "Code")}:</Label>
            <Typography sx={{ ml: 0.5 }}>
              {details.code || t("userCard.none", "None")}
            </Typography>
          </Box>

          {/* Entity Name */}
          <Box display="flex" alignItems="center">
            <Label>{t("userCard.name", "Name")}:</Label>
            <Typography sx={{ ml: 0.5 }}>
              {details.name || t("userCard.none", "None")}
            </Typography>
          </Box>
        </UserInfo>
      </CardContainer>
    );
  }
);

export default UserCard;
