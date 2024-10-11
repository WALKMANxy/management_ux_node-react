// src/components/dashboard/CustomViewSkeleton.tsx
import { Box, Skeleton } from "@mui/material";
import React from "react";

const CustomViewSkeleton: React.FC = () => {
  return (
    <Box mb={4}>
      {/* First Skeleton - height 50 */}
      <Skeleton
        animation="wave"
        variant="rectangular"
        width="100%"
        height={50}
        sx={{ borderRadius: "4px", mb: 2 }}
        aria-label="Skeleton"
      />

      {/* Second Skeleton - height 300 */}
      <Skeleton
        animation="wave"
        variant="rectangular"
        width="100%"
        height={300}
        sx={{ borderRadius: "12px", mb: 2 }}
        aria-label="Skeleton"
      />

      {/* Third Skeleton - height 50 */}
      <Skeleton
        animation="wave"
        variant="rectangular"
        width="100%"
        height={50}
        sx={{ borderRadius: "4px", mb: 2 }}
        aria-label="Skeleton"
      />

      {/* Fourth Skeleton - height 30 */}
      <Skeleton
        animation="wave"
        variant="rectangular"
        width="100%"
        height={30}
        sx={{ borderRadius: "4px", mb: 2 }}
        aria-label="Skeleton"
      />

      {/* Fifth Skeleton - height 300 */}
      <Skeleton
        animation="wave"
        variant="rectangular"
        width="100%"
        height={300}
        sx={{ borderRadius: "12px" }}
        aria-label="Skeleton"
      />
    </Box>
  );
};

export default CustomViewSkeleton;
