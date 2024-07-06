import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Avatar, Box, Grid, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { SpentThisYearProps } from "../../models/models";
import { currencyFormatter } from "../../utils/dataUtils"; // Import the currency formatter

const SpentThisYear: React.FC<SpentThisYearProps> = ({ amount, comparison }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const userRole = useSelector((state: RootState) => state.auth.userRole);

  const formattedAmount = currencyFormatter(parseFloat(amount));

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
                    alt={t('spentThisYear.iconAlt')}
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
              {userRole === "admin" && comparison && (
                <Grid item>
                  <Avatar
                    sx={{
                      cursor: "pointer",
                      bgcolor: comparison.trend === "up" ? theme.palette.success.light : theme.palette.error.light,
                      color: "#000",
                    }}
                  >
                    <ArrowUpwardIcon
                      fontSize="inherit"
                      sx={{ transform: "rotate3d(1, 1, 1, 45deg)" }}
                    />
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
              {t('spentThisYear.title')}
            </Typography>
            {userRole === "admin" && comparison && (
              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: 400,
                  color: comparison.trend === "up" ? theme.palette.success.main : theme.palette.error.main,
                }}
              >
                {comparison.value}% {t('comparedToOtherAgents')}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SpentThisYear;
