// src/pages/common/MovementsPage.tsx
import { Box, useMediaQuery } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import MovementDetails from "../../components/movementspage/MovementDetails";
import MovementList from "../../components/statistics/grids/MovementList";
import { useMovementsGrid } from "../../hooks/useMovementsGrid";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { currencyFormatter, numberComparator } from "../../utils/dataUtils";

const MovementsPage: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:600px)");
  const userRole = useSelector((state: RootState) => state.auth.userRole);

  const {
    selectedMovement,
    quickFilterText,
    setQuickFilterText,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleMovementSelect,
    filteredMovements,
    gridRef,
    isMovementListCollapsed,
    setMovementListCollapsed,
    isMovementDetailsCollapsed,
    setMovementDetailsCollapsed,
    handleMenuOpen,
    handleMenuClose,
    anchorEl,
    movementDetailsRef,
    exportDataAsCsv,
  } = useMovementsGrid();

  const columnDefinitions = useMemo(() => [
    {
      headerName: t("movementsPage.date"),
      field: "dateOfOrder",
      sortable: true,
    },
    {
      headerName: t("movementsPage.brand"),
      field: "brand",
      sortable: true,
    },
    {
      headerName: t("movementsPage.oemId"),
      field: "articleId",
      sortable: true,
    },
    {
      headerName: t("movementsPage.name"),
      field: "name",
      sortable: true,
    },
    {
      headerName: t("movementsPage.quantity"),
      field: "quantity",
      comparator: numberComparator,
      sortable: true,
    },
    {
      headerName: t("movementsPage.revenue"),
      field: "priceSold",
      valueFormatter: (params: any) => currencyFormatter(parseFloat(params.value)),
      comparator: numberComparator,
      sortable: true,
    },
    {
      headerName: t("movementsPage.cost"),
      field: "priceBought",
      valueFormatter: (params: any) => currencyFormatter(parseFloat(params.value)),
      comparator: numberComparator,
      sortable: true,
    },
  ], [t]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <MovementList
        quickFilterText={quickFilterText}
        setQuickFilterText={setQuickFilterText}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        filteredMovements={filteredMovements}
        columnDefs={columnDefinitions}
        gridRef={gridRef}
        handleMenuOpen={handleMenuOpen}
        handleMenuClose={handleMenuClose}
        anchorEl={anchorEl}
        exportDataAsCsv={exportDataAsCsv}
        isMovementListCollapsed={isMovementListCollapsed}
        setMovementListCollapsed={setMovementListCollapsed}
        isMobile={isMobile}
        movementDetailsRef={movementDetailsRef}
      />
      <MovementDetails
        ref={movementDetailsRef}
        isLoading={false}
        selectedMovement={selectedMovement}
        isMovementDetailsCollapsed={isMovementDetailsCollapsed}
        setMovementDetailsCollapsed={setMovementDetailsCollapsed}
      />
    </Box>
  );
};

export default MovementsPage;
