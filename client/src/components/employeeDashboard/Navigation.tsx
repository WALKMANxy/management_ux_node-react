// src/components/dashboard/NavigationComponent.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectUserRole } from "../../features/auth/authSlice";
import { handleLogout } from "../../features/auth/authThunks";

// Import Material-UI components
import {
  Box,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

// Import Material-UI icons
import AssessmentIcon from "@mui/icons-material/Assessment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CategoryIcon from "@mui/icons-material/Category";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EventNoteIcon from "@mui/icons-material/EventNote";
import HistoryIcon from "@mui/icons-material/History";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";

const NavigationComponent: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const userRole = useAppSelector(selectUserRole); // Access userRole

  const initiateLogout = () => {
    dispatch(handleLogout());
  };

  // Define navigation items with role-based access
  const navItems = [
    {
      label: "Statistics",
      icon: <AssessmentIcon />, // New icon
      onClick: () => navigate("/statistics"),
      color: "#ff9800", // Example color
      path: "/statistics",
      roles: ["admin", "client", "agent"], // Only these roles
    },
    {
      label: "Movements",
      icon: <HistoryIcon />,
      onClick: () => navigate("/movements"),
      color: "#3f51b5",
      path: "/movements",
      roles: ["admin", "client", "agent"], // Exclude 'employee'
    },
    {
      label: "Clients",
      icon: <PeopleIcon />,
      onClick: () => navigate("/clients"),
      color: "#4caf50",
      path: "/clients",
      roles: ["admin", "client", "agent"], // Exclude 'employee'
    },
    {
      label: "Articles",
      icon: <CategoryIcon />,
      onClick: () => navigate("/articles"),
      color: "#9c27b0",
      path: "/articles",
      roles: ["admin", "client", "agent"], // Exclude 'employee'
    },
    {
      label: "Visits",
      icon: <EventNoteIcon />,
      onClick: () => navigate("/visits"),
      color: "#ff5722",
      path: "/visits",
      roles: ["admin", "client", "agent"], // Exclude 'employee'
    },
    {
      label: "Promos",
      icon: <LocalOfferIcon />,
      onClick: () => navigate("/promos"),
      color: "#00bcd4",
      path: "/promos",
      roles: ["admin", "client", "agent"], // Exclude 'employee'
    },
    {
      label: "Calendar",
      icon: <CalendarTodayIcon />,
      onClick: () => navigate("/calendar"),
      color: "#3f51b5",
      path: "/calendar",
      roles: ["admin", "client", "agent", "employee"], // Accessible to 'employee' as well
    },
    {
      label: "Messages",
      icon: <ChatBubbleOutlineIcon />,
      onClick: () => navigate("/messages"),
      color: "#25D366", // WhatsApp-like green
      path: "/messages",
      roles: ["admin", "client", "agent", "employee"],
    },
    {
      label: "Settings",
      icon: <SettingsIcon />,
      onClick: () => navigate("/settings"),
      color: "#9e9e9e", // Gray color
      path: "/settings",
      roles: ["admin", "client", "agent", "employee"],
    },
    {
      label: "Logout",
      icon: <LogoutIcon />,
      onClick: initiateLogout,
      color: "#f44336",
      path: "/logout",
      roles: ["admin", "client", "agent", "employee"],
    },
  ];

  // Filter navItems based on userRole
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

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
        {/* Grid Container for Navigation Buttons */}
        <Grid
          container
          spacing={4}
          sx={{
            width: "auto",

          }}
        >
          {filteredNavItems.map((item) => (
            <Grid
              item
              xs={6} // 2 buttons per row on mobile (12 / 6 = 2)
              sm={4} // 3 buttons per row on small and up
              md={3} // 4 buttons per row on medium and up
              key={item.label}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}

            >
              <Tooltip title={item.label} arrow>
                <IconButton
                  onClick={item.onClick}
                  size="large"
                  sx={{
                    width: isMobile ? "50px" : isTablet ? "60px" : "70px", // Adjust width based on screen size
                    height: isMobile ? "50px" : isTablet ? "60px" : "70px", // Adjust height based on screen size
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s, background-color 0.3s",
                    "&:hover": {
                      transform: "scale(1.1)",
                      backgroundColor: "#e0e0e0",
                    },
                  }}
                  aria-label={item.label}
                >
                  {React.cloneElement(item.icon, {
                    fontSize: isMobile ? "2rem" : "3rem", // Adjust icon size
                  })}
                </IconButton>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

export default React.memo(NavigationComponent);
