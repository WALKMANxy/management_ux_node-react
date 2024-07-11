import { Box, useMediaQuery } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { currencyFormatter} from "../../utils/dataUtils";
import ArticlesList from "../../components/statistics/grids/ArticlesList";
import ArticleDetails from "../../components/articlepage/ArticleDetails";
import { useArticlesGrid } from "../../hooks/useArticlesGrid";
import { ArticleColumnDefinition } from "../../models/models";

const ArticlesPage: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:600px)");
  const userRole = useSelector((state: RootState) => state.auth.userRole);

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
    clientMovements, // Add clientMovements
  } = useArticlesGrid();

 

  const columnDefinitions: ArticleColumnDefinition[] = useMemo(() => {
    const baseColumns: ArticleColumnDefinition[] = [
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
    ];

    if (userRole !== "client") {
      baseColumns.push(
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
        }
      );
    }

    return baseColumns;
  }, [handleArticleSelect, t, userRole]);

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
      {selectedArticle && (
        <ArticleDetails
          ref={articleDetailsRef}
          isLoading={false}
          selectedArticle={selectedArticle}
          isArticleDetailsCollapsed={isArticleDetailsCollapsed}
          setArticleDetailsCollapsed={setArticleDetailsCollapsed}
          clientMovements={clientMovements}
        />
      )}
    </Box>
  );
};

export default ArticlesPage;
