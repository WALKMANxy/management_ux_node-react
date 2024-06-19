// src/components/common/DetailComponent.tsx
import React from "react";
import { Box, Typography } from "@mui/material";

interface DetailProps {
  detail: { [key: string]: any };
}

const DetailComponent: React.FC<DetailProps> = ({ detail }) => {
  return (
    <Box>
      {Object.keys(detail).map((key) => (
        <Typography key={key} variant="body1">
          <strong>{key}:</strong> {detail[key]}
        </Typography>
      ))}
    </Box>
  );
};

export default DetailComponent;
