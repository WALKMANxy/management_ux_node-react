import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import { Box, Grid, Skeleton, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DetailProps } from "../../models/propsModels";

const MovementDetailComponent: React.FC<DetailProps> = ({
  detail,
  isLoading,
}) => {
  const { t, i18n } = useTranslation();

  const keyMap: { [key: string]: string } = useMemo(() => {
    return {
      id: t("details.id"),
      dateOfOrder: t("details.dateOfOrder"),
    };
  }, [t]);

  const icons: { [key: string]: JSX.Element } = useMemo(() => {
    return {
      id: <PersonIcon />,
      dateOfOrder: <CalendarTodayIcon />,
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Box
      sx={{ p: 3, borderRadius: "30px", background: "transparent" }}
      role="region"
      aria-label={t("details.ariaLabel")}
    >
      <Grid container spacing={2}>
        {Object.entries(detail).map(([key, value]) => {
          const displayKey = keyMap[key] || key;
          const displayValue = isLoading ? (
            <Skeleton width="80%" />
          ) : key === "dateOfOrder" ? (
            formatDate(value)
          ) : (
            value
          );

          return (
            <Grid item xs={12} sm={6} key={key}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {icons[key] && (
                  <Box sx={{ mr: 1 }} aria-hidden="true">
                    {icons[key]}
                  </Box>
                )}
                <Typography variant="body1">
                  <strong id={`label-${key}`}>{displayKey}:</strong>{" "}
                  <span aria-labelledby={`label-${key}`}>{displayValue}</span>
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
React.memo(MovementDetailComponent);
