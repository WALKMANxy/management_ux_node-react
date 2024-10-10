// src/components/movementsPage/MovementDetails.tsx
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
import { MovementDetailsProps } from "../../models/propsModels";
import MovementDetailsHistory from "../statistics/grids/MovementDetailsHistory";
import MovementDetailComponent from "./MovementDetailComponent";

const MovementDetails = React.forwardRef<HTMLDivElement, MovementDetailsProps>(
  (
    {
      selectedMovement,
      isMovementDetailsCollapsed,
      setMovementDetailsCollapsed,
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
        setMovementDetailsCollapsed(!isMovementDetailsCollapsed);
      },
      [isMovementDetailsCollapsed, setMovementDetailsCollapsed]
    );

    // Calculate height based on expansion state and mobile view
    const height = useMemo(() => {
      if (isMobile) {
        return isMovementDetailsCollapsed ? "100%" : 640 * 1.33; // Reduced by 25% when expanded
      }
      return "100%";
    }, [isMobile, isMovementDetailsCollapsed]);

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
        overflowX: "hidden", // Ensure no horizontal overflow
        "&::-webkit-scrollbar": {
          display: "none", // Hide scrollbar
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
        <Box sx={{ p: 2.25 }}>
          <Grid container direction="column">
            <Grid item>
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid
                  item
                  sx={{ display: "flex", alignItems: "space-between" }}
                >
                  <Typography variant="h2">
                    {t("movementDetails.title", "Movement Details")}
                  </Typography>
                </Grid>

                <Box sx={{ alignItems: "flex-end", display: "flex" }}>
                  <Tooltip
                    title={
                      isMovementDetailsCollapsed
                        ? t("movementDetails.expandTooltip", "Expand details")
                        : t(
                            "movementDetails.collapseTooltip",
                            "Collapse details"
                          )
                    }
                    arrow
                  >
                    <IconButton
                      onClick={toggleCollapse}
                      aria-label={
                        isMovementDetailsCollapsed
                          ? t("movementDetails.expand", "Expand details")
                          : t("movementDetails.collapse", "Collapse details")
                      }
                      size="large"
                      sx={{ zIndex: 1000 }}
                    >
                      {isMovementDetailsCollapsed ? (
                        <ExpandMoreIcon />
                      ) : (
                        <ExpandLessIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        {/* Collapse the main content, leaving only the title when collapsed */}
        <Collapse in={!isMovementDetailsCollapsed}>
          {selectedMovement && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2} direction={"column"}>
                <Grid item xs={12} md={6}>
                  <MovementDetailComponent
                    detail={{
                      id: selectedMovement.id,
                      dateOfOrder: selectedMovement.dateOfOrder,
                    }}
                    isLoading={isLoading}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MovementDetailsHistory
                    movementDetails={selectedMovement.details}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </Collapse>
      </Paper>
    );
  }
);

export default MovementDetails;
