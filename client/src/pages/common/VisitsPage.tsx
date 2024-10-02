// src/pages/VisitsPage.tsx
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { Suspense, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import VisitsSidebar from "../../components/visitPage/VisitsSidebar";
import {
  clearSelectedVisit,
  clearSelection,
  selectClient,
} from "../../features/data/dataSlice";
import useLoadingData from "../../hooks/useLoadingData";

// Lazy load the non-immediate components
const ClientDetailsCard = React.lazy(
  () => import("../../components/visitPage/ClientDetailsCard")
);
const CreateVisitForm = React.lazy(
  () => import("../../components/visitPage/CreateVisitForm")
);
const VisitsTable = React.lazy(
  () => import("../../components/visitPage/VisitsTable")
);
const VisitView = React.lazy(
  () => import("../../components/visitPage/VisitView")
);

const VisitsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();

  const { loading } = useLoadingData();

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
  }, [userRole, currentUser?.id, dispatch]);

  // Automatically collapse VisitsTable when a visit is selected or creating a visit
  useEffect(() => {
    if (selectedVisitId || isCreatingVisit) {
      setIsVisitsTableCollapsed(true);
    }
  }, [selectedVisitId, isCreatingVisit]);

  useEffect(() => {
    if (selectedVisitId) {
      handleCloseCreateVisit();
    }
  });

  const handleOpenCreateVisit = () => {
    dispatch(clearSelectedVisit());
    setIsCreatingVisit(true);
  };

  const handleCloseCreateVisit = () => {
    setIsCreatingVisit(false);
  };

  // Handle loading state
  if (loading) {
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
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                borderRadius: 6,
                mb: 2,
              }}
            >
              <Typography variant="h4" sx={{ ml: 1 }}>
                Client Details
              </Typography>
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
              <Suspense>
                <ClientDetailsCard
                  clientId={selectedClientId}
                  onCreateVisit={handleOpenCreateVisit}
                  onDeselectClient={() => dispatch(clearSelection())}
                />
              </Suspense>
            </Collapse>

            {/* Visits Table Collapsible Container */}

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
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                borderRadius: 6,
                mb: 2,
                mt: !isClientDetailsCollapsed && isCreatingVisit ? 18 : 2,
              }}
            >
              <Typography variant="h4" sx={{ ml: 1 }}>
                Visits
              </Typography>
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
            <Collapse
              sx={{ mb: isCreatingVisit && !isVisitsTableCollapsed ? 25 : 0 }}
              in={!isVisitsTableCollapsed}
            >
              <Suspense>
                <VisitsTable clientId={selectedClientId} />
              </Suspense>
            </Collapse>

            {/* Visit View (conditionally rendered) */}
            {selectedVisitId && (
              <Suspense>
                <VisitView
                  visitId={selectedVisitId}
                  onDeselectVisit={() => dispatch(clearSelectedVisit())}
                />
              </Suspense>
            )}
            {/* Create Visit Form (conditionally rendered) */}
            {isCreatingVisit && selectedVisitId === null && (
              <Suspense>
                <CreateVisitForm
                  clientId={selectedClientId}
                  onClose={handleCloseCreateVisit}
                />
              </Suspense>
            )}
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default VisitsPage;
