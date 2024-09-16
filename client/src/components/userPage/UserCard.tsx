// src/components/UserPage/UserCard.tsx

import { Avatar, Box, Typography } from "@mui/material";
import React from "react";

// Custom styles for titles and subtitles
const titleFontSize = "1rem";
const subtitleFontSize = "0.75rem";
const fontFamily = "'Open Sans', sans-serif";

const infoStyles = {
  title: {
    fontFamily: fontFamily,
    color: "#4d4b5f",
    fontSize: titleFontSize,
    lineHeight: 1.2,
    fontWeight: 600,
    marginBottom: "0.5rem",
    marginRight: "0.2rem"
  },
  subtitle: {
    fontFamily: fontFamily,
    color: "#696c6f",
    fontWeight: 500,
    fontSize: subtitleFontSize,
    lineHeight: 1.4,
  },
};

// Component to display user information
interface UserCardProps {
  email: string;
  avatar?: string;
  details: {
    role?: string;
    code?: string;
    name?: string;
  };
  isNew?: boolean; // New prop to indicate if this is a new entity
}

const UserCard: React.FC<UserCardProps> = ({ email, avatar, details, isNew }) => {
  return (
    <Box
      display="flex"
      p={1.5}
      gap={2}
      bgcolor={isNew ? "#e6f7e6" : "white"} // Change color to faint green if new
      borderRadius={8}
      sx={{
        alignItems: "center",
        width: "fit-content", // Adjust width based on content
        boxShadow: isNew ? "0 2px 8px rgba(0, 128, 0, 0.2)" : "0 1px 4px rgba(0, 0, 0, 0.1)", // Optional: add a subtle shadow effect
      }}
    >
      {/* User Avatar */}
      <Avatar
        src={avatar || "/default-avatar.png"} // Use user's avatar or fallback to default
        sx={{ borderRadius: 3, width: 48, height: 48 }}
      />

      {/* User Info */}
      <Box sx={{ flex: "auto" }}>
        <Typography sx={infoStyles.title}>{email}</Typography>
        <Typography sx={infoStyles.subtitle}>
          Role: {details.role || "None"}
        </Typography>
        <Typography sx={infoStyles.subtitle}>
          Code: {details.code || "None"}
        </Typography>
        <Typography sx={infoStyles.subtitle}>
          Name: {details.name || "None"}
        </Typography>
      </Box>
    </Box>
  );
};

export default UserCard;
