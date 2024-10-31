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

    const onGridReady = (params: { api: { sizeColumnsToFit: () => void } }) => {
      params.api.sizeColumnsToFit();
    };

    const defaultColDef = useMemo<AgGridReactProps["defaultColDef"]>(
      () => ({
        flex: 1,
        minWidth: 150,
        filter: true,
        floatingFilter: true,
        suppressHeaderMenuButton: true,
        resizable: true,
        sortable: true,
        suppressMovable: true,
      }),
      []
    );

    return (
      <div
        className="ag-theme-quartz"
        style={{
          height: 600,
          transform: isMobile ? "scale(0.75)" : "none",
          transformOrigin: "top left",
          width: isMobile ? "133.33%" : "100%",
        }}
      >
        <AgGridReact
          ref={ref}
          columnDefs={memoizedColumnDefs}
          rowData={memoizedRowData}
          pagination={false}
          paginationPageSize={100}
          paginationPageSizeSelector={paginationPageSizeSelector}
          quickFilterText={quickFilterText}
          enableCellTextSelection={true}
          onGridReady={onGridReady}
          rowBuffer={5}
          suppressPaginationPanel={true} 
          suppressColumnVirtualisation={false}
          defaultColDef={defaultColDef}
        />
      </div>
    );
  }
);

export default AGGridTable;
