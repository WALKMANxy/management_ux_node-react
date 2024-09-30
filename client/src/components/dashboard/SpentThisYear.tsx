// src/components/SpentThisYear.tsx

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Avatar, Box, Grid, Paper, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { ComparisonResult, SpentThisYearProps } from "../../models/propsModels";
import { currencyFormatter } from "../../utils/dataUtils";

const SpentThisYear: React.FC<SpentThisYearProps> = ({
  amount,
  comparison,
  isAgentSelected,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const userRole = useSelector((state: RootState) => state.auth.role);

  const formattedAmount = currencyFormatter(parseFloat(amount));

  /**
   * Determines the comparison result based on the value and user role.
   *
   * @param {number} value - The comparison value.
   * @returns {ComparisonResult} The comparison result object.
   */
  const getComparisonResult = (value: number): ComparisonResult => {
    const isAgentComparison = userRole === "admin" && isAgentSelected;
    const isClientComparison =
      (userRole === "admin" && !isAgentSelected) || userRole === "agent";

    if (isAgentComparison) {
      if (value >= 10) {
        return {
          color: theme.palette.success.main,
          icon: <ArrowUpwardIcon fontSize="inherit" />,
          text: t("spentThisYear.more", "more"),
        };
      } else if (value >= 5) {
        return {
          color: theme.palette.grey[500],
          icon: <ArrowUpwardIcon fontSize="inherit" />,
          text: t("spentThisYear.neutral", "neutral"),
        };
      } else if (value === 0) {
        return {
          color: theme.palette.grey[500],
          icon: <ArrowDownwardIcon fontSize="inherit" />,
          text: t("spentThisYear.even", "neutral"),
        };
      } else {
        return {
          color: theme.palette.error.main,
          icon: <ArrowDownwardIcon fontSize="inherit" />,
          text: t("spentThisYear.less", "less"),
        };
      }
    } else if (isClientComparison) {
      if (value >= 1.25) {
        return {
          color: theme.palette.success.main,
          icon: <ArrowUpwardIcon fontSize="inherit" />,
          text: t("spentThisYear.more", "more"),
        };
      } else if (value > 0.75) {
        return {
          color: theme.palette.grey[500],
          icon: <ArrowUpwardIcon fontSize="inherit" />,
          text: t("spentThisYear.neutral", "neutral"),
        };
      } else if (value === 0) {
        return {
          color: theme.palette.grey[500],
          icon: <ArrowDownwardIcon fontSize="inherit" />,
          text: t("spentThisYear.even", "neutral"),
        };
      } else {
        return {
          color: theme.palette.error.main,
          icon: <ArrowDownwardIcon fontSize="inherit" />,
          text: t("spentThisYear.less", "less"),
        };
      }
    }
    return { color: "", icon: <></>, text: "" };
  };

  const comparisonResult = comparison
    ? getComparisonResult(comparison.value)
    : null;

  const styles = {
    paper: {
      p: 3,
      borderRadius: "12px",
      background: "linear-gradient(135deg, #e3f2fd 30%, #bbdefb 100%)",
      color: "#000",
      position: "relative",
      overflow: "hidden",
      height: "100%",
      "&:after": {
        content: '""',
        position: "absolute",
        width: 210,
        height: 210,
        background: "#43a047", // Dark Green
        borderRadius: "50%",
        top: -85,
        right: -95,
      },
      "&:before": {
        content: '""',
        position: "absolute",
        width: 210,
        height: 210,
        background: "#a5d6a7", // Light Green
        borderRadius: "50%",
        top: -125,
        right: -15,
        opacity: 0.5,
      },
    },
    amount: {
      fontSize: "2.7rem",
      fontWeight: 500,
      mr: 1,
      mt: 1.75,
      mb: 0.75,
      wordBreak: "break-word", // Ensure long amounts wrap
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: 500,
      color: "#000",
      whiteSpace: "normal", // Allow text to wrap
      wordBreak: "break-word", // Ensure long titles wrap
    },
    comparison: {
      fontSize: "1.65rem",
      fontWeight: 500,
      color: "", // Will be set dynamically
      paddingTop: 1,
      wordBreak: "break-word", // Ensure long comparison texts wrap
    },
  };

  return (
    <Paper elevation={3} sx={styles.paper}>
      <Box sx={{ p: 2.25 }}>
        <Grid container direction="column">
          <Grid item>
            <Grid container justifyContent="space-between">
              <Grid item>
                <Avatar
                  variant="rounded"
                  sx={{
                    bgcolor: "#43a047", // Dark Green
                    color: "#000",
                    mt: 1,
                  }}
                >
                  <img
                    src="/icons/moneybag.svg"
                    alt={t("spentThisYear.iconAlt", "Money Bag Icon")}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Avatar>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container alignItems="center">
              <Grid item>
                <Typography sx={styles.amount}>{formattedAmount}</Typography>
              </Grid>
              {userRole !== "client" && comparisonResult && (
                <Grid item>
                  <Tooltip
                    title={`${comparisonResult.text} ${
                      userRole === "admin" && isAgentSelected
                        ? t(
                            "spentThisYear.comparedToOtherAgents",
                            "compared to other agents"
                          )
                        : t(
                            "spentThisYear.comparedToOtherClients",
                            "compared to other clients"
                          )
                    }`}
                    arrow
                  >
                    <Avatar
                      sx={{
                        cursor: "pointer",
                        bgcolor: comparisonResult.color,
                        color: "#000",
                        zIndex: 10,
                        position: "relative",
                      }}
                      aria-label={`Comparison: ${comparisonResult.text}`}
                    >
                      {comparisonResult.icon}
                    </Avatar>
                  </Tooltip>
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid item sx={{ mb: 1.25 }}>
            <Typography sx={styles.title}>
              {t(
                isAgentSelected
                  ? "spentThisYear.titleAgent"
                  : "spentThisYear.titleClient",
                isAgentSelected ? "Earned this year:" : "Spent this year:"
              )}
            </Typography>
            {userRole !== "client" && comparisonResult && (
              <Typography
                sx={{
                  ...styles.comparison,
                  color: comparisonResult.color,
                }}
              >
                {Math.abs(comparison!.value)}% {comparisonResult.text}{" "}
                {userRole === "admin" && isAgentSelected
                  ? t(
                      "spentThisYear.comparedToOtherAgents",
                      "compared to other agents"
                    )
                  : t(
                      "spentThisYear.comparedToOtherClients",
                      "compared to other clients"
                    )}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

// Correct usage of React.memo with export
export default React.memo(SpentThisYear);
