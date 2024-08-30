import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Avatar, Box, Grid, Paper, Typography } from "@mui/material";
import { Theme, useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  ComparisonDetails,
  SpentThisYearProps,
} from "../../models/propsModels";
import { currencyFormatter } from "../../utils/dataUtils";

const AGENT_HIGH_THRESHOLD = 10;
const AGENT_NEUTRAL_THRESHOLD = 5;
const CLIENT_HIGH_THRESHOLD = 1.1;
const CLIENT_NEUTRAL_THRESHOLD = 0.75;

const getComparisonDetails = (
  comparison: number,
  isAgentComparison: boolean,
  theme: Theme,
  t: (key: string) => string
): ComparisonDetails => {
  if (isAgentComparison) {
    if (comparison >= AGENT_HIGH_THRESHOLD) {
      return {
        color: theme.palette.success.main,
        icon: <ArrowUpwardIcon fontSize="inherit" />,
        text: t("more"),
      };
    } else if (comparison >= AGENT_NEUTRAL_THRESHOLD) {
      return {
        color: theme.palette.grey[500],
        icon: <ArrowUpwardIcon fontSize="inherit" />,
        text: t("neutral"),
      };
    } else {
      return {
        color: theme.palette.error.main,
        icon: <ArrowDownwardIcon fontSize="inherit" />,
        text: t("less"),
      };
    }
  } else {
    if (comparison >= CLIENT_HIGH_THRESHOLD) {
      return {
        color: theme.palette.success.main,
        icon: <ArrowUpwardIcon fontSize="inherit" />,
        text: t("more"),
      };
    } else if (comparison > CLIENT_NEUTRAL_THRESHOLD) {
      return {
        color: theme.palette.grey[500],
        icon: <ArrowUpwardIcon fontSize="inherit" />,
        text: t("neutral"),
      };
    } else {
      return {
        color: theme.palette.error.main,
        icon: <ArrowDownwardIcon fontSize="inherit" />,
        text: t("less"),
      };
    }
  }
};

const SpentThisYear: React.FC<SpentThisYearProps> = ({
  amount,
  comparison,
  isAgentSelected,
  backgroundColor = "linear-gradient(135deg, #e3f2fd 30%, #bbdefb 100%)",
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const userRole = useSelector((state: RootState) => state.auth.role);

  if (!amount || isNaN(parseFloat(amount))) {
    return <Typography>Invalid amount data</Typography>;
  }

  const formattedAmount = currencyFormatter(parseFloat(amount));

  const comparisonDetails = comparison
    ? getComparisonDetails(
        comparison.value,
        userRole === "admin" && isAgentSelected,
        theme,
        t
      )
    : null;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: "12px",
        background: backgroundColor,
        color: "#000",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        "&:after": {
          content: '""',
          position: "absolute",
          width: 210,
          height: 210,
          background: "#43a047",
          borderRadius: "50%",
          top: -85,
          right: -95,
        },
        "&:before": {
          content: '""',
          position: "absolute",
          width: 210,
          height: 210,
          background: "#a5d6a7",
          borderRadius: "50%",
          top: -125,
          right: -15,
          opacity: 0.5,
        },
      }}
    >
      <Box sx={{ p: 2.25 }}>
        <Grid container direction="column">
          <Grid item>
            <Grid container justifyContent="space-between">
              <Grid item>
                <Avatar
                  variant="rounded"
                  sx={{
                    bgcolor: "#43a047",
                    color: "#000",
                    mt: 1,
                  }}
                >
                  <img
                    src="/icons/moneybag.svg"
                    alt={t("spentThisYear.iconAlt")}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Avatar>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container alignItems="center">
              <Grid item>
                <Typography
                  sx={{
                    fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.7rem" },
                    fontWeight: 500,
                    mr: 1,
                    mt: 1.75,
                    mb: 0.75,
                  }}
                >
                  {formattedAmount}
                </Typography>
              </Grid>
              {userRole !== "client" && comparisonDetails && (
                <Grid item>
                  <Avatar
                    sx={{
                      cursor: "pointer",
                      bgcolor: comparisonDetails.color,
                      color: "#000",
                    }}
                    aria-label={`${comparisonDetails.text} ${t("comparedTo")}`}
                  >
                    {comparisonDetails.icon}
                  </Avatar>
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid item sx={{ mb: 1.25 }}>
            <Typography
              sx={{
                fontSize: "1.5rem",
                fontWeight: 500,
                color: "#000",
              }}
            >
              {t("spentThisYear.title")}
            </Typography>
            {userRole !== "client" && comparisonDetails && comparison && (
              <Typography
                sx={{
                  fontSize: "1.65rem",
                  fontWeight: 500,
                  color: comparisonDetails.color,
                  paddingTop: 1,
                }}
              >
                {Math.abs(comparison.value)}% {comparisonDetails.text}{" "}
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

export default SpentThisYear;
React.memo(SpentThisYear);
