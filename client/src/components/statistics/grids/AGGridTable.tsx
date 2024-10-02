// src/components/common/AGGridTable.tsx
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
      }),
      []
    );

    return (
      <div
        className="ag-theme-quartz"
        style={{ height: 600, width: "100%" }}
      >
        <AgGridReact
          ref={ref}
          columnDefs={memoizedColumnDefs}
          rowData={memoizedRowData}
          pagination={true}
          paginationPageSize={100}
          paginationPageSizeSelector={paginationPageSizeSelector}
          quickFilterText={quickFilterText} // Pass quickFilterText to AgGridReact
          enableCellTextSelection={true}
          defaultColDef={defaultColDef}
        />
      </div>
    );
  }
);

export default AGGridTable;
