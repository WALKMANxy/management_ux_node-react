// src/components/UserPage/UserPage.tsx

import { Box, Divider, useMediaQuery, useTheme } from "@mui/material";
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import AppSettings from "../../components/userPage/AppSettings";
import ManageUsers from "../../components/userPage/ManageUsers";
import ModifyAccount from "../../components/userPage/ModifyAccount";
import Sidebar from "../../components/userPage/SideBar";
import { selectCurrentUser } from "../../features/users/userSlice";

type SelectedSection = "modify-account" | "app-settings" | "manage-users";

const UserPage: React.FC = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const [selectedSection, setSelectedSection] =
    useState<SelectedSection>("modify-account");
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // If no user is logged in, redirect to login or another appropriate page
  if (!currentUser || !currentUser._id) {
    return <Navigate to="/" replace />;
  }

  // Render the appropriate component based on the selected section
  const renderSelectedSection = () => {
    switch (selectedSection) {
      case "modify-account":
        return <ModifyAccount />;
      case "app-settings":
        return <AppSettings />;
      case "manage-users":
        if (currentUser.role === "admin") {
          return <ManageUsers />;
        }
        return null;
      default:
        return <ModifyAccount />;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: isMobile ? "94vh" : "calc(100vh - 120px)", // Use 95vh when isMobile is true, otherwise subtract the header height
      }}
    >
      <Sidebar onSelectSection={setSelectedSection} />
      <Divider orientation="vertical" flexItem sx={{ ml: 2 }} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f5f5f5",
          p: 3,
          overflowY: "auto",
        }}
      >
        {renderSelectedSection()}
      </Box>
    </Box>
  );
};

export default UserPage;
