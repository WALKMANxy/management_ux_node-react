// src/components/dashboard/ClientViewSkeleton.tsx
import { Box, Grid, Skeleton, useMediaQuery, useTheme } from "@mui/material";
import React from "react";

const ClientViewSkeleton: React.FC = () => {
  const theme = useTheme();
  const isTablet = useMediaQuery("(min-width:900px) and (max-width:1250px)");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box mb={4}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Skeleton
          animation="wave"
          variant="text"
          width="50%"
          height={30}
          sx={{ borderRadius: "4px" }}
          aria-label="Skeleton"
        />
        {isTablet && (
          <Skeleton
            animation="wave"
            variant="circular"
            width={40}
            height={40}
            sx={{
              borderRadius: "50%",
              zIndex: 1000,
            }}
            aria-label="Skeleton"
          />
        )}
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height={300}
            sx={{ borderRadius: "12px" }}
            aria-label="Skeleton"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height={300}
            sx={{ borderRadius: "12px" }}
            aria-label="Skeleton"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height={300}
            sx={{ borderRadius: "12px" }}
            aria-label="Skeleton"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height={300}
            sx={{ borderRadius: "12px" }}
            aria-label="Skeleton"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height={300}
            sx={{ borderRadius: "12px" }}
            aria-label="Skeleton"
          />
        </Grid>
      </Grid>
      <Box pt={2.5}>
        <Skeleton
          animation="wave"
          variant="rectangular"
          width="100%"
          height={300}
          sx={{ borderRadius: "12px" }}
          aria-label="Skeleton"
        />
      </Box>
      {/* Skeleton FAB */}
      <Skeleton
        animation="wave"
        variant="circular"
        width={40}
        height={40}
        sx={{
          borderRadius: "50%",
          position: "fixed",
          bottom: isMobile ? 10 : 16,
          right: isMobile ? 5 : 16,
          zIndex: 1300,
        }}
        aria-label="Skeleton"
      />
    </Box>
  );
};

export default ClientViewSkeleton;
