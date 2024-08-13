import React from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Box, Divider, Grid, Paper, Typography } from "@mui/material";
import { TopArticleTypeProps } from "../../models/propsModels";

const TopArticleType: React.FC<TopArticleTypeProps> = ({ articles }) => {
  const { t } = useTranslation();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: "12px",
        background: "linear-gradient(135deg, #e8f5e9 30%, #c8e6c9 100%)",
        color: "#000",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        "&::after, &::before": {
          content: '""',
          position: "absolute",
          width: 210,
          height: 210,
          borderRadius: "50%",
        },
        "&::after": {
          background: "#1e88e5", // Dark Blue
          top: -85,
          right: -95,
        },
        "&::before": {
          background: "#90caf9", // Light Blue
          top: -125,
          right: -15,
          opacity: 0.5,
        },
      }}
    >
      <Box sx={{ p: 2.25 }}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 500,
                color: "#000",
              }}
            >
              {t("topArticleType.title")}
            </Typography>
          </Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: "#1e88e5", // Dark Blue
                color: "#000",
              }}
            >
              <img
                src="/icons/garage.svg"
                alt={t("topArticleType.iconAlt")}
                style={{ width: "100%", height: "100%" }}
              />
            </Avatar>
          </Grid>
          <Grid item>
            {articles.map((article) => (
              <Box key={article.id} sx={{ mb: 1 }}>
                <Typography variant="h6">
                  {article.name} (ID: {article.id})
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {t("topArticleType.amountPurchased")}: {article.quantity}
                </Typography>
              </Box>
            ))}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TopArticleType;