// src/components/dashboard/SkeletonDetails.tsx
import {
  Box,
  Collapse,
  Grid,
  Paper,
  Skeleton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useMemo } from "react";

const SkeletonDetails: React.FC = () => {

  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width:600px)");

  const height = useMemo(() => {
    if (isMobile) {
      return "100%";
    }
    return "100%";
  }, [isMobile]);

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
    <Paper elevation={3} sx={paperStyles}>
      {/* Header Section with Skeleton */}
      <Box sx={{ p: 2.25 }}>
        <Grid container direction="column">
          <Grid item>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Skeleton
                  animation="wave"
                  variant="text"
                  width={200}
                  height={40}
                  sx={{ borderRadius: "4px" }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Collapsible Content with Skeletons */}
      <Collapse in={true}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} direction={"column"}>
            {/* Article Details Skeleton */}
            <Grid item xs={12} md={6}>
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="100%"
                height={150}
                sx={{ borderRadius: "12px" }}
              />
            </Grid>

            {/* Article History Skeleton */}
            <Grid item xs={12} md={6}>
              <Skeleton
                animation="wave"
                variant="rectangular"
                width="100%"
                height={150}
                sx={{ borderRadius: "12px" }}
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default SkeletonDetails;
