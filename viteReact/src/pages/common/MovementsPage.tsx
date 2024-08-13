// src/pages/common/MovementsPage.tsx
import { Box, useMediaQuery } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import MovementDetails from "../../components/movementsPage/movementsDetails";
import MovementList from "../../components/statistics/grids/MovementList";
import { useMovementsGrid } from "../../hooks/useMovementsGrid";
import {
  calculateTotalPriceSold,
  calculateTotalQuantity,
  currencyFormatter,
  numberComparator,
} from "../../utils/dataUtils";

const MovementsPage: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:600px)");

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
    userRole, // Added userRole to props
  } = useMovementsGrid();

  const columnDefinitions = useMemo(
    () =>
      [
        {
          headerName: t("movementsPage.id"),
          field: "id",
          sortable: true,
          cellRenderer: (params: any) => (
            <span
              onDoubleClick={() => handleMovementSelect(params.data.id)}
              style={{ cursor: "pointer" }}
            >
              {params.value}
            </span>
          ),
          comparator: numberComparator,
        },
        {
          headerName: t("movementsPage.clientName"),
          field: "clientName",
          filter: "agTextColumnFilter",
          sortable: true,
        },
        userRole === "admin"
          ? {
              headerName: t("movementsPage.agentName"),
              field: "agentName",
              filter: "agTextColumnFilter",
              sortable: true,
            }
          : null,
        {
          headerName: t("movementsPage.dateOfOrder"),
          field: "dateOfOrder",
          filter: "agDateColumnFilter",
          sortable: true,
          valueFormatter: (params: any) =>
            new Date(params.value).toLocaleDateString(),
        },
        {
          headerName: t("movementsPage.totalQuantity"),
          valueGetter: (params: any) => calculateTotalQuantity(params.data),
          sortable: true,
          comparator: numberComparator,
        },
        {
          headerName: t("movementsPage.totalPriceSold"),
          valueGetter: (params: any) => calculateTotalPriceSold(params.data),
          valueFormatter: (params: any) => currencyFormatter(params.value),
          comparator: numberComparator,
          sortable: true,
        },
      ].filter(Boolean), // Remove null entries
    [handleMovementSelect, t, userRole]
  );

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
