// src/components/common/Spinner.tsx
import { Box, CircularProgress } from "@mui/material";
import React from "react";

const Spinner: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="100%"
    padding={"10px"}
  >
    <CircularProgress
      variant="indeterminate"
      sx={{
        color: (theme) =>
          theme.palette.grey[theme.palette.mode === "dark" ? 200 : 800],
      }}
      size={40}
      thickness={4}
      value={100}
      aria-label="indeterminate-spinner"
    />
  </Box>
);

export default Spinner;
