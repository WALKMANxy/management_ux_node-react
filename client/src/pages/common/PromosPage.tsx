// src/pages/PromosPage.tsx

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
import React, { Suspense, useEffect } from "react";
import { useAppSelector } from "../../app/hooks";
import PromosSidebar from "../../components/promosPage/PromosSidebar";
import SkeletonView from "../../components/promosPage/SkeletonView";
import useLoadingData from "../../hooks/useLoadingData";
import usePromos from "../../hooks/usePromos";
import { selectCurrentUser } from "../../features/users/userSlice";

// Lazy load other components
const CreatePromoForm = React.lazy(
  () => import("../../components/promosPage/CreatePromoForm")
);
const EligibleClientsGrid = React.lazy(
  () => import("../../components/promosPage/EligibleClientsGrid")
);
const PromoDetailsCard = React.lazy(
  () => import("../../components/promosPage/PromoDetailsCard")
);

const PromosPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { loading } = useLoadingData();

  const {
    mode,
    selectedPromo,
    handlePromoDeselect,
    handlePromoSelect,
    initiateCreatePromo,
    initiateEditPromo,
    handleCreatePromo,
    handleUpdatePromo,
    handleSunsetPromo,
  } = usePromos();


  const userRole = useAppSelector(selectCurrentUser)?.role;

  // Get data fetching status and error
  const status = useAppSelector((state) => state.data.status);
  const error = useAppSelector((state) => state.data.error);

  // State variables for collapsible containers
  const [isPromoDetailsCollapsed, setIsPromoDetailsCollapsed] =
    React.useState(false);
  const [isEditFormCollapsed, setIsEditFormCollapsed] = React.useState(false);
  const [isEligibleClientsCollapsed, setIsEligibleClientsCollapsed] =
    React.useState(false);

  useEffect(() => {
    console.log("Page mode:", mode);
  }, [mode]);

  // Reset collapsible sections when selectedPromo or mode changes
  useEffect(() => {
    setIsPromoDetailsCollapsed(false);
    setIsEligibleClientsCollapsed(false);
    setIsEditFormCollapsed(false);
  }, [selectedPromo, mode]);

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
        height: isMobile ? "auto" : "calc(100vh - 90px)",
        bgcolor: "#f4f5f7",
        minHeight: 0,
        p: 0,
      }}
    >
      <Grid container sx={{ flexGrow: 1, height: "100%" }}>
        <Grid
          item
          xs={12}
          md={3}
          sx={{
            display: {
              xs:
                isMobile && (selectedPromo || mode === "create")
                  ? "none"
                  : "block",
            },
            borderRight: "1px solid #e0e0e0",
            height: "100%", // Ensure sidebar fills available height
            minHeight: 0,
          }}
        >
          <PromosSidebar
            onCreatePromo={initiateCreatePromo}
            onSelectPromo={handlePromoSelect} // Pass handlePromoSelect here
          />
        </Grid>
        <Grid
          item
          xs={12}
          md={9}
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1, // Allow the content area to grow and fill the available space
            overflow: "auto",
            height: "100%", // Ensure full height
            "&::-webkit-scrollbar": {
              display: "none", // Hide scrollbar in WebKit browsers
            },
            msOverflowStyle: "none", // Hide scrollbar in IE and Edge

            px: isMobile ? 0 : 2,
          }}
        >
          <Suspense fallback={<SkeletonView />}>
            {mode === "create" ? (
              <Box
                sx={{
                  p: 0,
                  mb: 2,
                  py: 2,
                  borderRadius: 2,
                  height: "auto",
                  "&::-webkit-scrollbar": {
                    display: "none", // Hide scrollbar in WebKit browsers
                  },
                  msOverflowStyle: "none", // Hide scrollbar in IE and Edge
                }}
              >
                <CreatePromoForm
                  onClose={handlePromoDeselect}
                  isCreating={true}
                  onSubmit={handleCreatePromo}
                />
              </Box>
            ) : mode === "edit" && selectedPromo ? (
              <Box
                sx={{
                  mb: 2,
                  pt: 2,
                  borderRadius: 2,
                  height: "auto",
                  "&::-webkit-scrollbar": {
                    display: "none", // Hide scrollbar in WebKit browsers
                  },
                  msOverflowStyle: "none", // Hide scrollbar in IE and Edge
                }}
              >
                <CollapsibleSection
                  title="Promo Details"
                  isCollapsed={isPromoDetailsCollapsed}
                  setIsCollapsed={setIsPromoDetailsCollapsed}
                >
                  <PromoDetailsCard
                    onEditPromo={initiateEditPromo}
                    onDeselectPromo={handlePromoDeselect}
                    onTerminatePromo={handleSunsetPromo}
                  />
                </CollapsibleSection>
                <CollapsibleSection
                  title="Edit Promo"
                  isCollapsed={isEditFormCollapsed}
                  setIsCollapsed={setIsEditFormCollapsed}
                >
                  <CreatePromoForm
                    onClose={handlePromoDeselect}
                    promoData={selectedPromo}
                    isCreating={false}
                    onSubmit={handleUpdatePromo}
                  />
                </CollapsibleSection>
              </Box>
            ) : mode === "view" && selectedPromo ? (
              <Box
                sx={{
                  mb: 2,
                  pt: 2,
                  borderRadius: 2,
                  height: "auto",
                  "&::-webkit-scrollbar": {
                    display: "none", // Hide scrollbar in WebKit browsers
                  },
                  msOverflowStyle: "none", // Hide scrollbar in IE and Edge
                }}
              >
                <CollapsibleSection
                  title="Promo Details"
                  isCollapsed={isPromoDetailsCollapsed}
                  setIsCollapsed={setIsPromoDetailsCollapsed}
                >
                  <PromoDetailsCard
                    onEditPromo={initiateEditPromo}
                    onDeselectPromo={handlePromoDeselect}
                    onTerminatePromo={handleSunsetPromo}
                  />
                </CollapsibleSection>
                {userRole !== "client" && (
  <CollapsibleSection
    title={
      selectedPromo.global
        ? "Excluded Clients"
        : "Eligible Clients"
    }
    isCollapsed={isEligibleClientsCollapsed}
    setIsCollapsed={setIsEligibleClientsCollapsed}
  >
    <EligibleClientsGrid
      isViewing={true}
      selectedClients={
        selectedPromo.global ? [] : selectedPromo.clientsId
      }
      excludedClients={
        selectedPromo.global
          ? selectedPromo.excludedClientsId
          : []
      }
      global={selectedPromo.global}
    />
  </CollapsibleSection>
)}
              </Box>
            ) : isMobile ? null : (
              <Typography variant="h6" sx={{ mt: 2 }}>
                Please select a promo from the sidebar or create a new one.
              </Typography>
            )}
          </Suspense>
        </Grid>
      </Grid>
    </Box>
  );
};

const CollapsibleSection = ({
  title,
  isCollapsed,
  setIsCollapsed,
  children,
}: {
  title: string;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      mb: 0, // Add margin-bottom to separate from next section
      px: 1,
    }}
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
      }}
    >
      <Typography variant="h4" sx={{ ml: 1 }}>
        {title}
      </Typography>
      <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
      </IconButton>
    </Box>
    <Collapse in={!isCollapsed}>{children}</Collapse>
  </Box>
);

export default PromosPage;
