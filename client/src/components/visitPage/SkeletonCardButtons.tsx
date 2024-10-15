// src/components/visitPage/SkeletonClientDetailsCard.tsx

import { Box, Skeleton, Stack } from "@mui/material";
import React from "react";

const SkeletonCardButtons: React.FC = () => {
  return (
    <Box sx={{ m: 2 }}>
      <Skeleton
        animation="wave"
        variant="rectangular"
        width="100%"
        height={300}
        sx={{ borderRadius: "12px", mb: 2 }}
        aria-label="Skeleton"
      ></Skeleton>

      {/* Action Buttons Skeleton */}
      <Box sx={{ p: 2 }}>
        <Stack
          direction={"row"}
          spacing={2}
          justifyContent="flex-end"
          sx={{ pt: 1, mr: -2 }}
        >
          <Skeleton variant="rounded" width={48} height={48} />
          <Skeleton variant="rounded" width={48} height={48} />
        </Stack>
      </Box>
    </Box>
  );
};

export default SkeletonCardButtons;
