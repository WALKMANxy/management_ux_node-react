// src/components/clientpage/ClientDetails.tsx

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { ClientDetailsProps } from "../../models/propsModels";
import MovementsHistory from "../statistics/grids/MovementsHistory";
import DetailComponent from "./ClientDetailComponent";

/**
 * ClientDetails Component
 * Displays detailed information about a selected client, including their details and movement history.
 *
 * @param {ClientDetailsProps} props - Component props.
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered component.
 */
const ClientDetails = React.forwardRef<HTMLDivElement, ClientDetailsProps>(
  (
    {
      selectedClient,
      isClientDetailsCollapsed,
      setClientDetailsCollapsed,
      isLoading,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:600px)");

    /**
     * Handles the toggle of the client details collapse state.
     */
    const handleToggleCollapse = () => {
      setClientDetailsCollapsed(!isClientDetailsCollapsed);
    };

    return (
      <Paper
        elevation={3}
        ref={ref}
        sx={{
          p: 3,
          borderRadius: "12px",
          background: "linear-gradient(135deg, #e3f2fd 30%, #bbdefb 100%)",
          color: "#000",
          position: "relative",
          overflow: "hidden",
          height: "100%",
          "&:after": {
            content: '""',
            position: "absolute",
            width: 210,
            height: 210,
            background: theme.palette.primary.main,
            borderRadius: "50%",
            top: -85,
            right: -95,
          },
          "&:before": {
            content: '""',
            position: "absolute",
            width: 210,
            height: 210,
            background: theme.palette.primary.main,
            borderRadius: "50%",
            top: -125,
            right: -15,
            opacity: 0.5,
          },
        }}
      >
        {/* Header Section */}
        <Box sx={{ p: 2.25 }}>
          <Grid container direction="column">
            <Grid item>
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="h4" component="h2">
                    {t("clientDetails.title", "Client Details")}
                  </Typography>
                </Grid>
                <Grid item>
                  <Tooltip
                    title={
                      isClientDetailsCollapsed
                        ? t("clientDetails.expand", "Expand Details")
                        : t("clientDetails.collapse", "Collapse Details")
                    }
                    arrow
                  >
                    <IconButton
                      onClick={handleToggleCollapse}
                      aria-label={
                        isClientDetailsCollapsed
                          ? t("clientDetails.expand", "Expand Details")
                          : t("clientDetails.collapse", "Collapse Details")
                      }
                      size="large"
                    >
                      {isClientDetailsCollapsed ? (
                        <ExpandMoreIcon />
                      ) : (
                        <ExpandLessIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>

        {/* Collapsible Content */}
        <Collapse in={!isClientDetailsCollapsed}>
          {selectedClient ? (
            <Box sx={{ p: 2 }}>
              <Grid
                container
                spacing={2}
                direction={isMobile ? "column" : "row"}
              >
                {/* Client Details */}
                <Grid item xs={12} md={6}>
                  <DetailComponent
                    detail={selectedClient}
                    isLoading={isLoading}
                  />
                </Grid>

                {/* Movements History */}
                <Grid item xs={12} md={6}>
                  <MovementsHistory movements={selectedClient.movements} />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              {/* Placeholder or Empty State */}
              <Typography variant="body1" color="textSecondary">
                {t("clientDetails.noClientSelected", "No client selected.")}
              </Typography>
            </Box>
          )}
        </Collapse>
      </Paper>
    );
  }
);

export default React.memo(ClientDetails);
