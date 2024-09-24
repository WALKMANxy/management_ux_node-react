import { Avatar, Box, Divider, Grid, Paper, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { TopArticleTypeProps } from "../../models/propsModels";

const TopArticleType: React.FC<TopArticleTypeProps> = ({
  articles,
  isAgentSelected,
}) => {
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
        "&:after, &:before": {
          content: '""',
          position: "absolute",
          zIndex: 0, // Ensure the bubbles are behind
        },
        "&:after": {
          width: 210,
          height: 210,
          background: "#1e88e5", // Dark Blue
          borderRadius: "50%",
          top: -85,
          right: -95,
        },
        "&:before": {
          width: 210,
          height: 210,
          background: "#90caf9", // Light Blue
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
            <Typography
              sx={{
                fontSize: "1.605rem", // Increased by 7%
                fontWeight: 500,
                color: "#000",
                zIndex: 1,
                position: "relative",
              }}
            >
              {t(
                isAgentSelected
                  ? "topArticleType.titleAgent" // Translated to "Top Sold"
                  : "topArticleType.titleClient" // Translated to "Top Bought"
              )}
            </Typography>
          </Grid>
          <Divider sx={{ my: 2, borderRadius: "12px" }} />
          <Grid item>
            <Grid container justifyContent="space-between">
              <Grid item>
                <Box sx={{ pb: 2 }}>
                  <Avatar
                    variant="rounded"
                    sx={{
                      bgcolor: "#1e88e5", // Dark Blue
                      color: "#000",
                      mt: 1,
                    }}
                  >
                    <img
                      src="/icons/garage.svg"
                      alt={t("topArticleType.iconAlt")} // "Icon representing top article type"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </Avatar>
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            {articles.map((article, index) => (
              <Box key={`${article.id}-${index}`} sx={{ mb: 1 }}>
                <Typography
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: 500,
                    wordBreak: "break-word", // Allows text to wrap to the next line if necessary
                  }}
                >
                  {article.name} (ID: {article.id})
                </Typography>
                <Typography
                  variant="subtitle2" // Adjusted to use subtitle variant
                  sx={{
                    color: "#000",
                    wordBreak: "break-word", // Ensure text wraps within the container
                  }}
                >
                  {t("topArticleType.amountPurchased")}: {article.quantity}
                </Typography>
                {index < articles.length - 1 && (
                  <Divider sx={{ my: 2, borderRadius: "12px" }} />
                )}{" "}
                {/* Add a subtle divider between items */}
              </Box>
            ))}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TopArticleType;
