import { Box, Paper } from "@mui/material";
import { ColDef } from "ag-grid-community";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { MovementDetailsHistoryProps } from "../../../models/propsModels";

import { MovementDetail } from "../../../models/dataModels";
import { currencyFormatter, numberComparator } from "../../../utils/dataUtils";
import AGGridTable from "./AGGridTable";

const MovementDetailsHistory: React.FC<MovementDetailsHistoryProps> = ({
  movementDetails,
}) => {
  const { t } = useTranslation();
  const userRole = useSelector((state: RootState) => state.auth.role);

  const columnDefinitions = useMemo<ColDef<MovementDetail>[]>(() => {
    const baseColumns: ColDef<MovementDetail>[] = [
      {
        headerName: t("movementDetailsHistory.articleId"),
        field: "articleId",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: t("movementDetailsHistory.name"),
        field: "name",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: t("movementDetailsHistory.brand"),
        field: "brand",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: t("movementDetailsHistory.quantity"),
        field: "quantity",
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: t("movementDetailsHistory.priceSold"),
        field: "priceSold",
        valueFormatter: (params) =>
          currencyFormatter(parseFloat(params.value as string)),
        comparator: numberComparator,
        sortable: true,
      },
    ];

    if (userRole === "admin" || userRole === "agent") {
      baseColumns.push(
        {
          headerName: t("movementDetailsHistory.unitPrice"),
          field: "unitPrice",
          valueFormatter: (params) =>
            currencyFormatter(parseFloat(params.value as string)),
          comparator: numberComparator,
          sortable: true,
        },
        {
          headerName: t("movementDetailsHistory.priceBought"),
          field: "priceBought",
          valueFormatter: (params) =>
            currencyFormatter(parseFloat(params.value as string)),
          comparator: numberComparator,
          sortable: true,
        }
      );
    }

    return baseColumns;
  }, [t, userRole]);

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
          rowData={movementDetails}
          paginationPageSize={20}
          quickFilterText=""
        />
      </Box>
    </Paper>
  );
};

export default MovementDetailsHistory;
