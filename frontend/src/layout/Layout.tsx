// src/layout/Layout.tsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header/Header";
import { Box, useMediaQuery, useTheme } from "@mui/material";

const Layout: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isClientsPage = location.pathname === "/clients"; // Adjust the path if necessary

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isClientsPage && isMobile ? 0 : 3, // Remove padding for clients page on mobile
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
