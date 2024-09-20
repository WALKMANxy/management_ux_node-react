// src/pages/PromosPage.tsx

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
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import CreatePromoForm from "../../components/promosPage/CreatePromoForm";
import PromoDetailsCard from "../../components/promosPage/PromoDetailsCard";
import PromosSidebar from "../../components/promosPage/PromosSidebar";
import { clearSelectedPromo } from "../../features/data/dataSlice";

const PromosPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();

  const selectedPromoId = useAppSelector(
    (state: RootState) => state.data.selectedPromoId
  );

  const [isCreatingPromo, setIsCreatingPromo] = useState(false);

  // Get data fetching status and error
  const status = useAppSelector((state: RootState) => state.data.status);
  const error = useAppSelector((state: RootState) => state.data.error);

  // State variables for collapsible containers
  const [isPromoDetailsCollapsed, setIsPromoDetailsCollapsed] = useState(false);
  const [isEligibleClientsCollapsed, setIsEligibleClientsCollapsed] =
    useState(false);

  const handleOpenCreatePromo = () => {
    setIsCreatingPromo(true);
    dispatch(clearSelectedPromo());
  };

  const handleCloseCreatePromo = () => {
    setIsCreatingPromo(false);
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
        {/* Sidebar */}
        <Grid
          item
          xs={12}
          md={3}
          sx={{
            display: { xs: isMobile && selectedPromoId ? "none" : "block" },
            borderRight: "1px solid #e0e0e0",
            height: "100%",
            overflowY: "auto",
          }}
        >
          <PromosSidebar onCreatePromo={handleOpenCreatePromo} />
        </Grid>

        {/* Main content area */}
        <Grid
          item
          xs={12}
          md={9}
          sx={{
            display: "flex",
            flexDirection: "column",
            p: 2,
          }}
        >
          {/* Conditionally render components based on selection */}
          {isCreatingPromo ? (
            <CreatePromoForm onClose={handleCloseCreatePromo} />
          ) : selectedPromoId ? (
            <>
              {/* Promo Details Collapsible Container */}
              <Paper
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "#f4f5f7",
                    p: 1,
                    pl: 2,
                  }}
                >
                  <Typography variant="h4">Promo Details</Typography>
                  <IconButton
                    onClick={() =>
                      setIsPromoDetailsCollapsed(!isPromoDetailsCollapsed)
                    }
                  >
                    {isPromoDetailsCollapsed ? (
                      <ExpandMoreIcon />
                    ) : (
                      <ExpandLessIcon />
                    )}
                  </IconButton>
                </Box>
                <Collapse in={!isPromoDetailsCollapsed}>
                  <PromoDetailsCard
                    promoId={selectedPromoId}
                    onEditPromo={handleOpenCreatePromo}
                    onDeselectPromo={() => dispatch(clearSelectedPromo())}
                  />
                </Collapse>
              </Paper>

              {/* Eligible Clients Collapsible Container */}
              <Paper
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "#f4f5f7",
                    p: 1,
                    pl: 2,
                  }}
                >
                  <Typography variant="h4">Eligible Clients</Typography>
                  <IconButton
                    onClick={() =>
                      setIsEligibleClientsCollapsed(!isEligibleClientsCollapsed)
                    }
                  >
                    {isEligibleClientsCollapsed ? (
                      <ExpandMoreIcon />
                    ) : (
                      <ExpandLessIcon />
                    )}
                  </IconButton>
                </Box>
              </Paper>
            </>
          ) : (
            <Typography variant="h6" sx={{ mt: 2 }}>
              Please select a promo from the sidebar or create a new one.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default PromosPage;
