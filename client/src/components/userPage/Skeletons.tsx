import { Box, Skeleton } from "@mui/material";

// 1. AppSettingsSkeleton
export const AppSettingsSkeleton = () => (
  <Box display="flex" flexDirection="column" gap={2} width="100%">
    <Skeleton
      variant="text"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={50}
      width="100%"
    />
    <Skeleton
      variant="rectangular"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={125}
      width="100%"
    />
    <Skeleton
      variant="rectangular"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={125}
      width="100%"
    />
  </Box>
);

// 2. ManageUsersSkeleton
export const ManageUsersSkeleton = () => (
  <Box display="flex" flexDirection="column" gap={2} width="100%">
    <Skeleton
      variant="text"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={50}
      width="100%"
    />
    <Skeleton
      variant="text"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={25}
      width="100%"
    />
    <Skeleton
      variant="rectangular"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={175}
      width="100%"
    />
  </Box>
);

// 3. ExtendedManageUsersSkeleton
export const ExtendedManageUsersSkeleton = () => (
  <Box display="flex" flexDirection="column" gap={2} width="100%">
    {/* Small Rounded Skeleton */}
    <Box display="flex" alignItems="center" gap={2}>
      <Skeleton variant="circular" height={25} width={25} />
      {/* You can add more elements here if needed */}
    </Box>
    {/* Other Skeletons */}
    <Skeleton
      variant="rectangular"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={150}
      width="100%"
    />
    <Skeleton
      variant="text"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={25}
      width="100%"
    />
    <Skeleton
      variant="text"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={40}
      width="100%"
    />
    <Skeleton
      variant="text"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={25}
      width="100%"
    />
    <Skeleton
      variant="text"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={40}
      width="100%"
    />
    <Skeleton
      variant="rectangular"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={500}
      width="100%"
    />
    <Skeleton
      variant="text"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={30}
      width="100%"
    />
  </Box>
);

// 4. ManageEntitiesSkeleton
export const ManageEntitiesSkeleton = () => (
  <Box display="flex" flexDirection="column" gap={2} width="100%">
    <Skeleton
      variant="text"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={50}
      width="100%"
    />
    <Skeleton
      variant="text"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={20}
      width="100%"
    />
    <Skeleton
      variant="text"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={40}
      width="100%"
    />
    <Skeleton
      variant="text"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={50}
      width="100%"
    />
    <Skeleton
      variant="rectangular"
      animation="wave"
      sx={{ borderRadius: "4px" }}
      height={500}
      width="100%"
    />
  </Box>
);
