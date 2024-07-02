// src/components/common/AGGridTable.tsx
import { forwardRef } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "../common/AGGridTable.css";

interface AGGridTableProps {
  columnDefs: ColDef[];
  rowData: any[];
  paginationPageSize: number;
  quickFilterText: string; // Added quickFilterText prop
}

const paginationPageSizeSelector = [20, 50, 100, 200, 500];

const AGGridTable = forwardRef<AgGridReact, AGGridTableProps>(
  ({ columnDefs, rowData,  quickFilterText }, ref) => {
    return (
      <div className="ag-theme-quartz" style={{ height: 600, width: "100%" }}>
        <AgGridReact
          ref={ref}
          columnDefs={columnDefs}
          rowData={rowData}
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeSelector={paginationPageSizeSelector}
          quickFilterText={quickFilterText} // Pass quickFilterText to AgGridReact
          defaultColDef={{
            flex: 1,
            minWidth: 150,
            filter: true,
            floatingFilter: true, // Enable floating filters
            suppressHeaderMenuButton: true,
          }}
        />
      </div>
    );
  }
);

export default AGGridTable;
