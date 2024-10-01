import React from "react";
import { Paper, Box, Typography } from "@mui/material";

const WeatherComponent: React.FC = () => {
  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: "12px" }}>
      <Box>
        <Typography variant="h6">Weather</Typography>
        <Typography variant="body2">Weather information coming soon...</Typography>
      </Box>
    </Paper>
  );
};

export default React.memo(WeatherComponent);
