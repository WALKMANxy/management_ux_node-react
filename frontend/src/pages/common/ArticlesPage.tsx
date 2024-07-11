import { Box, useMediaQuery } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { currencyFormatter } from "../../utils/dataUtils";
import ArticlesList from "../../components/statistics/grids/ArticlesList";
import ArticleDetails from "../../components/articlepage/ArticleDetails";
import { useArticlesGrid } from "../../hooks/useArticlesGrid";


const ArticlesPage: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:600px)");
  const {
    selectedArticle,
    quickFilterText,
    setQuickFilterText,
    handleArticleSelect,
    filteredArticles,
    gridRef,
    isArticleListCollapsed,
    setArticleListCollapsed,
    isArticleDetailsCollapsed,
    setArticleDetailsCollapsed,
    handleMenuOpen,
    handleMenuClose,
    anchorEl,
    articleDetailsRef,
    exportDataAsCsv,
  } = useArticlesGrid();

  const columnDefinitions = useMemo(() => [
    {
      headerName: t("articlesPage.name"),
      field: "name",
      filter: "agTextColumnFilter",
      sortable: true,
      cellRenderer: (params: any) => {
        return (
          <span
            onDoubleClick={() => handleArticleSelect(params.data.articleId)}
            style={{
              cursor: "pointer",
            }}
          >
            {params.value}
          </span>
        );
      },
    },
    {
      headerName: t("articlesPage.brand"),
      field: "brand",
      filter: "agTextColumnFilter",
      sortable: true,
    },
    {
      headerName: t("articlesPage.oemId"),
      field: "articleId",
      filter: "agTextColumnFilter",
      sortable: true,
    },
    {
      headerName: t("articlesPage.revenue"),
      field: "priceSold",
      filter: "agNumberColumnFilter",
      valueFormatter: (params: any) => currencyFormatter(params.value),
      sortable: true,
    },
    {
      headerName: t("articlesPage.cost"),
      field: "priceBought",
      filter: "agNumberColumnFilter",
      valueFormatter: (params: any) => currencyFormatter(params.value),
      sortable: true,
    },
  ], [handleArticleSelect, t]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <ArticlesList
        quickFilterText={quickFilterText}
        setQuickFilterText={setQuickFilterText}
        filteredArticles={filteredArticles}
        columnDefs={columnDefinitions}
        gridRef={gridRef}
        handleMenuOpen={handleMenuOpen}
        handleMenuClose={handleMenuClose}
        anchorEl={anchorEl}
        exportDataAsCsv={exportDataAsCsv}
        isArticleListCollapsed={isArticleListCollapsed}
        setArticleListCollapsed={setArticleListCollapsed}
        isMobile={isMobile}
        articleDetailsRef={articleDetailsRef}
      />
      <ArticleDetails
        ref={articleDetailsRef}
        isLoading={false}
        selectedArticle={selectedArticle}
        isArticleDetailsCollapsed={isArticleDetailsCollapsed}
        setArticleDetailsCollapsed={setArticleDetailsCollapsed}
      />
    </Box>
  );
};

export default ArticlesPage;
