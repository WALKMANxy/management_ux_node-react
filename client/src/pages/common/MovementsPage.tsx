// src/pages/common/MovementsPage.tsx
import { Box, useMediaQuery } from "@mui/material";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Spinner from "../../components/common/Spinner";
import MovementDetails from "../../components/movementsPage/movementsDetails";
import MovementList from "../../components/statistics/grids/MovementList";
import useLoadingData from "../../hooks/useLoadingData";
import { useMovementsGrid } from "../../hooks/useMovementsGrid";
import { Movement } from "../../models/dataModels";
import { MovementColumnDefinition } from "../../models/propsModels";
import {
  calculateTotalNetPriceSold,
  calculateTotalPriceSold,
  calculateTotalQuantity,
  currencyFormatter,
  numberComparator,
} from "../../utils/dataUtils";

const MovementsPage: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:600px)");
  const { loading } = useLoadingData();

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
    userRole,
  } = useMovementsGrid();

  // Define column definitions using the MovementColumnDefinition type
  const columnDefinitions: MovementColumnDefinition[] = useMemo(
    () =>
      [
        {
          headerName: t("movementsPage.id"),
          field: "id",
          sortable: true,
          cellRenderer: (params: { data: Movement; value: string }) => (
            <span
              onClick={() => handleMovementSelect(params.data.id)}
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
          valueFormatter: (params: { value: string }) =>
            new Date(params.value).toLocaleDateString(),
        },
        {
          headerName: t("movementsPage.totalQuantity"),
          valueGetter: (params: { data: Movement }) =>
            calculateTotalQuantity(params.data),
          sortable: true,
          comparator: numberComparator,
        },
        {
          headerName: t("movementsPage.totalPriceSold"),
          valueGetter: (params: { data: Movement }) =>
            calculateTotalPriceSold(params.data),
          valueFormatter: (params: { value: number }) =>
            currencyFormatter(params.value),
          comparator: numberComparator,
          sortable: true,
        },
        {
          headerName: t("movementsPage.netRevenue"),
          valueGetter: (params: { data: Movement }) =>
            calculateTotalNetPriceSold(params.data),
          valueFormatter: (params: { value: number }) =>
            currencyFormatter(params.value),
          comparator: numberComparator,
          sortable: true,
        },
      ].filter(Boolean) as MovementColumnDefinition[],
    [handleMovementSelect, t, userRole]
  );

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
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
      {selectedMovement && (
        <MovementDetails
          ref={movementDetailsRef}
          isLoading={false}
          selectedMovement={selectedMovement}
          isMovementDetailsCollapsed={isMovementDetailsCollapsed}
          setMovementDetailsCollapsed={setMovementDetailsCollapsed}
        />
      )}
    </Box>
  );
};

export default memo(MovementsPage);