// src/components/visitPage/SkeletonClientDetailsCard.tsx

import { Box, Card, CardContent, Skeleton, Stack } from "@mui/material";
import React from "react";

const SkeletonClientDetailsCard: React.FC = () => {
  return (
    <Box sx={{ m: 2 }}>
      <Card
        sx={{
          p: 2,
          borderRadius: 4,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          height: 300,
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            {/* Avatar Skeleton */}
            <Skeleton variant="circular" width={56} height={56} />

            {/* Client Information Skeleton */}
            <Box>
              <Skeleton variant="text" width={120} height={24} />
              <Skeleton variant="text" width={180} height={20} />
              <Skeleton variant="text" width={140} height={20} />
              <Skeleton variant="text" width={160} height={20} />
              <Skeleton variant="text" width={120} height={20} />
            </Box>
          </Box>
        </CardContent>
      </Card>

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

export default SkeletonClientDetailsCard;
