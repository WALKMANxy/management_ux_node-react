//src/components/dashboard/tabletCalendarContainer.tsx
import { Box, Drawer, Paper } from "@mui/material";
import React from "react";
import CalendarComponent from "./CalendarComponent";
import UpcomingVisits from "./UpcomingVisits";

interface DrawerContainerProps {
  open: boolean;
  onClose: () => void;
  fabPosition?: { top: number; left: number };
  disableUpcomingVisits?: boolean;
}

const DrawerContainer: React.FC<DrawerContainerProps> = ({
  open,
  onClose,
  fabPosition = { top: 0, left: 0 },
  disableUpcomingVisits = false,
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
          maxWidth: "85vw",
          borderRadius: "16px",
          position: "fixed",
          top: fabPosition.top + 315,
          backdropFilter: "blur(50px)",
          margin: "20px",
          overflow: "hidden",
          boxShadow: 20,
        },
      }}
      ModalProps={{
        keepMounted: true,
        sx: {
          backdropFilter: "blur(5px)",
          backgroundColor: "rgba(0, 0, 0, 0.1)", 
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
        {!disableUpcomingVisits && <UpcomingVisits />}
      </Box>
    </Drawer>
  );
};

export default DrawerContainer;
