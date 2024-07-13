import { Box, useMediaQuery } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ClientDetails from "../../components/clientpage/ClientDetails";
import ClientList from "../../components/statistics/grids/ClientList";
import { useClientsGrid } from "../../hooks/useClientGrid";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  calculateMonthlyData,
  calculateNetRevenue,
  currencyFormatter,
  numberComparator,
} from "../../utils/dataUtils";

const ClientsPage: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:600px)");
  const userRole = useSelector((state: RootState) => state.auth.userRole);
  const loggedInClientId = useSelector((state: RootState) => state.auth.id);

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

  const columnDefinitions = useMemo(() => {
    const baseColumns = [
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
        headerName: t("clientsPage.totalOrders"),
        field: "totalOrders",
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: t("clientsPage.ordersThisMonth"),
        valueGetter: (params: any) => {
          const { months, ordersData } = calculateMonthlyData([params.data]);
          return ordersData[months.length - 1] || 0; // Get the latest month's data
        },
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
        headerName: t("clientsPage.totalNetRevenue"),
        valueGetter: (params: any) => {
          return calculateNetRevenue([params.data]);
        },
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        sortable: true,
      },
      {
        headerName: t("clientsPage.revenueThisMonth"),
        valueGetter: (params: any) => {
          const { months, revenueData } = calculateMonthlyData([params.data]);
          return revenueData[months.length - 1] || 0; // Get the latest month's data
        },
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        sortable: true,
      },
      {
        headerName: t("clientsPage.netRevenueThisMonth"),
        valueGetter: (params: any) => {
          const { months, netRevenueData } = calculateMonthlyData([params.data]);
          return netRevenueData[months.length - 1] || 0; // Get the latest month's data
        },
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
    ];

    if (userRole === "admin") {
      baseColumns.splice(1, 0, {
        headerName: t("clientsPage.agent"),
        field: "agentName",
        filter: "agTextColumnFilter",
        sortable: true,
      });
    }

    return baseColumns;
  }, [handleClientSelect, t, userRole]);

  // Extract the logged-in client details from filteredClients
  const loggedInClientDetails = filteredClients().find(
    (client) => client.id === loggedInClientId
  );
  

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {userRole === "client" ? (
        loggedInClientDetails && (
          <ClientDetails
            ref={clientDetailsRef}
            isLoading={false}
            selectedClient={loggedInClientDetails}
            isClientDetailsCollapsed={isClientDetailsCollapsed}
            setClientDetailsCollapsed={setClientDetailsCollapsed}
          />
        )
      ) : (
        <>
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
            clientDetailsRef={clientDetailsRef}
          />
          <ClientDetails
            ref={clientDetailsRef}
            isLoading={false}
            selectedClient={selectedClient}
            isClientDetailsCollapsed={isClientDetailsCollapsed}
            setClientDetailsCollapsed={setClientDetailsCollapsed}
          />
        </>
      )}
    </Box>
  );
};

export default ClientsPage;
