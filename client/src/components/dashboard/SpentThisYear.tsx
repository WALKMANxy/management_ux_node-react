import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Avatar, Box, Grid, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { SpentThisYearProps } from "../../models/propsModels";
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

  let comparisonColor;
  let comparisonIcon;
  let comparisonText;

  if (comparison) {
    const isAgentComparison = userRole === "admin" && isAgentSelected;
    const isClientComparison =
      (userRole === "admin" && !isAgentSelected) || userRole === "agent";

    if (isAgentComparison) {
      if (comparison.value >= 10) {
        comparisonColor = theme.palette.success.main;
        comparisonIcon = <ArrowUpwardIcon fontSize="inherit" />;
        comparisonText = t("more");
      } else if (comparison.value >= 5) {
        comparisonColor = theme.palette.grey[500];
        comparisonIcon = <ArrowUpwardIcon fontSize="inherit" />;
        comparisonText = t("neutral");
      } else {
        comparisonColor = theme.palette.error.main;
        comparisonIcon = <ArrowDownwardIcon fontSize="inherit" />;
        comparisonText = t("less");
      }
    } else if (isClientComparison) {
      if (comparison.value >= 1.25) {
        comparisonColor = theme.palette.success.main;
        comparisonIcon = <ArrowUpwardIcon fontSize="inherit" />;
        comparisonText = t("more");
      } else if (comparison.value > 0.75) {
        comparisonColor = theme.palette.grey[500];
        comparisonIcon = <ArrowUpwardIcon fontSize="inherit" />;
        comparisonText = t("neutral");
      } else {
        comparisonColor = theme.palette.error.main;
        comparisonIcon = <ArrowDownwardIcon fontSize="inherit" />;
        comparisonText = t("less");
      }
    }
  }

  return (
    <Paper
      elevation={3}
      sx={{
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
                    bgcolor: "#43a047", // Dark Green
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
                    fontSize: "2.7rem",
                    fontWeight: 500,
                    mr: 1,
                    mt: 1.75,
                    mb: 0.75,
                    zIndex: 10,
                    position: "relative"
                  }}
                >
                  {formattedAmount}
                </Typography>
              </Grid>
              {userRole !== "client" && comparison && comparisonIcon && (
                <Grid item>
                  <Avatar
                    sx={{
                      cursor: "pointer",
                      bgcolor: comparisonColor,
                      color: "#000",
                      zIndex: 10,
                    position: "relative"
                    }}
                  >
                    {comparisonIcon}
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
              {t(
                isAgentSelected
                  ? "spentThisYear.titleAgent"
                  : "spentThisYear.titleClient"
              )}
            </Typography>
            {userRole !== "client" && comparison && (
              <Typography
                sx={{
                  fontSize: "1.65rem", // 10% larger than the original 1.5rem
                  fontWeight: 500,
                  color: comparisonColor,
                  paddingTop: 1, // Added padding for spacing
                }}
              >
                {Math.abs(comparison.value)}% {comparisonText}{" "}
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
