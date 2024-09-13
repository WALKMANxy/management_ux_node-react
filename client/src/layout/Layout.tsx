// src/layout/Layout.tsx
import { Box, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header/Header";

const Layout: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isClientsOrMessagesPage =
    location.pathname === "/clients" || location.pathname === "/messages"; // Adjust the paths if necessary

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box
        component="main"
        sx={{
          p: isClientsOrMessagesPage && isMobile ? 0 : 3, // Remove padding for clients and messages pages on mobile
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
