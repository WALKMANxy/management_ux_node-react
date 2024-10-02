// src/components/movementpage/MovementDetailComponent.tsx

import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { Box, Grid, Skeleton, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MovementProp } from "../../models/propsModels";

/**
 * DetailValue Type
 * Represents the possible types of detail values.
 */
type DetailValue = string | number | undefined;

/**
 * MovementDetailComponent Props Interface
 */
interface MovementDetailComponentProps {
  detail: MovementProp["detail"];
  isLoading: boolean;
}

/**
 * MovementDetailComponent
 * Displays various movement details with corresponding icons and formatted values.
 *
 * @param {MovementDetailComponentProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
const MovementDetailComponent: React.FC<MovementDetailComponentProps> = ({
  detail,
  isLoading,
}) => {
  const { t } = useTranslation();

  // Keys to exclude from rendering (if any)
  const excludedKeys: (keyof MovementProp["detail"])[] = [
    // Add keys to exclude if necessary
  ];

  // Mapping of detail keys to their display labels with translations
  const keyMap: { [K in keyof MovementProp["detail"]]?: string } = {
    id: t("movementDetails.id", "ID"),
    dateOfOrder: t("movementDetails.dateOfOrder", "Date of Order"),
    description: t("movementDetails.description", "Description"),
    // Add more mappings as necessary
  };

  // Mapping of detail keys to corresponding icons
  const icons: { [key: string]: JSX.Element } = {
    id: <FingerprintIcon />,
    dateOfOrder: <CalendarTodayIcon />,
    description: <DescriptionIcon />,
    // Add more icons as necessary
  };

  /**
   * Formats the date to the desired format.
   *
   * @param {string | number} value - The date value to format.
   * @returns {string} The formatted date string.
   */
  const formatDate = (value: string | number): string => {
    return dayjs(value).format("DD/MM/YYYY");
  };

  /**
   * Renders the value for a given detail key with appropriate formatting and links.
   *
   * @param {keyof MovementProp["detail"]} key - The detail key.
   * @param {DetailValue} value - The detail value.
   * @returns {React.ReactNode} The rendered value.
   */
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
      // Add more cases if specific formatting is needed
      default:
        return value;
    }
  };

  /**
   * Memoized list of detail keys to render, excluding certain keys.
   */
  const detailKeys = useMemo(() => {
    return Object.keys(detail) as Array<keyof MovementProp["detail"]>;
  }, [detail]);

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: "30px",
        background: "rgba(255, 255, 255, 0.7)", // Frosted glass effect
        backdropFilter: "blur(10px)", // Frosted glass effect
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
