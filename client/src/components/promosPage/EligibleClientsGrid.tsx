// src/components/promosPage/EligibleClientsGrid.tsx

import { Box, Button, Tooltip, Typography } from "@mui/material";
import {
  ColDef,
  SelectionOptions,
  SizeColumnsToContentStrategy,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import { AgGridReact } from "ag-grid-react";
import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/users/userSlice";
import usePromos from "../../hooks/usePromos";
import { numberComparator } from "../../utils/dataUtils";
import { showToast } from "../../utils/toastMessage";

interface EligibleClientsGridProps {
  selectedClients?: string[];
  setSelectedClients?: (selected: string[]) => void;
  global?: boolean;
  setGlobal?: (global: boolean) => void;
  excludedClients?: string[];
  setExcludedClients?: (excluded: string[]) => void;
  isViewing: boolean;
}

const EligibleClientsGrid: React.FC<EligibleClientsGridProps> = ({
  selectedClients = [],
  setSelectedClients,
  global = false,
  setGlobal,
  excludedClients = [],
  setExcludedClients,
  isViewing,
}) => {
  const { clients, filteredClients } = usePromos();
  const { t } = useTranslation();
  const gridRef = useRef<AgGridReact>(null);
  const userRole = useAppSelector(selectCurrentUser)?.role;

  const selection: SelectionOptions = {
    mode: "multiRow",
    headerCheckbox: true,
    enableClickSelection: false,
    selectAll: "filtered",
  };

  const autoSizeStrategy = useMemo<SizeColumnsToContentStrategy>(() => {
    return {
      type: "fitCellContents",
    };
  }, []);

  // Define column definitions
  const columnDefs: ColDef[] = useMemo(() => {
    const baseColumns: ColDef[] = [
      {
        headerName: t("clientsPage.id"),
        field: "id",
        sortable: true,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        comparator: numberComparator,
        autoHeight: false,
      },
      {
        headerName: t("clientsPage.name"),
        field: "name",
        sortable: true,
        filter: "agTextColumnFilter",
        autoHeight: false,
      },
      {
        headerName: t("clientsPage.address"),
        field: "address",
        sortable: true,
        filter: "agTextColumnFilter",
        autoHeight: false,
      },
      {
        headerName: t("clientsPage.province"),
        field: "province",
        sortable: true,
        filter: "agTextColumnFilter",
        autoHeight: false,
      },
      {
        headerName: t("clientsPage.paymentMethod"),
        field: "paymentMethod",
        sortable: true,
        filter: "agTextColumnFilter",
        autoHeight: false,
      },
    ];

    // Conditionally add the 'agent' column if the userRole is 'admin'
    if (userRole === "admin") {
      baseColumns.push({
        headerName: t("clientsPage.agent"),
        field: "agent",
        sortable: true,
        filter: "agTextColumnFilter",
        autoHeight: false,
      });
    }

    return baseColumns;
  }, [t, userRole]);

  // Prepare row data based on viewing mode
  const rowData = useMemo(() => {
    return isViewing ? filteredClients : Object.values(clients);
  }, [isViewing, filteredClients, clients]);

  // Handle row selection
  const onSelectionChanged = () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes();
    const selectedIds = selectedNodes?.map((node) => node.data.id) || [];

    if (global) {
      setExcludedClients?.(selectedIds);
    } else {
      setSelectedClients?.(selectedIds);
    }
  };

  // Handle Toggle with toast
  const handleToggle = () => {
    const newGlobal = !global;
    setGlobal?.(newGlobal);

    if (newGlobal) {
      showToast.info(t("eligibleClients.globalPromoToast"));
      setExcludedClients?.([]);
      setSelectedClients?.([]);
    } else {
      showToast.info(t("eligibleClients.manualPromoToast"));
      setSelectedClients?.([]);
      setExcludedClients?.([]);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        mt: 2,
        overflow: "auto",
      }}
    >
      {/* Header with Selected Clients Counter and Toggle (hide toggle in view mode) */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography variant="subtitle1">
          {global
            ? `${t("eligibleClients.promoIsGlobal")} (${t(
                "eligibleClients.excludedClients"
              )}: ${excludedClients?.length ?? 0})`
            : `${t("eligibleClients.promoIsNotGlobal")} (${t(
                "eligibleClients.selectedClients"
              )}: ${selectedClients?.length ?? 0})`}
        </Typography>

        {!isViewing && (
          <Box>
            <Tooltip
              title={
                global
                  ? t("eligibleClients.switchToManual")
                  : t("eligibleClients.switchToGlobal")
              }
            >
              <Button
                onClick={handleToggle}
                variant="contained"
                sx={{
                  backgroundColor: global ? "lightgreen" : "chocolate",
                  color: "black",
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: global ? "green" : "orange",
                  },
                }}
              >
                {global
                  ? t("eligibleClients.globalPromo")
                  : t("eligibleClients.manualSelection")}
              </Button>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* AG Grid Table with Conditional Class */}
      <div
        className={`ag-theme-quartz ${global ? "manual-mode" : "global-mode"}`}
        style={{ height: 600, width: "100%" }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          onSelectionChanged={onSelectionChanged}
          pagination={true}
          paginationPageSize={100}
          enableCellTextSelection={true}
          rowBuffer={5}
          autoSizeStrategy={autoSizeStrategy}
          overlayNoRowsTemplate={`<span style="padding: 10px; border: 1px solid #444; background: lightgoldenrodyellow;">${t(
            "eligibleClients.noClients"
          )}</span>`}
          defaultColDef={{
            flex: 1,
            floatingFilter: true, // Enable floating filters
            suppressHeaderMenuButton: true,
          }}
          suppressColumnVirtualisation={false}
          suppressAggFuncInHeader={true}
          animateRows={true}
          suppressMovableColumns={true}
          selection={!isViewing ? selection : undefined} // Disable selection when in view mode
        />
      </div>
    </Box>
  );
};

export default EligibleClientsGrid;
