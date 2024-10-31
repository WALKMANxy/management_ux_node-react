// src/components/dashboard/NavigationComponent.tsx
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
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectUserRole } from "../../features/auth/authSlice";
import { handleLogout } from "../../features/auth/authThunks";

const preloadStatistics = () =>
  import("../../pages/statistics/StatisticsDashboard");
const preloadMovements = () => import("../../pages/common/MovementsPage");
const preloadClients = () => import("../../pages/common/ClientsPage");
const preloadArticles = () => import("../../pages/common/ArticlesPage");
const preloadVisits = () => import("../../pages/common/VisitsPage");
const preloadPromos = () => import("../../pages/common/PromosPage");
const preloadCalendar = () => import("../../pages/common/CalendarPage");
const preloadMessages = () => import("../../pages/common/ChatPage");
const preloadSettings = () => import("../../pages/common/UserPage");

const NavigationComponent: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const userRole = useAppSelector(selectUserRole);
  const { t } = useTranslation();

  const initiateLogout = () => {
    dispatch(handleLogout());
  };

  // Define navigation items with role-based access
  const navItems = [
    {
      label: "navigation.statistics",
      defaultLabel: "Statistics",
      icon: <AssessmentIcon />,
      onClick: () => navigate("/statistics"),
      onmouseenter: () => preloadStatistics(),
      color: "#ff9800",
      path: "/statistics",
      roles: ["admin", "client", "agent"],
    },
    {
      label: "navigation.movements",
      defaultLabel: "Movements",
      icon: <HistoryIcon />,
      onClick: () => navigate("/movements"),
      onmouseenter: () => preloadMovements(),
      color: "#3f51b5",
      path: "/movements",
      roles: ["admin", "client", "agent"],
    },
    {
      label: "navigation.clients",
      defaultLabel: "Clients",
      icon: <PeopleIcon />,
      onClick: () => navigate("/clients"),
      onmouseenter: () => preloadClients(),
      color: "#4caf50",
      path: "/clients",
      roles: ["admin", "client", "agent"],
    },
    {
      label: "navigation.articles",
      defaultLabel: "Articles",
      icon: <CategoryIcon />,
      onClick: () => navigate("/articles"),
      onmouseenter: () => preloadArticles(),
      color: "#9c27b0",
      path: "/articles",
      roles: ["admin", "client", "agent"],
    },
    {
      label: "navigation.visits",
      defaultLabel: "Visits",
      icon: <EventNoteIcon />,
      onClick: () => navigate("/visits"),
      onmouseenter: () => preloadVisits(),
      color: "#ff5722",
      path: "/visits",
      roles: ["admin", "client", "agent"],
    },
    {
      label: "navigation.promos",
      defaultLabel: "Promos",
      icon: <LocalOfferIcon />,
      onClick: () => navigate("/promos"),
      onmouseenter: () => preloadPromos(),
      color: "#00bcd4",
      path: "/promos",
      roles: ["admin", "client", "agent"],
    },
    {
      label: "navigation.calendar",
      defaultLabel: "Calendar",
      icon: <CalendarTodayIcon />,
      onClick: () => navigate("/calendar"),
      onmouseenter: () => preloadCalendar(),
      color: "#3f51b5",
      path: "/calendar",
      roles: ["admin", "client", "agent", "employee"],
    },
    {
      label: "navigation.messages",
      defaultLabel: "Messages",
      icon: <ChatBubbleOutlineIcon />,
      onClick: () => navigate("/messages"),
      onmouseenter: () => preloadMessages(),
      color: "#25D366",
      path: "/messages",
      roles: ["admin", "client", "agent", "employee"],
    },
    {
      label: "navigation.settings",
      defaultLabel: "Settings",
      icon: <SettingsIcon />,
      onClick: () => navigate("/settings"),
      onmouseenter: () => preloadSettings(),
      color: "#9e9e9e",
      path: "/settings",
      roles: ["admin", "client", "agent", "employee"],
    },
    {
      label: "navigation.logout",
      defaultLabel: "Logout",
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
          variant={isMobile ? "h6" : "h5"}
          sx={{
            mb: 4,
            fontWeight: "700",
            color: "#333",
          }}
        >
          {t("navigation.quickNavigation", "Quick Navigation")}
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
              <Tooltip title={t(item.label, item.defaultLabel)} arrow>
                <IconButton
                  onClick={item.onClick}
                  size="large"
                  onMouseEnter={item.onmouseenter}
                  sx={{
                    width: isMobile ? "50px" : isTablet ? "60px" : "70px",
                    height: isMobile ? "50px" : isTablet ? "60px" : "70px",
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s, background-color 0.3s",
                    "&:hover": {
                      transform: "scale(1.1)",
                      backgroundColor: "#e0e0e0",
                    },
                  }}
                  aria-label={t(item.label, item.defaultLabel)}
                >
                  {React.cloneElement(item.icon, {
                    fontSize: isMobile ? "2rem" : "3rem",
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
