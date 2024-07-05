import { Box, Paper } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MovementsHistoryProps } from "../../../models/models";
import { currencyFormatter, numberComparator } from "../../../utils/dataUtils";
import AGGridTable from "./AGGridTable";

const MovementsHistory: React.FC<MovementsHistoryProps> = ({ movements }) => {
  const { t } = useTranslation();

  const columnDefinitions = useMemo(
    () => [
      {
        headerName: t("movementsHistory.date"),
        field: "dateOfOrder",
        sortable: true,
      },
      {
        headerName: t("movementsHistory.brand"),
        valueGetter: (params: any) =>
          params.data.details.length > 0 ? params.data.details[0].brand : "",
        sortable: true,
      },
      {
        headerName: t("movementsHistory.oemId"),
        valueGetter: (params: any) =>
          params.data.details.length > 0
            ? params.data.details[0].articleId
            : "",
        sortable: true,
      },
      {
        headerName: t("movementsHistory.name"),
        valueGetter: (params: any) =>
          params.data.details.length > 0 ? params.data.details[0].name : "",
        sortable: true,
      },
      {
        headerName: t("movementsHistory.revenue"),
        valueGetter: (params: any) =>
          params.data.details.length > 0
            ? parseFloat(params.data.details[0].priceSold)
            : 0,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: t("movementsHistory.cost"),
        valueGetter: (params: any) =>
          params.data.details.length > 0
            ? parseFloat(params.data.details[0].priceBought)
            : 0,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        comparator: numberComparator,
        sortable: true,
      },
    ],
    [t]
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
