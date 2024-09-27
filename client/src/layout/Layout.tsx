// src/layout/Layout.tsx
import { Box, useMediaQuery, useTheme } from "@mui/material";
import "animate.css";
import React, { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary";
import Header from "../components/Header/Header";
import { selectCurrentChat } from "../features/chat/chatSlice";

const Layout: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const currentChat = useAppSelector(selectCurrentChat);

  // Define paths in a constants file for maintainability
  const clientsOrMessagesPaths = useMemo(
    () => [
      "/clients",
      "/messages",
      "/visits",
      "/promos",
      "/calendar",
      "/movements",
      "/articles",
    ],
    []
  );

  const isClientsOrMessagesPage = useMemo(
    () => clientsOrMessagesPaths.includes(location.pathname),
    [clientsOrMessagesPaths, location.pathname]
  );

  const isSettingsPage = useMemo(
    () => location.pathname === "/settings",
    [location.pathname]
  );

  // Precompute padding based on page and device type
  const padding = useMemo(() => {
    if (isSettingsPage) return { pl: 0, pr: 0 };
    if (isClientsOrMessagesPage && isMobile) return { p: 0 };
    return { p: 1 };
  }, [isSettingsPage, isClientsOrMessagesPage, isMobile]);

  // Determine if the header should be displayed
  const shouldShowHeader = useMemo(
    () => !currentChat || !isMobile,
    [currentChat, isMobile]
  );

  return (
    <ErrorBoundary>
      <Box>
        {shouldShowHeader && <Header />}
        <Box
          component="main"
          className="animate__animated animate__fadeIn"
          key={location.pathname}
          sx={{
            flex: 1, // Allow main content to grow and fill available space
            ...padding,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default Layout;
