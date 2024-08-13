import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import { Avatar, Box, Grid, Paper, Typography } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { TotalEarningProps } from "../../models/propsModels";
import { currencyFormatter } from "../../utils/dataUtils";

const TotalEarning: React.FC<TotalEarningProps> = ({ totalEarning }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const formattedEarning = currencyFormatter(totalEarning);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: "12px",
        background: "linear-gradient(135deg, #fffde7 30%, #fff9c4 100%)",
        color: theme.palette.text.primary,
        position: "relative",
        overflow: "hidden",
        height: "100%",
        "&::after, &::before": {
          content: '""',
          position: "absolute",
          width: 210,
          height: 210,
          background: theme.palette.secondary.main,
          borderRadius: "50%",
        },
        "&::after": {
          top: -85,
          right: -95,
        },
        "&::before": {
          top: -125,
          right: -15,
          opacity: 0.5,
        },
      }}
    >
      <Box sx={{ p: 2.25 }}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: theme.palette.secondary.main,
                color: theme.palette.secondary.contrastText,
              }}
            >
              <img
                src="/icons/earning.svg"
                alt="Earning Icon"
                style={{ width: "100%", height: "100%" }}
              />
            </Avatar>
          </Grid>
          <Grid item>
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <Typography
                  variant="h3"
                  component="div"
                  sx={{ fontWeight: 500 }}
                >
                  {formattedEarning}
                </Typography>
              </Grid>
              <Grid item>
                <Avatar
                  sx={{
                    cursor: "pointer",
                    bgcolor: theme.palette.secondary.light,
                    color: theme.palette.secondary.contrastText,
                  }}
                >
                  <ArrowUpwardIcon
                    fontSize="inherit"
                    sx={{ transform: "rotate(45deg)" }}
                  />
                </Avatar>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Typography
              variant="h5"
              component="div"
              sx={{ fontWeight: 500 }}
            >
              {t("dashboard.totalEarning")}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TotalEarning;