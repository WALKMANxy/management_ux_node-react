// src/components/common/AGGridTable.tsx
import { forwardRef } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import "../grids/AGGridTable.css";
import { AGGridTableProps } from "../../../models/models";
import { paginationPageSizeSelector } from "../../../utils/constants";

const AGGridTable = forwardRef<AgGridReact, AGGridTableProps>(
  ({ columnDefs, rowData, quickFilterText }, ref) => {
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
