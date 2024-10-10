// src/components/visitPage/VisitsTable.tsx
import {
  Box,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectVisit } from "../../features/data/dataSlice";
import { selectVisits } from "../../features/promoVisits/promoVisitsSelectors";
import { showToast } from "../../services/toastMessage";

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

const StyledTable = styled(Table)(() => ({
  minWidth: 650,
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
  backgroundColor: theme.palette.grey[200],
}));

const StyledTableRow = styled(TableRow)<{ bgcolor?: string }>(
  ({ bgcolor }) => ({
    cursor: "pointer",
    backgroundColor: bgcolor || "inherit",
    "&:hover": {
      backgroundColor: "#f5f5f5",
    },
  })
);

interface VisitsTableProps {
  clientId: string;
}

const VisitsTable: React.FC<VisitsTableProps> = ({ clientId }) => {
  const dispatch = useAppDispatch();
  const visits = useAppSelector(selectVisits);
  const { t } = useTranslation();

  // Filter visits for the selected client
  const clientVisits = visits
    .filter((visit) => visit.clientId === clientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date ascending

  // Function to determine the row background color based on visit status
  const getRowBackgroundColor = (
    completed: boolean,
    pending: boolean
  ): string => {
    if (completed && !pending) {
      return "#e6f4ea"; // Faint Green
    } else if (!completed && !pending) {
      return "#fdecea"; // Faint Red
    } else if (pending && !completed) {
      return "#fff4e5"; // Faint Orange
    } else {
      return "inherit"; // Default
    }
  };

  // Handler for row click
  const handleRowClick = useCallback(
    (visitId: string) => {
      if (visitId) {
        dispatch(selectVisit(visitId));
      } else {
        showToast.error(
          t("visitsTable.selectVisitError", "Unable to select visit.")
        );
      }
    },
    [dispatch, t]
  );

  return (
    <Box sx={{ px: 1, height: "100%", overflowY: "auto" }}>
      <StyledTableContainer>
        <StyledTable
          aria-label={t("visitsTable.tableAriaLabel", "Visits Table")}
        >
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>
                {t("visitsTable.type", "Type")}
              </StyledTableHeadCell>
              <StyledTableHeadCell>
                {t("visitsTable.reason", "Reason")}
              </StyledTableHeadCell>
              <StyledTableHeadCell>
                {t("visitsTable.date", "Date")}
              </StyledTableHeadCell>
              <StyledTableHeadCell>
                {t("visitsTable.completed", "Completed")}
              </StyledTableHeadCell>
              <StyledTableHeadCell>
                {t("visitsTable.pending", "Pending")}
              </StyledTableHeadCell>
              <StyledTableHeadCell>
                {t("visitsTable.createdAt", "Created At")}
              </StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientVisits.map((visit) => (
              <StyledTableRow
                key={visit._id}
                hover
                onClick={() => handleRowClick(visit._id ?? "")}
                bgcolor={getRowBackgroundColor(visit.completed, visit.pending)}
              >
                <TableCell>
                  {visit.type || t("visitsTable.na", "N/A")}
                </TableCell>
                <TableCell>
                  {visit.visitReason || t("visitsTable.na", "N/A")}
                </TableCell>
                <TableCell>
                  {visit.date
                    ? dayjs(visit.date).format("DD/MM/YYYY HH:mm")
                    : t("visitsTable.na", "N/A")}
                </TableCell>
                <TableCell>
                  {visit.completed
                    ? t("visitsTable.yes", "Yes")
                    : t("visitsTable.no", "No")}
                </TableCell>
                <TableCell>
                  {visit.pending
                    ? t("visitsTable.yes", "Yes")
                    : t("visitsTable.no", "No")}
                </TableCell>
                <TableCell>
                  {visit.createdAt
                    ? dayjs(visit.createdAt).format("DD/MM/YYYY HH:mm")
                    : t("visitsTable.na", "N/A")}
                </TableCell>
              </StyledTableRow>
            ))}
            {clientVisits.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {t(
                    "visitsTable.noVisits",
                    "No visits found for this client."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
    </Box>
  );
};

export default VisitsTable;
