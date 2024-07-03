// src/components/common/MovementsHistory.tsx
import React, { useMemo } from "react";
import { Paper, Box } from "@mui/material";
import { MovementsHistoryProps } from "../../../models/models";
import { currencyFormatter, numberComparator } from "../../../utils/dataUtils";
import AGGridTable from "./AGGridTable";

const MovementsHistory: React.FC<MovementsHistoryProps> = ({ movements }) => {
  const columnDefinitions = useMemo(
    () => [
      {
        headerName: "Date",
        field: "dateOfOrder",
        sortable: true,
      },
      {
        headerName: "Brand",
        valueGetter: (params: any) =>
          params.data.details.length > 0 ? params.data.details[0].brand : "",
        sortable: true,
      },
      {
        headerName: "OEM ID",
        valueGetter: (params: any) =>
          params.data.details.length > 0
            ? params.data.details[0].articleId
            : "",
        sortable: true,
      },
      {
        headerName: "Name",
        valueGetter: (params: any) =>
          params.data.details.length > 0 ? params.data.details[0].name : "",
        sortable: true,
      },
      {
        headerName: "Revenue",
        valueGetter: (params: any) =>
          params.data.details.length > 0
            ? parseFloat(params.data.details[0].priceSold)
            : 0,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: "Cost",
        valueGetter: (params: any) =>
          params.data.details.length > 0
            ? parseFloat(params.data.details[0].priceBought)
            : 0,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        comparator: numberComparator,
        sortable: true,
      },
    ],
    []
  );

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: "12px",
        background: "transparent",
        color: "#000",
        position: "relative",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <Box sx={{ height: 600, width: "100%" }}>
        <AGGridTable
          columnDefs={columnDefinitions}
          rowData={movements}
          paginationPageSize={20}
          quickFilterText=""
        />
      </Box>
    </Paper>
  );
};

export default MovementsHistory;
