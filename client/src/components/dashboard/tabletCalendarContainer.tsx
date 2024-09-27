// DrawerContainer.tsx
import { Box, Drawer, Paper } from "@mui/material";
import React from "react";
import CalendarComponent from "./CalendarComponent";
import UpcomingVisits from "./UpcomingVisits";

interface DrawerContainerProps {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  fabPosition?: { top: number; left: number }; // Position of FAB for drawer placement
}

const DrawerContainer: React.FC<DrawerContainerProps> = ({
  open,
  onClose,
  fabPosition = { top: 0, left: 0 },
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        component: Paper,
        sx: {
          height: "auto",
          width: "auto",
          maxWidth: "85vw",
          borderRadius: "16px",
          position: "fixed",
          top: fabPosition.top + 315, // Adjust for FAB position + offset
          backgroundColor: "#FFF5E1",
          backdropFilter: "blur(50px)", // Enhanced focus on drawer content
          margin: "20px", // Margin for better spacing and alignment
          overflow: "hidden",
          boxShadow: 20,
        },
      }}
      ModalProps={{
        keepMounted: true,
        sx: {
          backdropFilter: "blur(5px)", // Subtle blur effect on background
          backgroundColor: "rgba(0, 0, 0, 0.1)", // Light overlay for focus
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CalendarComponent />
        <UpcomingVisits />
      </Box>
    </Drawer>
  );
};

export default DrawerContainer;
