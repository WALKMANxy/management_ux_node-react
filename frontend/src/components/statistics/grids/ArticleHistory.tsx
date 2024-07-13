import { Box, Paper, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Movement } from "../../../models/models";
import { currencyFormatter, numberComparator } from "../../../utils/dataUtils";
import AGGridTable from "./AGGridTable";
import { useGetClientsQuery } from "../../../services/api";

type ArticleHistoryProps = {
  articleId: string;
  clientMovements?: Movement[]; // Ensure clientName is included
};

const ArticleHistory: React.FC<ArticleHistoryProps> = ({
  articleId,
  clientMovements,
}) => {
  const { t } = useTranslation();

  const { data: clients = [] } = useGetClientsQuery();

  // If clientMovements is provided, use it; otherwise, fetch all clients' movements
  const movements: Movement[] = (
    clientMovements ||
    clients.flatMap((client) =>
      client.movements.map((movement) => ({
        ...movement,
        clientName: client.name,
      }))
    )
  ).filter((movement) =>
    movement.details.some((detail) => detail.articleId === articleId)
  );

  const columnDefinitions = useMemo(
    () => [
      {
        headerName: t("movementsHistory.date"),
        field: "dateOfOrder",
        sortable: true,
      },
      {
        headerName: t("movementsHistory.client"),
        field: "clientName",
        sortable: true,
      },
      {
        headerName: t("movementsHistory.quantity"),
        valueGetter: (params: any) =>
          params.data.details.some(
            (detail: any) => detail.articleId === articleId
          )
            ? params.data.details.find(
                (detail: any) => detail.articleId === articleId
              ).quantity
            : 0,
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: t("movementsHistory.revenue"),
        valueGetter: (params: any) =>
          params.data.details.some(
            (detail: any) => detail.articleId === articleId
          )
            ? params.data.details.find(
                (detail: any) => detail.articleId === articleId
              ).priceSold
            : 0,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: t("movementsHistory.cost"),
        valueGetter: (params: any) =>
          params.data.details.some(
            (detail: any) => detail.articleId === articleId
          )
            ? params.data.details.find(
                (detail: any) => detail.articleId === articleId
              ).priceBought
            : 0,
        valueFormatter: (params: any) => currencyFormatter(params.value),
        comparator: numberComparator,
        sortable: true,
      },
    ],
    [t, articleId]
  );

  console.log("ArticleHistory movements: ", movements);

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
        {movements.length > 0 ? (
          <AGGridTable
            columnDefs={columnDefinitions}
            rowData={movements}
            paginationPageSize={20}
            quickFilterText=""
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography variant="h6" sx={{ textAlign: "center" }}>
              {t("articleDetails.noHistory")}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ArticleHistory;
