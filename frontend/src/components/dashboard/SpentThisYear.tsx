// src/components/common/SpentThisYear.tsx
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Avatar, Box, Grid, Paper, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { SpentThisYearProps } from "../../models/models";
import { currencyFormatter } from "../../utils/dataUtils"; // Import the currency formatter

const SpentThisYear: React.FC<SpentThisYearProps> = ({ amount }) => {
  const { t } = useTranslation();

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
                    src="/moneybag.svg"
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
              <Grid item>
                <Avatar
                  sx={{
                    cursor: "pointer",
                    bgcolor: "#a5d6a7", // Light Green
                    color: "#000",
                  }}
                >
                  <ArrowUpwardIcon
                    fontSize="inherit"
                    sx={{ transform: "rotate3d(1, 1, 1, 45deg)" }}
                  />
                </Avatar>
              </Grid>
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
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SpentThisYear;
