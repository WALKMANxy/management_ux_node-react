//src/components/clientpage/ClientDetails.tsx
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
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ClientDetailsProps } from "../../models/propsModels";
import MovementsHistory from "../statistics/grids/MovementsHistory";
import DetailComponent from "./ClientDetailComponent";


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

    // Memoize the toggle function to avoid recreating it on every render
    const toggleCollapse = useMemo(
      () => () => {
        setClientDetailsCollapsed(!isClientDetailsCollapsed);
      },
      [isClientDetailsCollapsed, setClientDetailsCollapsed]
    );

    // Calculate height based on expansion state and mobile view
    const height = useMemo(() => {
      if (isMobile) {
        return isClientDetailsCollapsed ? "100%" : 1050 * 1.33;
      }
      return "100%";
    }, [isMobile, isClientDetailsCollapsed]);

    // Memoize styles to avoid recreating them on every render
    const paperStyles = useMemo(
      () => ({
        p: isMobile ? 0 : 3,
        borderRadius: "12px",
        background: "linear-gradient(135deg, #e3f2fd 30%, #bbdefb 100%)",
        color: "#000",
        overflow: "hidden",
        height,
        maxHeight: height,
        position: "relative" as const,
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          display: "none", 
        },
        "&:after": {
          content: '""',
          position: "absolute",
          width: 210,
          height: 210,
          background: theme.palette.primary.main,
          borderRadius: "50%",
          top: -85,
          right: -95,
          overflow: "hidden",
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
          overflow: "hidden",
        },
      }),
      [theme.palette.primary.main, isMobile, height]
    );

    return (
      <Paper elevation={3} ref={ref} sx={paperStyles}>
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
                <Grid item sx={{ zIndex: 1000 }}>
                  <Tooltip
                    title={
                      isClientDetailsCollapsed
                        ? t("clientDetails.expand", "Expand Details")
                        : t("clientDetails.collapse", "Collapse Details")
                    }
                    arrow
                  >
                    <IconButton
                      onClick={toggleCollapse}
                      aria-label={
                        isClientDetailsCollapsed
                          ? t("clientDetails.expand", "Expand Details")
                          : t("clientDetails.collapse", "Collapse Details")
                      }
                      size="large"
                      sx={{ zIndex: 1000 }}
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
                direction={"column"}
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
