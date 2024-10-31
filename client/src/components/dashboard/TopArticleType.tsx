//src/components/dashboard/TopArticleType.tsx
import GarageIcon from "@mui/icons-material/Garage";
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
          zIndex: 0,
        },
        "&:after": {
          width: 210,
          height: 210,
          background: "#1e88e5",
          borderRadius: "50%",
          top: -85,
          right: -95,
        },
        "&:before": {
          width: 210,
          height: 210,
          background: "#90caf9",
          borderRadius: "50%",
          top: -125,
          right: -15,
          opacity: 0.5,
        },
      }}
    >
      <Box sx={{ p: 2.25 }}>
        <Grid container direction="column">
          <Grid container direction="row" justifyContent="space-between">
            <Grid item>
              <Box sx={{ pb: 2 }}>
                <Avatar
                  variant="rounded"
                  sx={{
                    bgcolor: "#1e88e5",
                    color: "#000",
                    mt: 1,
                  }}
                >
                  <GarageIcon />
                </Avatar>
              </Box>
            </Grid>
            <Grid item>
              <Typography
                sx={{
                  fontSize: "1.605rem",
                  fontWeight: 500,
                  color: "#000",
                  zIndex: 1,
                  position: "relative",
                }}
              >
                {t(
                  isAgentSelected
                    ? "topArticleType.titleAgent"
                    : "topArticleType.titleClient"
                )}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2, borderRadius: "12px" }} />
          <Grid item>
            {articles.map((article, index) => (
              <Box key={`${article.id}-${index}`} sx={{ mb: 1 }}>
                <Typography
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: 500,
                    wordBreak: "break-word",
                  }}
                >
                  {article.name} (ID: {article.id})
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#000",
                    wordBreak: "break-word",
                  }}
                >
                  {t("topArticleType.amountPurchased")}: {article.quantity}
                </Typography>
                {index < articles.length - 1 && (
                  <Divider sx={{ my: 2, borderRadius: "12px" }} />
                )}{" "}
              </Box>
            ))}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TopArticleType;
