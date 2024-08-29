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
  Typography,
} from "@mui/material";
import React from "react";
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
  articleDetailsRef,
}) => {
  const { t } = useTranslation();

  const onFilterTextBoxChanged = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value || "";
    setQuickFilterText(value);
  };

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
        <IconButton
          onClick={() => setArticleListCollapsed(!isArticleListCollapsed)}
          aria-label={t(
            isArticleListCollapsed ? "common.expand" : "common.collapse"
          )}
        >
          {isArticleListCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
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
                onChange={onFilterTextBoxChanged}
                value={quickFilterText}
              />
              <IconButton
                onClick={handleMenuOpen}
                aria-label={t("common.moreOptions")}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={exportDataAsCsv}>
              {t("articleList.exportCSV")}
            </MenuItem>
          </Menu>
          <AGGridTable
            ref={gridRef}
            columnDefs={columnDefs}
            rowData={filteredArticles()}
            paginationPageSize={500}
            quickFilterText={quickFilterText}
          />
        </Box>
      </Collapse>
      <div ref={articleDetailsRef} />
    </Paper>
  );
};

export default ArticlesList;
