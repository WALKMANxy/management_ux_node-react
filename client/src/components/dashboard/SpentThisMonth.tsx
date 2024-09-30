// src/components/SpentThisMonth.tsx

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Avatar, Box, Grid, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  ComparisonResult,
  SpentThisMonthProps,
} from "../../models/propsModels";
import { currencyFormatter } from "../../utils/dataUtils";

const SpentThisMonth: React.FC<SpentThisMonthProps> = ({
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
      if (value >= 10)
        return {
          color: theme.palette.success.main,
          icon: <ArrowUpwardIcon fontSize="inherit" />,
          text: t("spentThisMonth.more", "more"),
        };
      if (value >= 5)
        return {
          color: theme.palette.grey[500],
          icon: <ArrowUpwardIcon fontSize="inherit" />,
          text: t("spentThisMonth.neutral", "neutral"),
        };
      if (value === 0)
        return {
          color: theme.palette.grey[500],
          icon: <ArrowDownwardIcon fontSize="inherit" />,
          text: t("spentThisMonth.even", "neutral"),
        };
      return {
        color: theme.palette.error.main,
        icon: <ArrowDownwardIcon fontSize="inherit" />,
        text: t("spentThisMonth.less", "less"),
      };
    } else if (isClientComparison) {
      if (value >= 1.25)
        return {
          color: theme.palette.success.main,
          icon: <ArrowUpwardIcon fontSize="inherit" />,
          text: t("spentThisMonth.more", "more"),
        };
      if (value > 0.75)
        return {
          color: theme.palette.grey[500],
          icon: <ArrowUpwardIcon fontSize="inherit" />,
          text: t("spentThisMonth.neutral", "neutral"),
        };
      if (value === 0)
        return {
          color: theme.palette.grey[500],
          icon: <ArrowDownwardIcon fontSize="inherit" />,
          text: t("spentThisMonth.even", "neutral"),
        };
      return {
        color: theme.palette.error.main,
        icon: <ArrowDownwardIcon fontSize="inherit" />,
        text: t("spentThisMonth.less", "less"),
      };
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
      background: "linear-gradient(135deg, #ffebee 30%, #ffcdd2 100%)",
      color: "#000",
      position: "relative",
      overflow: "hidden",
      height: "100%",
      "&:after": {
        content: '""',
        position: "absolute",
        width: 210,
        height: 210,
        background: theme.palette.secondary.main,
        borderRadius: "50%",
        top: -85,
        right: -95,
      },
      "&:before": {
        content: '""',
        position: "absolute",
        width: 210,
        height: 210,
        background: theme.palette.secondary.main,
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
                    bgcolor: theme.palette.secondary.main,
                    color: "#000",
                    mt: 1,
                  }}
                >
                  <img
                    src="/icons/money.svg"
                    alt={t("spentThisMonth.iconAlt", "Money Icon")}
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
                  <Avatar
                    sx={{
                      cursor: "pointer",
                      bgcolor: comparisonResult.color,
                      color: "#000",
                    }}
                    aria-label={`Comparison: ${comparisonResult.text}`}
                  >
                    {comparisonResult.icon}
                  </Avatar>
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid item sx={{ mb: 1.25 }}>
            <Typography sx={styles.title}>
              {t(
                isAgentSelected
                  ? "spentThisMonth.titleAgent"
                  : "spentThisMonth.titleClient",
                isAgentSelected ? "Earned this month:" : "Spent this month:"
              )}
            </Typography>
            {userRole !== "client" && comparisonResult && (
              <Typography
                sx={{ ...styles.comparison, color: comparisonResult.color }}
              >
                {Math.abs(comparison!.value)}% {comparisonResult.text}{" "}
                {userRole === "admin" && isAgentSelected
                  ? t(
                      "spentThisMonth.comparedToOtherAgents",
                      "compared to other agents"
                    )
                  : t(
                      "spentThisMonth.comparedToOtherClients",
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
export default React.memo(SpentThisMonth);
