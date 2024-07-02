// src/components/common/DetailComponent.tsx
import React from "react";
import { Typography, Grid, Card, CardContent } from "@mui/material";

interface DetailProps {
  detail: { [key: string]: any };
}

const DetailComponent: React.FC<DetailProps> = ({ detail }) => {
  const excludedKeys = ["id", "agent", "movements", "promos"];

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>Client Details</Typography>
        <Grid container spacing={2}>
          {Object.keys(detail).map((key) =>
            !excludedKeys.includes(key) ? (
              <Grid item xs={12} sm={6} key={key}>
                <Typography variant="body1">
                  <strong>{key}:</strong> {detail[key]}
                </Typography>
              </Grid>
            ) : null
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DetailComponent;
