// src/components/dashboard/NavigationComponent.tsx

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { handleLogout } from "../../features/auth/authThunks";

const NavigationComponent: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const initiateLogout = () => {
    dispatch(handleLogout());
  };

  // Define navigation items
  const navItems = [
    {
      label: "Calendar",
      icon: <CalendarTodayIcon sx={{ fontSize: "3rem" }} />, // Increased size by ~25%
      onClick: () => navigate("/calendar"),
      color: "#3f51b5",
      path: "/calendar",
    },
    {
      label: "Messages",
      icon: <ChatBubbleOutlineIcon sx={{ fontSize: "3rem" }} />, // Increased size by ~25%
      onClick: () => navigate("/messages"),
      color: "#25D366", // WhatsApp-like green
      path: "/messages",
    },
    {
      label: "Settings",
      icon: <SettingsIcon sx={{ fontSize: "3rem" }} />, // Increased size by ~25%
      onClick: () => navigate("/settings"),
      color: "#9e9e9e", // Gray color
      path: "/settings",
    },
    {
      label: "Logout",
      icon: <LogoutIcon sx={{ fontSize: "3rem" }} />, // Increased size by ~25%
      onClick: initiateLogout,
      color: "#f44336",
      path: "/logout",
    },
  ];

  return (
    <Paper
      elevation={4}
      sx={{
        p: 4,
        borderRadius: "16px",
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        height: "100%",
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{
          height: "100%",
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h4"}
          sx={{
            mb: 4,
            fontWeight: "700",
            color: "#333",
          }}
        >
          Quick Navigation
        </Typography>
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-around"
          alignItems="center"
          width="100%"
          gap={4}
        >
          {navItems.map((item) => (
            <Tooltip key={item.label} title={item.label} arrow>
              <IconButton
                onClick={item.onClick}
                size="large"
                sx={{
                  color: item.color,
                  transition: "transform 0.3s, color 0.3s",
                  "&:hover": {
                    transform: "scale(1.2)",
                    boxShadow: "none", // Remove shadow on hover
                    borderRadius: "50%", // Ensure border-radius remains circular if necessary
                  },
                }}
                aria-label={item.label}
              >
                {item.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default React.memo(NavigationComponent);
