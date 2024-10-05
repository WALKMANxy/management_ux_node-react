import { Box, useMediaQuery, useTheme } from "@mui/material";
import React, { Suspense, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import Spinner from "../../components/common/Spinner";
import ArticlesList from "../../components/statistics/grids/ArticlesList";
import { useArticlesGrid } from "../../hooks/useArticlesGrid";
import useLoadingData from "../../hooks/useLoadingData";
import { MovementDetail } from "../../models/dataModels";
import { ArticleColumnDefinition } from "../../models/propsModels";
import { currencyFormatter } from "../../utils/dataUtils";

const ArticleDetails = React.lazy(
  () => import("../../components/articlepage/ArticleDetails")
);

const ArticlesPage: React.FC = () => {
  const { t } = useTranslation();
  const userRole = useSelector((state: RootState) => state.auth.role);

  const {
    selectedArticle,
    quickFilterText,
    setQuickFilterText,
    handleArticleSelect,
    filteredArticles,
    totalQuantitySold,
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { loading } = useLoadingData();

  useEffect(() => {
    const selectedItem = sessionStorage.getItem("searchedItem");
    if (selectedItem) {
      const item = JSON.parse(selectedItem);
      handleArticleSelect(item.articleId);
      sessionStorage.removeItem("searchedItem"); // Clear the item from storage
    }
  }, [handleArticleSelect]);

  const columnDefinitions: ArticleColumnDefinition[] = useMemo(() => {
    const baseColumns: ArticleColumnDefinition[] = [
      {
        headerName: t("articlesPage.name"),
        field: "name",
        filter: "agTextColumnFilter",
        sortable: true,
        cellRenderer: (params: { data: MovementDetail; value: string }) => {
          return (
            <span
              onClick={() => handleArticleSelect(params.data.articleId)}
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
          headerName: t("articlesPage.unitPrice"),
          field: "unitPrice",
          filter: "agNumberColumnFilter",
          valueFormatter: (params: { value: string }) =>
            currencyFormatter(params.value),
          sortable: true,
        },
        {
          headerName: t("articlesPage.cost"),
          field: "priceBought",
          filter: "agNumberColumnFilter",
          valueFormatter: (params: { value: string }) =>
            currencyFormatter(params.value),
          sortable: true,
        },
        {
          headerName: t("articlesPage.quantitySold"),
          valueGetter: (params: { data: MovementDetail }) =>
            totalQuantitySold[params.data.articleId] || 0,
          filter: "agNumberColumnFilter",
          sortable: true,
        }
      );
    }

    return baseColumns;
  }, [handleArticleSelect, t, userRole, totalQuantitySold]);

  // Handle loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f4f5f7",
        }}
      >
        <Spinner />
      </Box>
    );
  }

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
        <Suspense>
          <ArticleDetails
            ref={articleDetailsRef}
            isLoading={false}
            selectedArticle={selectedArticle}
            isArticleDetailsCollapsed={isArticleDetailsCollapsed}
            setArticleDetailsCollapsed={setArticleDetailsCollapsed}
            clientMovements={clientMovements}
          />
        </Suspense>
      )}
    </Box>
  );
};

export default ArticlesPage;
