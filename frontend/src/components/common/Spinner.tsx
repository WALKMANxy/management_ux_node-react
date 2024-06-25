// src/components/common/Spinner.tsx
import React from "react";
import { CircularProgress, Box } from "@mui/material";

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
    />
  </Box>
);

export default Spinner;
