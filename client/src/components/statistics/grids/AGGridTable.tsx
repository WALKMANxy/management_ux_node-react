// src/components/common/AGGridTable.tsx
import { useMediaQuery } from "@mui/material";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import { forwardRef, useMemo } from "react";
import { AGGridTableProps } from "../../../models/propsModels";
import { paginationPageSizeSelector } from "../../../utils/constants";
import "./AGGridTable.css";

const AGGridTable = forwardRef<AgGridReact, AGGridTableProps>(
  ({ columnDefs, rowData, quickFilterText }, ref) => {
    const memoizedColumnDefs = useMemo(() => columnDefs, [columnDefs]);
    const memoizedRowData = useMemo(() => rowData, [rowData]);

    const isMobile = useMediaQuery("(max-width: 600px)");

    // In AGGridTable component
    const onGridReady = (params: { api: { sizeColumnsToFit: () => void } }) => {
      params.api.sizeColumnsToFit();
    };

    // Memoize defaultColDef
    const defaultColDef = useMemo<AgGridReactProps["defaultColDef"]>(
      () => ({
        flex: 1,
        minWidth: 150,
        filter: true,
        floatingFilter: true, // Enable floating filters
        suppressHeaderMenuButton: true,
        resizable: true, // Allow columns to be resizable
        sortable: true, // Enable sorting
        suppressMovable: true, // Prevent column reordering
      }),
      []
    );

    return (
      <div
        className="ag-theme-quartz"
        style={{
          height: 600,
          transform: isMobile ? "scale(0.75)" : "none", // Apply scale for mobile
          transformOrigin: "top left", // Anchor the scale to the top-left corner
          width: isMobile ? "133.33%" : "100%", // Adjust width to prevent clipping
        }}
      >
        <AgGridReact
          ref={ref}
          columnDefs={memoizedColumnDefs}
          rowData={memoizedRowData}
          pagination={false}
          paginationPageSize={100}
          paginationPageSizeSelector={paginationPageSizeSelector}
          quickFilterText={quickFilterText} // Pass quickFilterText to AgGridReact
          enableCellTextSelection={true}
          onGridReady={onGridReady}
          rowBuffer={5}
          suppressPaginationPanel={true} // Add this line to hide the pagination panel
          suppressColumnVirtualisation={false}
          defaultColDef={defaultColDef}
        />
      </div>
    );
  }
);

export default AGGridTable;
