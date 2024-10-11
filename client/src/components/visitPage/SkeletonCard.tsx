// src/components/visitPage/SkeletonClientDetailsCard.tsx

import { Box, Skeleton } from "@mui/material";
import React from "react";

const SkeletonCard: React.FC = () => {
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
    </Box>
  );
};

export default SkeletonCard;
