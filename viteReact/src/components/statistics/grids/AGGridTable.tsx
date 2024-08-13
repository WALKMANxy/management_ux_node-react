// src/components/common/AGGridTable.tsx
import { AgGridReact } from "ag-grid-react";
import { ForwardedRef, forwardRef, memo } from "react";
import { AGGridTableProps } from "../../../models/propsModels";
import { paginationPageSizeSelector } from "../../../utils/constants";
import "./AGGridTable.css";

const AGGridTable = memo(forwardRef<AgGridReact, AGGridTableProps>(
  ({ columnDefs, rowData, quickFilterText, ...restProps }, ref: ForwardedRef<AgGridReact>): JSX.Element => {
    return (
      <div className="ag-theme-quartz" style={{ height: 600, width: "100%" }}>
        <AgGridReact
          ref={ref}
          columnDefs={columnDefs}
          rowData={rowData}
          pagination={true}
          paginationPageSizeSelector={paginationPageSizeSelector}
          quickFilterText={quickFilterText}
          defaultColDef={{
            flex: 1,
            minWidth: 150,
            filter: true,
            floatingFilter: true,
            suppressHeaderMenuButton: true,
          }}
          {...restProps}
        />
      </div>
    );
  }
));

AGGridTable.displayName = "AGGridTable";

export default AGGridTable;