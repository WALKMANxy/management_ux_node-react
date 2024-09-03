import { Box, Paper, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { Movement, MovementDetail } from "../../../models/dataModels";
import { Client } from "../../../models/entityModels";
import { currencyFormatter, numberComparator } from "../../../utils/dataUtils";
import AGGridTable from "./AGGridTable";

type ArticleHistoryProps = {
  articleId: string;
  clientMovements?: Movement[];
};

const ArticleHistory: React.FC<ArticleHistoryProps> = ({
  articleId,
  clientMovements,
}) => {
  const { t } = useTranslation();
  const clients = useSelector((state: RootState) => state.data.clients);

  const movements: Movement[] = useMemo(() => {
    const allMovements =
      clientMovements ||
      Object.values(clients).flatMap((client: Client) =>
        client.movements.map((movement: Movement) => ({
          ...movement,
          clientName: client.name,
        }))
      );

    return allMovements.filter((movement: Movement) =>
      movement.details.some(
        (detail: MovementDetail) => detail.articleId === articleId
      )
    );
  }, [clientMovements, clients, articleId]);

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
        valueGetter: (params: { data: Movement }) => {
          const detail = params.data.details.find(
            (detail: MovementDetail) => detail.articleId === articleId
          );
          return detail ? detail.quantity : 0;
        },
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: t("movementsHistory.revenue"),
        valueGetter: (params: { data: Movement }) => {
          const detail = params.data.details.find(
            (detail: MovementDetail) => detail.articleId === articleId
          );
          return detail ? detail.priceSold : 0;
        },
        valueFormatter: (params: { value: number }) =>
          currencyFormatter(params.value),
        comparator: numberComparator,
        sortable: true,
      },
      {
        headerName: t("movementsHistory.cost"),
        valueGetter: (params: { data: Movement }) => {
          const detail = params.data.details.find(
            (detail: MovementDetail) => detail.articleId === articleId
          );
          return detail ? detail.priceBought : 0;
        },
        valueFormatter: (params: { value: number }) =>
          currencyFormatter(params.value),
        comparator: numberComparator,
        sortable: true,
      },
    ],
    [t, articleId]
  );

  /*   console.log("ArticleHistory movements: ", movements);
   */
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
