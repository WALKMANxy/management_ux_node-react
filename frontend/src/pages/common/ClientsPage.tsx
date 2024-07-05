import { Box, useMediaQuery } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ClientDetails from "../../components/clientpage/ClientDetails";
import ClientList from "../../components/statistics/grids/ClientList";
import { useClientsGrid } from "../../hooks/useClientGrid";
import {
  calculateMonthlyOrders,
  calculateMonthlyRevenue,
  currencyFormatter,
  numberComparator,
} from "../../utils/dataUtils";

const ClientsPage: React.FC = () => {
  const { t } = useTranslation();
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
        headerName: t("clientsPage.name"),
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
        headerName: t("clientsPage.province"),
        field: "province",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: t("clientsPage.phone"),
        field: "phone",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: t("clientsPage.totalOrders"),
        field: "totalOrders",
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: t("clientsPage.ordersThisMonth"),
        valueGetter: (params: any) =>
          calculateMonthlyOrders(params.data.movements),
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: t("clientsPage.totalRevenue"),
        field: "totalRevenue",
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        sortable: true,
      },
      {
        headerName: t("clientsPage.revenueThisMonth"),
        valueGetter: (params: any) =>
          calculateMonthlyRevenue(params.data.movements),
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        sortable: true,
      },
      {
        headerName: t("clientsPage.unpaidRevenue"),
        field: "unpaidRevenue",
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        sortable: true,
      },
      {
        headerName: t("clientsPage.paymentMethod"),
        field: "paymentMethod",
        filter: "agTextColumnFilter",
        sortable: true,
      },
    ],
    [handleClientSelect, t]
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
