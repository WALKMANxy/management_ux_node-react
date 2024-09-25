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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArticlesListProps } from "../../../models/propsModels";
import AGGridTable from "./AGGridTable";

const ArticlesList: React.FC<ArticlesListProps> = ({
  quickFilterText,
  setQuickFilterText,
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
  articleDetailsRef, // Add the articleDetailsRef prop
}) => {
  const { t } = useTranslation();

  const onFilterTextBoxChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value || ""; // Ensure value is not null
      setQuickFilterText(value);
    },
    [setQuickFilterText]
  );

  const handleCollapseToggle = useCallback(() => {
    setArticleListCollapsed(!isArticleListCollapsed);
  }, [isArticleListCollapsed, setArticleListCollapsed]);

  const handleExportCSV = useCallback(() => {
    exportDataAsCsv();
    handleMenuClose();
  }, [exportDataAsCsv, handleMenuClose]);

  const memoizedFilteredArticles = useMemo(
    () => filteredArticles(),
    [filteredArticles]
  );

  const memoizedColumnDefs = useMemo(() => columnDefs, [columnDefs]);

  return (
    <Paper elevation={8} sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography variant="h6">{t("articleList.title")}</Typography>
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
      <Collapse in={!isArticleListCollapsed}>
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
              mb: 2,
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
            >
              <TextField
                id="filter-text-box"
                placeholder={t("articleList.quickFilterPlaceholder")}
                variant="outlined"
                size="small"
                fullWidth
                value={quickFilterText}
                onChange={onFilterTextBoxChanged}
                InputProps={{
                  "aria-label": t("articleList.quickFilterAriaLabel"),
                }}
              />
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
            rowData={memoizedFilteredArticles}
            paginationPageSize={100} // Adjusted to a more manageable number
            quickFilterText={quickFilterText}
          />
        </Box>
      </Collapse>
      <div ref={articleDetailsRef} />
    </Paper>
  );
};

export default ArticlesList;
