// src/components/movementpage/MovementDetailComponent.tsx
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { Box, Grid, Skeleton, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MovementProp } from "../../models/propsModels";

type DetailValue = string | number | undefined;

interface MovementDetailComponentProps {
  detail: MovementProp["detail"];
  isLoading: boolean;
}

const MovementDetailComponent: React.FC<MovementDetailComponentProps> = ({
  detail,
  isLoading,
}) => {
  const { t } = useTranslation();

  // Keys to exclude from rendering (if any)
  const excludedKeys: (keyof MovementProp["detail"])[] = [];

  // Mapping of detail keys to their display labels with translations
  const keyMap: { [K in keyof MovementProp["detail"]]?: string } = {
    id: t("movementDetails.id", "ID"),
    dateOfOrder: t("movementDetails.dateOfOrder", "Date of Order"),
    description: t("movementDetails.description", "Description"),
  };

  // Mapping of detail keys to corresponding icons
  const icons: { [key: string]: JSX.Element } = {
    id: <FingerprintIcon />,
    dateOfOrder: <CalendarTodayIcon />,
    description: <DescriptionIcon />,
  };

  const formatDate = (value: string | number): string => {
    return dayjs(value).format("DD/MM/YYYY");
  };

  const renderValue = (
    key: keyof MovementProp["detail"],
    value: DetailValue
  ): React.ReactNode => {
    if (isLoading) {
      return <Skeleton width="80%" />;
    }

    if (value === undefined || value === null || value === "") {
      return (
        <Typography variant="body2" color="textSecondary" component="span">
          -
        </Typography>
      );
    }

    switch (key) {
      case "dateOfOrder":
        return formatDate(value);
      default:
        return value;
    }
  };

  const detailKeys = useMemo(() => {
    return Object.keys(detail) as Array<keyof MovementProp["detail"]>;
  }, [detail]);

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: "30px",
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Grid container spacing={2}>
        {detailKeys.map((key) => {
          if (excludedKeys.includes(key)) return null;

          const value = detail[key] as DetailValue;
          const displayKey = keyMap[key] || key;

          const displayValue = renderValue(key, value);

          return (
            <Grid item xs={12} sm={6} key={key} p={1}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {icons[key] && (
                  <Tooltip title={displayKey} arrow>
                    <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                      {icons[key]}
                    </Box>
                  </Tooltip>
                )}
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

export default React.memo(MovementDetailComponent);
