// src/components/articlepage/ArticlesList.tsx
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArticlesListProps } from "../../../models/propsModels";
import AGGridTable from "./AGGridTable";

const ArticlesList: React.FC<ArticlesListProps> = ({
  quickFilterText,
  filteredArticles,
  columnDefs,
  gridRef,
  handleMenuOpen,
  handleMenuClose,
  anchorEl,
  exportDataAsCsv,
  isArticleListCollapsed,
  setArticleListCollapsed,
  isMobile,
  articleDetailsRef,
}) => {
  const { t } = useTranslation();

  const handleCollapseToggle = useCallback(() => {
    setArticleListCollapsed(!isArticleListCollapsed);
  }, [isArticleListCollapsed, setArticleListCollapsed]);

  const handleExportCSV = useCallback(() => {
    exportDataAsCsv();
    handleMenuClose();
  }, [exportDataAsCsv, handleMenuClose]);

  const memoizedColumnDefs = useMemo(() => columnDefs, [columnDefs]);

  return (
    <Paper
      elevation={8}
      sx={{ mb: 2, borderRadius: 2, height: isMobile ? 500 * 1.33 : "100%" }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{ pl: 2, pt: isMobile ? 0 : 2, mb: isMobile ? -2 : -6 }}
        >
          {t("articleList.title")}
        </Typography>
        <Tooltip
          title={
            isArticleListCollapsed
              ? t("articleList.expand")
              : t("articleList.collapse")
          }
        >
          <IconButton
            onClick={handleCollapseToggle}
            aria-label={
              isArticleListCollapsed
                ? t("articleList.expand")
                : t("articleList.collapse")
            }
          >
            {isArticleListCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      <Collapse
        in={!isArticleListCollapsed}
        sx={{ pt: isMobile ? 0 : 0, pb: 4 }}
      >
        <Box sx={{ p: 2, pt: 0 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row-reverse",
                alignItems: "center",
                gap: 1,
                flex: 1,
              }}
            >
              <Tooltip title={t("articleList.options")}>
                <IconButton
                  onClick={handleMenuOpen}
                  aria-label={t("articleList.options")}
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleExportCSV}>
              {t("articleList.exportCSV")}
            </MenuItem>
          </Menu>
          <AGGridTable
            ref={gridRef}
            columnDefs={memoizedColumnDefs}
            rowData={filteredArticles}
            paginationPageSize={100} 
            quickFilterText={quickFilterText}
          />
        </Box>
      </Collapse>
      <div ref={articleDetailsRef} />
    </Paper>
  );
};

export default ArticlesList;
