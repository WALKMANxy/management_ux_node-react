//src/components/statistics/grids/MovementsHistory.tsx
import { Box, Paper } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MovementsHistoryProps } from "../../../models/propsModels";
import { currencyFormatter, numberComparator } from "../../../utils/dataUtils";
import AGGridTable from "./AGGridTable";

const MovementsHistory: React.FC<MovementsHistoryProps> = ({ movements }) => {
  const { t } = useTranslation();

  /* useEffect(() => {
    console.log("Movements:", movements);
  }, [movements]);
 */
  // Flatten the movements array and filter out invalid articles
  const flattenedMovements = useMemo(() => {
/*     console.log("Processing movements:");
 */    return movements.flatMap((movement) => {
/*       console.log("Processing movement:", movement);
 */      return movement.details
        .filter((detail) => detail.brand && detail.brand !== ".")
        .map((detail) => ({
          ...detail,
          dateOfOrder: movement.dateOfOrder,
        }));
    });
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
        type: "numericColumn",
      },
      {
        headerName: t("movementsHistory.revenue"),
        field: "priceSold",
        valueFormatter: (params: { value: string }) =>
          currencyFormatter(parseFloat(params.value)),
        comparator: numberComparator,
        sortable: true,
        type: "numericColumn",
      },
      {
        headerName: t("movementsHistory.cost"),
        field: "priceBought",
        valueFormatter: (params: { value: string }) =>
          currencyFormatter(parseFloat(params.value)),
        comparator: numberComparator,
        sortable: true,
        type: "numericColumn",
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
