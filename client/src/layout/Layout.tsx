// src/layout/Layout.tsx
import { Box, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header/Header";

const Layout: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Check if the current path matches specific routes
  const isClientsOrMessagesPage =
    location.pathname === "/clients" || location.pathname === "/messages";
  const isSettingsPage = location.pathname === "/settings"; // Check if on the /settings page

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box
        component="main"
        sx={{
          p: isClientsOrMessagesPage && isMobile ? 0 : 3, // Adjust padding for clients and messages pages
          pl: isSettingsPage ? 0 : 3, // Remove left padding for settings page
          pr: isSettingsPage ? 0 : 3,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
