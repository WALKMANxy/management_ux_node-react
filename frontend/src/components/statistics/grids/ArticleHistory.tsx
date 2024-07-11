import { Box, Paper } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Movement } from "../../../models/models";
import { currencyFormatter, numberComparator } from "../../../utils/dataUtils";
import AGGridTable from "./AGGridTable";
import { useGetClientsQuery } from "../../../services/api";

type ArticleHistoryProps = {
  articleId: string;
};

const ArticleHistory: React.FC<ArticleHistoryProps> = ({ articleId }) => {
  const { t } = useTranslation();

  const { data: clients = [] } = useGetClientsQuery();
  const movements: Movement[] = clients.flatMap(client => client.movements)
    .filter(movement => movement.details.some(detail => detail.articleId === articleId));

  const columnDefinitions = useMemo(
    () => [
      {
        headerName: t("movementsHistory.date"),
        field: "dateOfOrder",
        sortable: true,
      },
      {
        headerName: t("movementsHistory.client"),
        valueGetter: (params: any) =>
          params.data.client ? params.data.client.name : "",
        sortable: true,
      },
      {
        headerName: t("movementsHistory.revenue"),
        valueGetter: (params: any) =>
          params.data.details.some((detail: any) => detail.articleId === articleId)
            ? params.data.details.find((detail: any) => detail.articleId === articleId).priceSold
            : 0,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: t("movementsHistory.cost"),
        valueGetter: (params: any) =>
          params.data.details.some((detail: any) => detail.articleId === articleId)
            ? params.data.details.find((detail: any) => detail.articleId === articleId).priceBought
            : 0,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        comparator: numberComparator,
        sortable: true,
      },
    ],
    [t, articleId]
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

export default ArticleHistory;
