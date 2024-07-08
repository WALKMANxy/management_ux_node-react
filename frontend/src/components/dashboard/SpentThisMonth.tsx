import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Avatar, Box, Grid, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { SpentThisMonthProps } from "../../models/models";
import { currencyFormatter } from "../../utils/dataUtils";

const SpentThisMonth: React.FC<SpentThisMonthProps> = ({ amount, comparison }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const userRole = useSelector((state: RootState) => state.auth.userRole);

  const formattedAmount = currencyFormatter(parseFloat(amount));

  let comparisonColor;
  let comparisonIcon;
  let comparisonText;

  if (comparison) {
    if (comparison.value > 1) {
      comparisonColor = theme.palette.success.main;
      comparisonIcon = <ArrowUpwardIcon fontSize="inherit" />;
      comparisonText = t('more');
    } else if (comparison.value < -1) {
      comparisonColor = theme.palette.error.main;
      comparisonIcon = <ArrowDownwardIcon fontSize="inherit" />;
      comparisonText = t('less');
    } else {
      comparisonColor = theme.palette.grey[500];
      comparisonIcon = null;
      comparisonText = '';
    }
  }

  return (
    <Paper
      elevation={3}
      sx={{
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
                    bgcolor: theme.palette.secondary.main,
                    color: "#000",
                    mt: 1,
                  }}
                >
                  <img
                    src="/icons/money.svg"
                    alt={t('spentThisMonth.iconAlt')}
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
              {t('spentThisMonth.title')}
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
                {Math.abs(comparison.value)}% {comparisonText} {userRole === 'admin' ? t('comparedToOtherAgents') : t('comparedToOtherClients')}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SpentThisMonth;
