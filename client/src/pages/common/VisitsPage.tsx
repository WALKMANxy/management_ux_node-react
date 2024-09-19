// src/pages/VisitsPage.tsx
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import ClientDetailsCard from "../../components/visitPage/ClientDetailsCard";
import CreateVisitForm from "../../components/visitPage/CreateVisitForm";
import VisitsSidebar from "../../components/visitPage/VisitsSidebar";
import VisitsTable from "../../components/visitPage/VisitsTable";
import VisitView from "../../components/visitPage/VisitView";
import {
  clearSelectedVisit,
  clearSelection,
  selectClient,
} from "../../features/data/dataSlice";

const VisitsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();

  const selectedVisitId = useAppSelector(
    (state: RootState) => state.data.selectedVisitId
  );


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


  // Get data fetching status and error
  const status = useAppSelector((state: RootState) => state.data.status);
  const error = useAppSelector((state: RootState) => state.data.error);

  // State variables for collapsible containers
  const [isClientDetailsCollapsed, setIsClientDetailsCollapsed] =
    useState(false);
  const [isVisitsTableCollapsed, setIsVisitsTableCollapsed] = useState(false);

  // Automatically select the client and hide sidebar for client users
  useEffect(() => {
    if (userRole === "client" && currentUser?.id) {
      dispatch(selectClient(currentUser.id));
    }
  }, [userRole, currentUser, dispatch]);

  // Automatically collapse VisitsTable when a visit is selected or creating a visit
  useEffect(() => {
    if (selectedVisitId || isCreatingVisit) {
      setIsVisitsTableCollapsed(true);
    }
  }, [selectedVisitId, isCreatingVisit]);

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
        height: isMobile ? "100dvh" : "calc(100vh - 120px)",
        bgcolor: "#f4f5f7",
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
              p: 2,
            }}
          >
            {/* Client Details Collapsible Container */}
            <Paper
              sx={{
                mb: 2,
                borderRadius: 2,
                overflow: "display",
                height: "auto",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: "#f4f5f7",
                  p: 1,
                  pt: 2,
                  pb: 2,
                  pl: 2,
                  height: "auto",

                }}
              >
                <Typography variant="h4" sx={{ ml: 1 }}>Client Details</Typography>
                <IconButton
                  onClick={() =>
                    setIsClientDetailsCollapsed(!isClientDetailsCollapsed)
                  }
                >
                  {isClientDetailsCollapsed ? (
                    <ExpandMoreIcon />
                  ) : (
                    <ExpandLessIcon />
                  )}
                </IconButton>
              </Box>
              <Collapse in={!isClientDetailsCollapsed}>
                <ClientDetailsCard
                  clientId={selectedClientId}
                  onCreateVisit={handleOpenCreateVisit}
                  onDeselectClient={() => dispatch(clearSelection())}
                />
              </Collapse>
            </Paper>

            {/* Visits Table Collapsible Container */}
            <Paper
              sx={{
                mb: 2,
                borderRadius: 2,
                overflow: "display",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: "#f4f5f7",
                  p: 1,
                  pt: 2,
                  pb: 2,
                  pl: 2,
                }}
              >
                <Typography variant="h4" sx={{ ml: 1 }}>Visits</Typography>
                <IconButton
                  onClick={() =>
                    setIsVisitsTableCollapsed(!isVisitsTableCollapsed)
                  }
                >
                  {isVisitsTableCollapsed ? (
                    <ExpandMoreIcon />
                  ) : (
                    <ExpandLessIcon />
                  )}
                </IconButton>
              </Box>
              <Collapse in={!isVisitsTableCollapsed}>
                <VisitsTable clientId={selectedClientId} />
              </Collapse>
            </Paper>

            {/* Visit View (conditionally rendered) */}
            {selectedVisitId && (
              <VisitView
                visitId={selectedVisitId}
                onDeselectVisit={() => dispatch(clearSelectedVisit())}
              />
            )}
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
