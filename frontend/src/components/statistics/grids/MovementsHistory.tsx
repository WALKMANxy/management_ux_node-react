import { Box, Paper } from "@mui/material";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MovementsHistoryProps } from "../../../models/models";
import { currencyFormatter, numberComparator } from "../../../utils/dataUtils";
import AGGridTable from "./AGGridTable";

const MovementsHistory: React.FC<MovementsHistoryProps> = ({ movements }) => {
  const { t } = useTranslation();

   useEffect(() => {
    console.log("Movements:", movements);
  }, [movements]); 

  // Flatten the movements array and filter out invalid articles
  const flattenedMovements = useMemo(() => {
    return movements.flatMap((movement) =>
      movement.details
        .filter((detail) => detail.brand && detail.brand !== ".")
        .map((detail) => ({
          ...detail,
          dateOfOrder: movement.dateOfOrder,
        }))
    );
  }, [movements]);

  const columnDefinitions = useMemo(
    () => [
      {
        headerName: t("movementsHistory.date"),
        field: "dateOfOrder",
        sortable: true,
      },
      {
        headerName: t("movementsHistory.brand"),
        field: "brand",
        sortable: true,
      },
      {
        headerName: t("movementsHistory.oemId"),
        field: "articleId",
        sortable: true,
      },
      {
        headerName: t("movementsHistory.name"),
        field: "name",
        sortable: true,
      },
      {
        headerName: t("movementsHistory.quantity"),
        field: "quantity",
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: t("movementsHistory.revenue"),
        field: "priceSold",
        valueFormatter: (params: any) =>
          currencyFormatter(parseFloat(params.value)),
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: t("movementsHistory.cost"),
        field: "priceBought",
        valueFormatter: (params: any) =>
          currencyFormatter(parseFloat(params.value)),
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
          rowData={flattenedMovements}
          paginationPageSize={20}
          quickFilterText=""
        />
      </Box>
    </Paper>
  );
};

export default MovementsHistory;
