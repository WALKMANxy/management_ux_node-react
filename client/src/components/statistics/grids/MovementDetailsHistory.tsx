// src/components/movementsPage/MovementDetailsHistory.tsx
import { Box } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { MovementDetailsHistoryProps } from "../../../models/propsModels";
import {
  customCurrencyFormatter,
  numberComparator,
} from "../../../utils/dataUtils";
import AGGridTable from "./AGGridTable";

const MovementDetailsHistory: React.FC<MovementDetailsHistoryProps> = ({
  movementDetails,
}) => {
  const { t } = useTranslation();
  const userRole = useSelector((state: RootState) => state.auth.role);

  /*  // Log the movementDetails to inspect the data structure
  useEffect(() => {
    console.log("Movement Details:", movementDetails);
  }, [movementDetails]); */

  // Define a stable formatter function to prevent unnecessary re-creations

  const columnDefinitions = useMemo(() => {
    const baseColumns = [
      {
        headerName: t("movementDetails.articleId"),
        field: "articleId",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: t("movementDetails.name"),
        field: "name",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: t("movementDetails.brand"),
        field: "brand",
        filter: "agTextColumnFilter",
        sortable: true,
      },
      {
        headerName: t("movementDetails.quantity"),
        field: "quantity",
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: t("movementDetails.priceSold"),
        field: "priceSold",
        valueFormatter: customCurrencyFormatter,
        comparator: numberComparator,
        sortable: true,
      },
    ];

    if (userRole === "admin" || userRole === "agent") {
      baseColumns.push(
        {
          headerName: t("movementDetails.unitPrice"),
          field: "unitPrice",
          valueFormatter: customCurrencyFormatter,
          comparator: numberComparator,
          sortable: true,
        },
        {
          headerName: t("movementDetails.priceBought"),
          field: "priceBought",
          valueFormatter: customCurrencyFormatter,
          comparator: numberComparator,
          sortable: true,
        }
      );
    }

    return baseColumns;
  }, [t, userRole]);

  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <AGGridTable
        columnDefs={columnDefinitions}
        rowData={movementDetails}
        paginationPageSize={20}
        quickFilterText=""
      />
    </Box>
  );
};

export default MovementDetailsHistory;
