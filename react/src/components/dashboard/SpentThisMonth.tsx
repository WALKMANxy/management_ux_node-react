import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Avatar, Box, Grid, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { currencyFormatter } from "../../utils/dataUtils";
import { ComparisonResult, SpentThisMonthProps } from "../../models/propsModels";



const SpentThisMonth: React.FC<SpentThisMonthProps> = ({
  amount,
  comparison,
  isAgentSelected,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const userRole = useSelector((state: RootState) => state.auth.userRole);

  const formattedAmount = currencyFormatter(parseFloat(amount));

  const getComparisonResult = (value: number): ComparisonResult => {
    const isAgentComparison = userRole === "admin" && isAgentSelected;
    const isClientComparison = (userRole === "admin" && !isAgentSelected) || userRole === "agent";

    if (isAgentComparison) {
      if (value >= 10) return { color: theme.palette.success.main, icon: <ArrowUpwardIcon fontSize="inherit" />, text: t("more") };
      if (value >= 5) return { color: theme.palette.grey[500], icon: <ArrowUpwardIcon fontSize="inherit" />, text: t("neutral") };
      return { color: theme.palette.error.main, icon: <ArrowDownwardIcon fontSize="inherit" />, text: t("less") };
    } else if (isClientComparison) {
      if (value >= 1.25) return { color: theme.palette.success.main, icon: <ArrowUpwardIcon fontSize="inherit" />, text: t("more") };
      if (value > 0.75) return { color: theme.palette.grey[500], icon: <ArrowUpwardIcon fontSize="inherit" />, text: t("neutral") };
      return { color: theme.palette.error.main, icon: <ArrowDownwardIcon fontSize="inherit" />, text: t("less") };
    }
    return { color: "", icon: <></>, text: "" };
  };

  const comparisonResult = comparison ? getComparisonResult(comparison.value) : null;

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
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: 500,
      color: "#000",
    },
    comparison: {
      fontSize: "1.65rem",
      fontWeight: 500,
      paddingTop: 1,
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
                    alt={t("spentThisMonth.iconAlt")}
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
            <Typography sx={styles.title}>{t("spentThisMonth.title")}</Typography>
            {userRole !== "client" && comparisonResult && (
              <Typography sx={{ ...styles.comparison, color: comparisonResult.color }}>
                {Math.abs(comparison!.value)}% {comparisonResult.text}{" "}
                {userRole === "admin" && isAgentSelected
                  ? t("comparedToOtherAgents")
                  : t("comparedToOtherClients")}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SpentThisMonth; React.memo(SpentThisMonth);