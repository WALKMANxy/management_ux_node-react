// src/components/TotalEarning.tsx
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

import { Avatar, Box, Grid, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { TotalEarningProps } from "../../models/propsModels";
import { currencyFormatter } from "../../utils/dataUtils";

const TotalEarning: React.FC<TotalEarningProps> = ({
  totalGross,
  totalNet,
}) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const formattedGross = currencyFormatter(totalGross);
  const formattedNet = currencyFormatter(totalNet);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: "12px",
        background: "linear-gradient(135deg, #fffde7 30%, #fff9c4 100%)",
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
      <Box sx={{ p: 2 }}>
        <Grid container direction="column" spacing={2}>
          {/* Icon Section */}
          <Grid item>
            <Grid container justifyContent="flex-start">
              <Avatar
                variant="rounded"
                sx={{
                  bgcolor: theme.palette.secondary.main,
                  color: "#000",
                  mt: 0,
                }}
              >
                <img
                  src="/icons/earning.svg"
                  alt={t("dashboard.earningIconAlt")}
                  style={{ width: "100%", height: "100%" }}
                />
              </Avatar>
            </Grid>
          </Grid>

          {/* Gross Earnings Section */}
          <Grid item>
            <Grid container alignItems="center">
              <Grid item>
                <Typography
                  sx={{
                    fontSize: "2.15rem",
                    fontWeight: 500,
                    mt: -1,
                    mr: 1,
                  }}
                >
                  {formattedGross}
                </Typography>
              </Grid>
              <Grid item>
                <Avatar
                  sx={{
                    cursor: "pointer",
                    bgcolor: theme.palette.secondary.light,
                    color: "#000",
                    height: 30,
                    width: 30,
                  }}
                >
                  <ArrowUpwardIcon
                    fontSize="inherit"
                    sx={{ transform: "rotate3d(1, 1, 1, 45deg)" }}
                  />
                </Avatar>
              </Grid>
            </Grid>
            <Typography
              sx={{
                fontSize: "1.5rem",
                fontWeight: 500,
                color: "#000",
              }}
            >
              {t("dashboard.totalGross")}
            </Typography>
          </Grid>

          {/* Net Earnings Section */}
          <Grid item>
            {/* Container for Net Earnings */}
            <Grid container direction="column" alignItems="flex-end">
              {/* Net Earnings Value and Icon */}
              <Grid item>
                <Grid container alignItems="center">
                  {/* Icon on the Left */}
                  <Grid item sx={{ mr: 1 }}>
                    <Avatar
                      sx={{
                        cursor: "pointer",
                        bgcolor: theme.palette.secondary.light,
                        color: "#000",
                        height: 30,
                        width: 30,
                      }}
                    >
                      <ArrowDownwardIcon
                        fontSize="small"
                        sx={{ transform: "rotate3d(1, 1, 1, -45deg)" }}
                      />
                    </Avatar>
                  </Grid>
                  {/* Net Earnings Value */}
                  <Grid item>
                    <Typography
                      sx={{
                        fontSize: "2.10rem",
                        fontWeight: 500,
                        mr: 1,
                      }}
                    >
                      {formattedNet}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              {/* Net Earnings Label */}
              <Grid item>
                <Typography
                  sx={{
                    fontSize: "1.5rem",
                    fontWeight: 500,
                    color: "#000",
                    textAlign: "right",
                    mr: 1,
                  }}
                >
                  {t("dashboard.totalEarning")}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Optional: Additional Content */}
          {/* ... */}
        </Grid>
      </Box>
    </Paper>
  );
};

export default React.memo(TotalEarning);
