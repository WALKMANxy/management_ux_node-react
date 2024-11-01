// src/pages/common/ClientsPage.tsx
import { Box, useMediaQuery } from "@mui/material";
import React, { memo, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import ClientDetails from "../../components/clientpage/ClientDetails";
import Spinner from "../../components/common/Spinner";
import ClientList from "../../components/statistics/grids/ClientList";
import { useClientsGrid } from "../../hooks/useClientGrid";
import useLoadingData from "../../hooks/useLoadingData";
import {
  ClientColumnDefinition,
  EnrichedClient,
} from "../../models/propsModels";
import {
  calculateMonthlyData,
  calculateNetRevenue,
  currencyFormatter,
  numberComparator,
} from "../../utils/dataUtils";

const ClientsPage: React.FC = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width:600px)");
  const userRole = useSelector((state: RootState) => state.auth.role);
  const loggedInClientId = useSelector((state: RootState) => state.auth.id);

  const { loading } = useLoadingData();

  const {
    filteredClients,
    selectedClient,
    quickFilterText,
    setQuickFilterText,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleClientSelect,
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

  useEffect(() => {
    const selectedItem = sessionStorage.getItem("searchedItem");
    if (selectedItem) {
      const item = JSON.parse(selectedItem);
      if (item.type === "client") {
        handleClientSelect(item.id);
      }
      sessionStorage.removeItem("searchedItem");
    }
  }, [handleClientSelect]);

  const columnDefinitions: ClientColumnDefinition[] = useMemo(() => {
    const baseColumns: ClientColumnDefinition[] = [
      {
        headerName: t("clientsPage.name"),
        field: "name",
        filter: "agTextColumnFilter",
        sortable: true,
        cellRenderer: (params: { data: EnrichedClient; value: string }) => {
          return (
            <span
              onClick={() => handleClientSelect(params.data.id)}
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
        valueGetter: (params) => {
          const { months, ordersData } = calculateMonthlyData([params.data]);
          return ordersData[months.length - 1] || 0;
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
        valueFormatter: (params) => currencyFormatter(params.value),
        sortable: true,
      },
      {
        headerName: t("clientsPage.totalNetRevenue"),
        valueGetter: (params) => {
          return calculateNetRevenue([params.data]);
        },
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        valueFormatter: (params) => currencyFormatter(params.value),
        sortable: true,
      },
      {
        headerName: t("clientsPage.revenueThisMonth"),
        valueGetter: (params) => {
          const { months, revenueData } = calculateMonthlyData([params.data]);
          return revenueData[months.length - 1] || 0;
        },
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        valueFormatter: (params) => currencyFormatter(params.value),
        sortable: true,
      },
      {
        headerName: t("clientsPage.netRevenueThisMonth"),
        valueGetter: (params) => {
          const { months, netRevenueData } = calculateMonthlyData([
            params.data,
          ]);
          return netRevenueData[months.length - 1] || 0;
        },
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        valueFormatter: (params) => currencyFormatter(params.value),
        sortable: true,
      },

      {
        headerName: t("clientsPage.paymentMethod"),
        field: "paymentMethod",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: t("clientsPage.unpaidRevenue"),
        field: "unpaidRevenue",
        filter: "agNumberColumnFilter",
        comparator: numberComparator,
        valueFormatter: (params) => currencyFormatter(params.value),
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

  // Find the logged-in client details from clients array
  const loggedInClientDetails = filteredClients.find(
    (client) => client.id === loggedInClientId
  );

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
          {selectedClient && (
            <>
              <ClientDetails
                isLoading={false}
                selectedClient={selectedClient}
                isClientDetailsCollapsed={isClientDetailsCollapsed}
                setClientDetailsCollapsed={setClientDetailsCollapsed}
              />
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default memo(ClientsPage);
