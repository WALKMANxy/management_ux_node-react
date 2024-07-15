// src/components/movementpage/MovementDetailComponent.tsx
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import { Box, Grid, Skeleton, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { DetailProps } from "../../models/models";

const MovementDetailComponent: React.FC<DetailProps> = ({ detail, isLoading }) => {
  const { t } = useTranslation();

  const keyMap: { [key: string]: string } = {
    id: t("details.id"),
    dateOfOrder: t("details.dateOfOrder"),
  };

  const icons: { [key: string]: JSX.Element } = {
    id: <PersonIcon />,
    dateOfOrder: <CalendarTodayIcon />,
  };

  return (
    <Box sx={{ p: 3, borderRadius: "30px", background: "transparent" }}>
      <Grid container spacing={2}>
        {Object.entries(detail).map(([key, value]) => {
          const displayKey = keyMap[key] || key;
          const displayValue = isLoading ? (
            <Skeleton width="80%" />
          ) : (
            key === "dateOfOrder" ? new Date(value).toLocaleDateString() : value
          );

          return (
            <Grid item xs={12} sm={6} key={key} p={1}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {icons[key] && <Box sx={{ mr: 1 }}>{icons[key]}</Box>}
                <Typography variant="body1">
                  <strong>{displayKey}:</strong> {displayValue}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default MovementDetailComponent;
