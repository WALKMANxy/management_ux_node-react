//src/pages/common/ClientsPage.tsx
import React, { useMemo } from "react";
import { Box, useMediaQuery } from "@mui/material";
import ClientDetails from "../../components/clientpage/ClientDetails";
import { useClientsGrid } from "../../hooks/useClientGrid";
import {
  calculateMonthlyOrders,
  calculateMonthlyRevenue,
  currencyFormatter,
  numberComparator,
} from "../../utils/dataUtils";
import ClientList from "../../components/statistics/grids/ClientList";

const ClientsPage: React.FC = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const {
    selectedClient,
    quickFilterText,
    setQuickFilterText,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleClientSelect,
    filteredClients,
    gridRef,
    isClientListCollapsed,
    setClientListCollapsed,
    isClientDetailsCollapsed,
    setClientDetailsCollapsed,
    handleMenuOpen,
    handleMenuClose,
    anchorEl,
    clientDetailsRef,
    exportDataAsCsv,
  } = useClientsGrid();

  const columnDefinitions = useMemo(
    () => [
      {
        headerName: "Name",
        field: "name",
        filter: "agTextColumnFilter",
        sortable: true,
        cellRenderer: (params: any) => {
          return (
            <span
              onDoubleClick={() => handleClientSelect(params.data.id)}
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
        headerName: "Province",
        field: "province",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "Phone",
        field: "phone",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: "Total Orders",
        field: "totalOrders",
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: "Orders This Month",
        valueGetter: (params: any) =>
          calculateMonthlyOrders(params.data.movements),
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: "Total Revenue",
        field: "totalRevenue",
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        sortable: true,
      },
      {
        headerName: "Revenue This Month",
        valueGetter: (params: any) =>
          calculateMonthlyRevenue(params.data.movements),
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        sortable: true,
      },
      {
        headerName: "Unpaid Revenue",
        field: "unpaidRevenue",
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        sortable: true,
      },
      {
        headerName: "Payment Method",
        field: "paymentMethod",
        filter: "agTextColumnFilter",
        sortable: true,
      },
    ],
    [handleClientSelect]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <ClientList
        quickFilterText={quickFilterText}
        setQuickFilterText={setQuickFilterText}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        filteredClients={filteredClients}
        columnDefs={columnDefinitions}
        gridRef={gridRef}
        handleMenuOpen={handleMenuOpen}
        handleMenuClose={handleMenuClose}
        anchorEl={anchorEl}
        exportDataAsCsv={exportDataAsCsv}
        isClientListCollapsed={isClientListCollapsed}
        setClientListCollapsed={setClientListCollapsed}
        isMobile={isMobile}
      />
      <ClientDetails
        ref={clientDetailsRef}
        isLoading={false}
        selectedClient={selectedClient}
        isClientDetailsCollapsed={isClientDetailsCollapsed}
        setClientDetailsCollapsed={setClientDetailsCollapsed}
      />
    </Box>
  );
};

export default ClientsPage;
