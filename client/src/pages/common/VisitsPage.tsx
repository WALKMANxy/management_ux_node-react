// src/pages/VisitsPage.tsx
import {
  Box,
  CircularProgress,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import ClientDetailsCard from "../../components/visitPage/ClientDetailsCard";
import VisitsSidebar from "../../components/visitPage/VisitsSidebar";
import VisitsTable from "../../components/visitPage/VisitsTable";
import VisitView from "../../components/visitPage/VisitView";
import { selectClient } from "../../features/data/dataSlice";
import CreateVisitForm from "../../components/visitPage/CreateVisitForm";

const VisitsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();

  const [isCreatingVisit, setIsCreatingVisit] = useState(false);

  // Get currentUser from Redux state
  const currentUser = useAppSelector(
    (state: RootState) => state.data.currentUserDetails
  );
  const userRole = currentUser?.role;

  // Get selectedClientId from Redux state
  const selectedClientId = useAppSelector(
    (state: RootState) => state.data.selectedClientId
  );

  // Get selectedVisitId from Redux state
  const selectedVisitId = useAppSelector(
    (state: RootState) => state.data.selectedVisitId
  );

  // Get data fetching status and error
  const status = useAppSelector((state: RootState) => state.data.status);
  const error = useAppSelector((state: RootState) => state.data.error);

  // Automatically select the client and hide sidebar for client users
  useEffect(() => {
    if (userRole === "client" && currentUser?.id) {
      dispatch(selectClient(currentUser.id));
    }
  }, [userRole, currentUser, dispatch]);

  const handleOpenCreateVisit = () => {
    setIsCreatingVisit(true);
  };

  const handleCloseCreateVisit = () => {
    setIsCreatingVisit(false);
  };

  // Handle loading state
  if (status === "loading") {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f4f5f7",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Handle error state
  if (status === "failed") {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f4f5f7",
          p: 2,
        }}
      >
        <Typography variant="h6" color="error">
          {error || "An error occurred while fetching data."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: isMobile ? "94vh" : "calc(100vh - 120px)",
        bgcolor: "#f4f5f7",
        overflow: "hidden",
      }}
    >
      <Grid container sx={{ flexGrow: 1, height: "100%" }}>
        {/* Sidebar: Hidden for clients */}
        {userRole !== "client" && (
          <Grid
            item
            xs={12}
            md={3}
            sx={{
              display: { xs: isMobile && selectedClientId ? "none" : "block" },
              borderRight: "1px solid #e0e0e0",
              height: "100%",
              overflowY: "auto",
            }}
          >
            <VisitsSidebar />
          </Grid>
        )}

        {/* Main content area */}
        {selectedClientId && (
          <Grid
            item
            xs={12}
            md={userRole !== "client" ? 9 : 12}
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {/* Client Details */}
            <ClientDetailsCard
              clientId={selectedClientId}
              onCreateVisit={handleOpenCreateVisit}
            />

            {/* Visits Table */}
            <VisitsTable clientId={selectedClientId} />

            {/* Visit View (conditionally rendered) */}
            {selectedVisitId && <VisitView visitId={selectedVisitId} />}
            {/* Create Visit Form (conditionally rendered) */}
            {isCreatingVisit && (
              <CreateVisitForm
                clientId={selectedClientId}
                onClose={handleCloseCreateVisit}
              />
            )}
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default VisitsPage;
