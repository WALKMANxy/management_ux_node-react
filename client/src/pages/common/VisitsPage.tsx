// src/pages/VisitsPage.tsx
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  CircularProgress,
  Collapse,
  Drawer,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import AnimatedBox from "../../components/common/AnimatedBox";
import SkeletonCard from "../../components/visitPage/SkeletonCard";
import SkeletonClientDetailsCard from "../../components/visitPage/SkeletonCardButtons";
import VisitsSidebar from "../../components/visitPage/VisitsSidebar";
import {
  clearSelectedClient,
  clearSelectedVisit,
  selectClient,
} from "../../features/data/dataSlice";
import useLoadingData from "../../hooks/useLoadingData";
import useResizeObserver from "../../hooks/useResizeObserver";
import { useVisitSidebar } from "../../hooks/useVisitSidebar";

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
const UpcomingVisits = React.lazy(
  () => import("../../components/dashboard/UpcomingVisits")
);

const VisitsPage: React.FC = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(min-width:600px) and (max-width:900px)");
  const isMobileOrTablet = isMobile || isTablet;
  const isDesktop = useMediaQuery("(min-width:900px)");
  const dispatch = useAppDispatch();

  const { t } = useTranslation();
  const { loading } = useLoadingData();
  const selectedVisitId = useAppSelector(
    (state: RootState) => state.data.selectedVisitId
  );
  const [isCreatingVisit, setIsCreatingVisit] = useState(false);
  const [isCreateVisitFormLoaded, setIsCreateVisitFormLoaded] = useState(false);
  const { handleVisitsRefresh } = useVisitSidebar();
  const currentUser = useAppSelector(
    (state: RootState) => state.data.currentUserDetails
  );
  const userRole = currentUser?.role;

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

  // State for Drawer open/close
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Refs for collapsible sections
  const clientDetailsRef = useRef<HTMLDivElement>(null);
  const visitsTableRef = useRef<HTMLDivElement>(null);
  const createVisitRef = useRef<HTMLDivElement | null>(null);

  // Use ResizeObserver to watch for size changes
  useResizeObserver(clientDetailsRef, () => {});
  useResizeObserver(visitsTableRef, () => {});

  // Automatically select the client and hide sidebar for client users
  useEffect(() => {
    if (userRole === "client" && currentUser?.id) {
      dispatch(selectClient(currentUser.id));
    }
  }, [userRole, currentUser?.id, dispatch]);

  // Automatically collapse VisitsTable when a visit is selected or creating a visit
  useEffect(() => {
    if (isCreatingVisit || selectedVisitId) {
      setIsVisitsTableCollapsed(true);
    } else {
      setIsVisitsTableCollapsed(false);
    }
  }, [selectedVisitId, isCreatingVisit]);

  // Scroll into view when CreateVisitForm is rendered
  useEffect(() => {
    if (isCreatingVisit && isCreateVisitFormLoaded && createVisitRef.current) {
      createVisitRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isCreatingVisit, isCreateVisitFormLoaded]);

  const handleCreateVisitFormLoad = useCallback(() => {
    setIsCreateVisitFormLoaded(true);
  }, []);

  const handleCloseCreateVisit = useCallback(() => {
    setIsCreatingVisit(false);
  }, []);

  useEffect(() => {
    if (selectedVisitId) {
      handleCloseCreateVisit();
    }
  }, [selectedVisitId, handleCloseCreateVisit]);

  const handleOpenCreateVisit = useCallback(() => {
    dispatch(clearSelectedVisit());
    setIsCreatingVisit(true);
  }, [dispatch]);

  // Toggle functions for Drawer
  const toggleDrawer = (open: boolean) => () => {
    setIsDrawerOpen(open);
  };

  useEffect(() => {
    if (selectedClientId) {
      setIsDrawerOpen(false);
    }
  }, [selectedClientId]);

  const appBarHeight = isMobile ? 56 : 64;

  const handleDeselectClient = useCallback(() => {
    dispatch(clearSelectedClient());
    dispatch(clearSelectedVisit());
  }, [dispatch]);

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
        height: isMobile ? "100dvh" : "calc(100vh - 90px)",
        bgcolor: "#f4f5f7",
      }}
    >
      <Grid container sx={{ flexGrow: 1, height: "100%" }}>
        {/* Sidebar: Hidden for clients */}
        {userRole !== "client" && (
          <>
            {/* Desktop View: Show Sidebar Normally */}
            {isDesktop && (
              <Grid
                item
                xs={12}
                md={3}
                sx={{
                  display: { xs: "none", md: "block" },
                  borderRight: "1px solid #e0e0e0",
                  height: "100%",
                  overflowY: "auto",
                  flexGrow: 1,
                }}
              >
                <VisitsSidebar />
              </Grid>
            )}

            {/* Tablet View: Show Sidebar in a Drawer */}
            {isMobileOrTablet && (
              <>
                <Drawer
                  anchor="left"
                  open={isDrawerOpen}
                  onClose={toggleDrawer(false)}
                  PaperProps={{
                    sx: {
                      width: 300,
                      top: appBarHeight,
                      height: `calc(100% - ${appBarHeight}px)`,
                      borderTopRightRadius: 16,
                      borderBottomRightRadius: 16,
                      boxShadow: 3,
                      overflowY: "auto",
                    },
                  }}
                >
                  <VisitsSidebar />
                </Drawer>
              </>
            )}
          </>
        )}

        {/* Main content area */}
        <Grid
          item
          xs={12}
          md={userRole !== "client" ? 9 : 12}
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            overflow: "hidden",
            height: "100%",
            position: "relative",
          }}
        >
          {/* Toggle Button for Tablet View */}
          {isMobileOrTablet && userRole !== "client" && (
            <Box sx={{ pb: isMobile ? 7 : 1 }}>
              <IconButton
                onClick={toggleDrawer(true)}
                aria-label="open sidebar"
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  zIndex: 1,
                }}
              >
                <PeopleIcon />
              </IconButton>
            </Box>
          )}

          {/* Main content scroll container */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              minHeight: 0,
              overflowY: "auto",
              p: 1,
              "&::-webkit-scrollbar": {
                display: "none",
              },
              msOverflowStyle: "none",
            }}
          >
            {/* Render content based on client selection */}
            {!selectedClientId ? (
              // No client selected: Show Upcoming Visits and All Visits Table
              <React.Fragment>
                {/* Upcoming Visits */}
                <AnimatedBox
                  sx={{
                    mb: 4,
                    px: 2,
                    mt: isTablet && userRole !== "client" ? 6 : 0,
                  }}
                >
                  <Suspense fallback={<SkeletonCard />}>
                    <UpcomingVisits />
                  </Suspense>
                </AnimatedBox>

                {/* All Visits History Table */}
                <AnimatedBox sx={{ paddingX: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: "#f4f5f7",
                      p: 1,
                      pt: 2,
                      pb: 2,
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                      borderRadius: 6,
                      mb: 1,
                    }}
                  >
                    <Typography variant="h4" sx={{ ml: 1 }}>
                      {t("visitsPage.visitsHistory", "Visits History")}
                    </Typography>
                    <IconButton onClick={handleVisitsRefresh}>
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                  <Suspense fallback={<SkeletonCard />}>
                    <VisitsTable clientId={null} />{" "}
                    {/* Pass null to fetch all clients' visits */}
                  </Suspense>
                </AnimatedBox>

                {/* Visit View (conditionally rendered) */}
                {selectedVisitId && (
                  <AnimatedBox
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flexShrink: 0,
                      mb: 2,
                    }}
                  >
                    <Suspense fallback={<SkeletonClientDetailsCard />}>
                      <VisitView
                        visitId={selectedVisitId}
                        onDeselectVisit={() => dispatch(clearSelectedVisit())}
                      />
                    </Suspense>
                  </AnimatedBox>
                )}
              </React.Fragment>
            ) : (
              // Client selected: Show Client Details and Visits
              <React.Fragment>
                {/* Client Details Collapsible Container */}
                {userRole !== "client" && (
                  <AnimatedBox
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flexShrink: 0,
                      mb: 2,
                      mt: isTablet ? 6 : 0,
                    }}
                    ref={clientDetailsRef}
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
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        borderRadius: 6,
                        mb: 1,
                      }}
                    >
                      <Typography variant="h4" sx={{ ml: 1 }}>
                        {t(
                          "visitsPage.ClientDetailsContainer",
                          "Client Details"
                        )}
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
                    <Collapse
                      in={!isClientDetailsCollapsed}
                      sx={{
                        flexShrink: 0,
                      }}
                    >
                      <Suspense fallback={<SkeletonClientDetailsCard />}>
                        <ClientDetailsCard
                          clientId={selectedClientId}
                          onCreateVisit={handleOpenCreateVisit}
                          onDeselectClient={handleDeselectClient}
                        />
                      </Suspense>
                    </Collapse>
                  </AnimatedBox>
                )}

                {/* Visits Table Collapsible Container */}
                <AnimatedBox
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flexShrink: 0,
                  }}
                  ref={visitsTableRef}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: "#f4f5f7",
                      p: 1,
                      pt: 1,
                      pb: 2,
                      pl: 2,
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                      borderRadius: 6,
                      mb: 2,
                      mt:
                        userRole !== "client"
                          ? !isClientDetailsCollapsed
                            ? -5
                            : isClientDetailsCollapsed
                            ? -1
                            : isCreatingVisit
                            ? 0
                            : -4
                          : 0,
                    }}
                  >
                    <Typography variant="h4" sx={{ ml: 1 }}>
                      {t("visitsPage.VisitsContainer", "Visits")}
                    </Typography>

                    {/* Positioned Refresh and Collapse Buttons */}
                    <Box sx={{ display: "flex", ml: "auto" }}>
                      {/* Show Refresh Button only for clients */}
                      {userRole === "client" && (
                        <Tooltip
                          title={t(
                            "visitsSidebar.refreshTooltip",
                            "Refresh Visits"
                          )}
                          arrow
                        >
                          <IconButton
                            onClick={handleVisitsRefresh}
                            aria-label={t(
                              "visitsSidebar.refresh",
                              "Refresh Visits"
                            )}
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Collapse Button */}
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
                  </Box>

                  <Collapse
                    sx={{
                      mb: isCreatingVisit && !isVisitsTableCollapsed ? 25 : 0,
                    }}
                    in={!isVisitsTableCollapsed}
                  >
                    <Suspense fallback={<SkeletonCard />}>
                      <VisitsTable clientId={selectedClientId} />
                    </Suspense>
                  </Collapse>
                </AnimatedBox>

                {/* Visit View (conditionally rendered) */}
                {selectedVisitId && (
                  <AnimatedBox
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flexShrink: 0,
                      mb: 2,
                    }}
                  >
                    <Suspense fallback={<SkeletonClientDetailsCard />}>
                      <VisitView
                        visitId={selectedVisitId}
                        onDeselectVisit={() => dispatch(clearSelectedVisit())}
                      />
                    </Suspense>
                  </AnimatedBox>
                )}

                {/* Create Visit Form (conditionally rendered) */}
                {isCreatingVisit && selectedVisitId === null && (
                  <Box ref={createVisitRef}>
                    <Suspense>
                      <CreateVisitForm
                        clientId={selectedClientId}
                        onClose={handleCloseCreateVisit}
                        onLoad={handleCreateVisitFormLoad}
                      />
                    </Suspense>
                  </Box>
                )}
              </React.Fragment>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default memo(VisitsPage);
