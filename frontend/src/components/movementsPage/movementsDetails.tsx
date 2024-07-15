// src/components/movementspage/MovementDetails.tsx
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { MovementDetailsProps } from "../../models/models";
import MovementsHistory from "../statistics/grids/MovementsHistory";
import DetailComponent from "../clientpage/DetailComponent";

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
        <Box sx={{ p: 2.25 }}>
          <Grid container direction="column">
            <Grid item>
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="h2">
                    {t('movementDetails.title')}
                  </Typography>
                </Grid>
                <Grid item>
                  <IconButton
                    onClick={() =>
                      setMovementDetailsCollapsed(!isMovementDetailsCollapsed)
                    }
                  >
                    {isMovementDetailsCollapsed ? (
                      <ExpandMoreIcon />
                    ) : (
                      <ExpandLessIcon />
                    )}
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        <Collapse in={!isMovementDetailsCollapsed}>
          {selectedMovement ? (
            <Box sx={{ p: 2 }}>
              <Grid
                container
                spacing={2}
                direction={isMobile ? "column" : "row"}
              >
                <Grid item xs={12}>
                  <MovementsHistory movements={[selectedMovement]} />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}></Box>
          )}
        </Collapse>
      </Paper>
    );
  }
);

export default MovementDetails;

