import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArticleDetailsProps } from "../../models/propsModels";
import ArticleHistory from "../statistics/grids/ArticleHistory";
import ArticleDetailComponent from "./ArticleDetailComponent";

const ArticleDetails = React.forwardRef<HTMLDivElement, ArticleDetailsProps>(
  (
    {
      selectedArticle,
      isArticleDetailsCollapsed,
      setArticleDetailsCollapsed,
      isLoading,
      clientMovements,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery("(max-width:600px)");

    const hasHistory = clientMovements
      ? clientMovements.some((movement) =>
          movement.details.some(
            (detail) => detail.articleId === selectedArticle?.articleId
          )
        )
      : false;

    // Memoized toggle function to avoid recreating it
    const toggleCollapse = useMemo(
      () => () => {
        setArticleDetailsCollapsed(!isArticleDetailsCollapsed);
      },
      [isArticleDetailsCollapsed, setArticleDetailsCollapsed]
    );

    // Calculate height based on expansion state and mobile view
    const height = useMemo(() => {
      if (isMobile) {
        return isArticleDetailsCollapsed ? "100%" : 740 * 1.33; // Adjust height when expanded
      }
      return "100%";
    }, [isMobile, isArticleDetailsCollapsed]);

    // Memoize styles to prevent recreation on each render
    const paperStyles = useMemo(
      () => ({
        p: isMobile ? 0 : 3,
        borderRadius: "12px",
        background: "linear-gradient(135deg, #e3f2fd 30%, #bbdefb 100%)",
        color: "#000",
        overflow: "hidden",
        height,
        maxHeight: height,
        position: "relative" as const,
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          display: "none", // Hide scrollbar
        },
        "&:after": {
          content: '""',
          position: "absolute",
          width: 210,
          height: 210,
          background: theme.palette.primary.main,
          borderRadius: "50%",
          top: -85,
          right: -95,
          overflow: "hidden",
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
          overflow: "hidden",
        },
      }),
      [theme.palette.primary.main, isMobile, height]
    );

    return (
      <Paper elevation={3} ref={ref} sx={paperStyles}>
        {/* Header Section */}
        <Box sx={{ p: 2.25 }}>
          <Grid container direction="column">
            <Grid item>
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="h4" component="h2">
                    {t("articleDetails.title", "Article Details")}
                  </Typography>
                </Grid>
                <Box sx={{ alignItems: "flex-end", display: "flex" }}>
                  <Tooltip
                    title={
                      isArticleDetailsCollapsed
                        ? t("articleDetails.expandTooltip", "Expand details")
                        : t(
                            "articleDetails.collapseTooltip",
                            "Collapse details"
                          )
                    }
                    arrow
                  >
                    <IconButton
                      onClick={toggleCollapse}
                      aria-label={
                        isArticleDetailsCollapsed
                          ? t("articleDetails.expand", "Expand details")
                          : t("articleDetails.collapse", "Collapse details")
                      }
                      size="large"
                      sx={{ zIndex: 1000 }}
                    >
                      {isArticleDetailsCollapsed ? (
                        <ExpandMoreIcon />
                      ) : (
                        <ExpandLessIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Box>

        {/* Collapsible Content */}
        <Collapse in={!isArticleDetailsCollapsed}>
          {selectedArticle ? (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2} direction={"column"}>
                {/* Article Details */}
                <Grid item xs={12} md={6}>
                  <ArticleDetailComponent
                    detail={selectedArticle}
                    isLoading={isLoading}
                  />
                </Grid>

                {/* Article History */}
                <Grid item xs={12} md={6}>
                  {hasHistory ? (
                    <ArticleHistory
                      articleId={selectedArticle.articleId}
                      clientMovements={clientMovements} // Pass the mapped movements
                    />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ textAlign: "center" }}
                      >
                        {t("articleDetails.noHistory", "No history available.")}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              {/* Placeholder or Empty State */}
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ textAlign: "center" }}
              >
                {t("articleDetails.noArticleSelected", "No article selected.")}
              </Typography>
            </Box>
          )}
        </Collapse>
      </Paper>
    );
  }
);

export default React.memo(ArticleDetails);
