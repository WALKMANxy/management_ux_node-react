// src/components/promosPage/EligibleClientsGrid.tsx

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AgGridReact } from "ag-grid-react";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import usePromos from "../../hooks/usePromos";
/* import { currencyFormatter, numberComparator } from "../../utils/dataUtils";
 */
interface EligibleClientsGridProps {
  selectedClients: string[];
  setSelectedClients: (selected: string[]) => void;
}

const EligibleClientsGrid: React.FC<EligibleClientsGridProps> = ({
  selectedClients,
  setSelectedClients,
}) => {
  const { clients } = usePromos();
  const { t } = useTranslation();
  const gridRef = useRef<AgGridReact>(null);

  // State for confirmation dialogs
  const [selectAllDialogOpen, setSelectAllDialogOpen] = useState(false);
  const [deselectAllDialogOpen, setDeselectAllDialogOpen] = useState(false);

  // Define column definitions
  const columnDefs: ColDef[] = useMemo(() => {
    const baseColumns: ColDef[] = [
      {
        headerName: t("clientsPage.id"),
        field: "id",
        sortable: true,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        checkboxSelection: true, // Adds checkbox for row selection
        headerCheckboxSelection: true, // Adds checkbox in header for select all
        headerCheckboxSelectionFilteredOnly: true, // Select only filtered rows
      },
      {
        headerName: t("clientsPage.name"),
        field: "name",
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: t("clientsPage.address"),
        field: "address",
        sortable: true,
        filter: "agTextColumnFilter",
      },
      {
        headerName: t("clientsPage.province"),
        field: "province",
        sortable: true,
        filter: "agTextColumnFilter",
      },
     /*  {
        headerName: t("clientsPage.totalOrders"),
        field: "totalOrders",
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: t("clientsPage.totalRevenue"),
        field: "totalRevenue",
        sortable: true,
        filter: "agNumberColumnFilter",
        comparator: numberComparator,

        valueFormatter: (params) => currencyFormatter(params.value),
      }, */
      {
        headerName: t("clientsPage.paymentMethod"),
        field: "paymentMethod",
        sortable: true,
        filter: "agTextColumnFilter",
      },
    ];

    return baseColumns;
  }, [t]);

  // Prepare row data
  const rowData = useMemo(() => Object.values(clients), [clients]);

  // Handle row selection
  const onSelectionChanged = () => {
    const selectedNodes = gridRef.current?.api.getSelectedNodes();
    const selectedIds = selectedNodes
      ? selectedNodes.map((node) => node.data.id)
      : [];
    setSelectedClients(selectedIds);
  };

  // Handle Select All with confirmation
  const handleSelectAll = () => {
    setSelectAllDialogOpen(true);
  };

  const confirmSelectAll = () => {
    gridRef.current?.api.selectAllFiltered();
    setSelectAllDialogOpen(false);
  };

  const cancelSelectAll = () => {
    setSelectAllDialogOpen(false);
  };

  // Handle Deselect All with confirmation
  const handleDeselectAll = () => {
    setDeselectAllDialogOpen(true);
  };

  const confirmDeselectAll = () => {
    gridRef.current?.api.deselectAll();
    setDeselectAllDialogOpen(false);
  };

  const cancelDeselectAll = () => {
    setDeselectAllDialogOpen(false);
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
      {/* Header with Selected Clients Counter and Select/Deselect All Buttons */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography variant="subtitle1">
          {t("eligibleClients.selectedClients")}: {selectedClients.length}
        </Typography>
        <Box>
          <Tooltip title={t("eligibleClients.selectAll")}>
            <IconButton
              onClick={handleSelectAll}
              color="primary"
              aria-label="Select All"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("eligibleClients.deselectAll")}>
            <IconButton
              onClick={handleDeselectAll}
              color="secondary"
              aria-label="Deselect All"
            >
              <RemoveIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* AG Grid Table */}
      <div className="ag-theme-quartz" style={{ height: 600, width: "100%" }}>

        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          rowSelection="multiple"
          onSelectionChanged={onSelectionChanged}
          suppressRowClickSelection={true} // Selection via checkboxes only
          pagination={true}
          paginationPageSize={100}

          enableCellTextSelection={true}
          overlayNoRowsTemplate="<span style='padding: 10px; border: 1px solid #444; background: lightgoldenrodyellow;'>No clients to display</span>"
          defaultColDef={{
            flex: 1,
            floatingFilter: true, // Enable floating filters
            suppressHeaderMenuButton: true,
          }}
        />
      </div>
      {/* Confirmation Dialog for Select All */}
      <Dialog
        open={selectAllDialogOpen}
        onClose={cancelSelectAll}
        aria-labelledby="select-all-dialog-title"
        aria-describedby="select-all-dialog-description"
      >
        <DialogTitle id="select-all-dialog-title">
          Confirm Select All
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="select-all-dialog-description">
            Are you sure you want to select all clients?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelSelectAll} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmSelectAll} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Deselect All */}
      <Dialog
        open={deselectAllDialogOpen}
        onClose={cancelDeselectAll}
        aria-labelledby="deselect-all-dialog-title"
        aria-describedby="deselect-all-dialog-description"
      >
        <DialogTitle id="deselect-all-dialog-title">
          Confirm Deselect All
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="deselect-all-dialog-description">
            Are you sure you want to deselect all clients?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeselectAll} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeselectAll} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EligibleClientsGrid;
