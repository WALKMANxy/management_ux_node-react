import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Collapse, Grid, IconButton, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { ArticleDetailsProps } from "../../models/models";
import ArticleHistory from "../statistics/grids/ArticleHistory";
import ArticleDetailComponent from "./ArticleDetailComponent";

const ArticleDetails = React.forwardRef<HTMLDivElement, ArticleDetailsProps>(
  ({ selectedArticle, isArticleDetailsCollapsed, setArticleDetailsCollapsed, isLoading }, ref) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:600px)");

    return (
      <Paper
        elevation={3}
        ref={ref}
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
            background: theme.palette.primary.main,
            borderRadius: "50%",
            top: -85,
            right: -95,
          },
          "&:before": {
            content: '""',
            position: "absolute",
            width: 210,
            height: 210,
            background: theme.palette.primary.main,
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
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  <Typography variant="h2">{t('articleDetails.title')}</Typography>
                </Grid>
                <Grid item>
                  <IconButton
                    onClick={() =>
                      setArticleDetailsCollapsed(!isArticleDetailsCollapsed)
                    }
                  >
                    {isArticleDetailsCollapsed ? (
                      <ExpandMoreIcon />
                    ) : (
                      <ExpandLessIcon />
                    )}
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        <Collapse in={!isArticleDetailsCollapsed}>
          {selectedArticle ? (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2} direction={isMobile ? "column" : "row"}>
                <Grid item xs={12} md={6}>
                  <ArticleDetailComponent detail={selectedArticle} isLoading={isLoading} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ArticleHistory articleId={selectedArticle.articleId} />
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}></Box>
          )}
        </Collapse>
      </Paper>
    );
  }
);

export default ArticleDetails;

