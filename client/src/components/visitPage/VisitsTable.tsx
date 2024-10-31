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
  TableSortLabel,
  TablePagination,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectVisit } from "../../features/data/dataSlice";
import { selectVisits } from "../../features/promoVisits/promoVisitsSelectors";
import { showToast } from "../../services/toastMessage";
import { Visit } from "../../models/dataModels";

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
  clientId: string | null;
}

type Order = "asc" | "desc";

interface HeadCell {
  id: keyof Visit | "actions";
  label: string;
  sortable: boolean;
}


const VisitsTable: React.FC<VisitsTableProps> = ({ clientId }) => {
  const dispatch = useAppDispatch();
  const visits = useAppSelector(selectVisits);
  const { t } = useTranslation();

  // Sorting state
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof Visit>("date");

  // Pagination state
  const [page, setPage] = useState(0);
  const rowsPerPage = 10; // You can adjust this value or make it dynamic

  // Define table headers
  const headCells: HeadCell[] = useMemo(() => {
    const cells: HeadCell[] = [
      {
        id: "type",
        label: t("visitsTable.type", "Type"),
        sortable: true,
      },
      {
        id: "visitReason",
        label: t("visitsTable.reason", "Reason"),
        sortable: true,
      },
      {
        id: "date",
        label: t("visitsTable.date", "Date"),
        sortable: true,
      },
      {
        id: "completed",
        label: t("visitsTable.completed", "Completed"),
        sortable: true,
      },
      {
        id: "pending",
        label: t("visitsTable.pending", "Pending"),
        sortable: true,
      },
      {
        id: "createdAt",
        label: t("visitsTable.createdAt", "Created At"),
        sortable: true,
      },
    ];

    if (!clientId) {
      cells.unshift({
        id: "clientId",
        label: t("visitsTable.clientId", "Client ID"),
        sortable: true,
      });
    }

    return cells;
  }, [t, clientId]);

  const descendingComparator = useCallback((a: Visit, b: Visit, orderBy: keyof Visit) => {
    const aValue = a?.[orderBy];
    const bValue = b?.[orderBy];

    if (bValue === undefined) return -1;
    if (aValue === undefined) return 1;

    if (bValue < aValue) {
      return -1;
    }
    if (bValue > aValue) {
      return 1;
    }
    return 0;
  }, []);

  // Comparator function for sorting
  const getComparator = useCallback(
    (
      order: Order,
      orderBy: keyof Visit
    ): ((a: Visit, b: Visit) => number) => {
      return order === "desc"
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
    },
    [descendingComparator]
  );



  // Filter and sort visits
  const sortedVisits = useMemo(() => {
    const filtered = clientId
      ? visits.filter((visit) => visit.clientId === clientId)
      : visits;

    const stabilizedThis = filtered.map((el, index) => [el, index] as const);

    stabilizedThis.sort((a, b) => {
      const cmp = getComparator(order, orderBy)(a[0], b[0]);
      if (cmp !== 0) return cmp;
      return a[1] - b[1];
    });

    return stabilizedThis.map((el) => el[0]);
  }, [visits, clientId, order, orderBy, getComparator]);

  // Paginate visits
  const paginatedVisits = useMemo(() => {
    return sortedVisits.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedVisits, page, rowsPerPage]);

  // Function to determine the row background color based on visit status
  const getRowBackgroundColor = (completed: boolean, pending: boolean): string => {
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
        showToast.error(t("visitsTable.selectVisitError", "Unable to select visit."));
      }
    },
    [dispatch, t]
  );

  // Handler for sorting
  const handleRequestSort = (property: keyof Visit) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handler for page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ px: 1, height: "100%", overflowY: "auto" }}>
      <StyledTableContainer>
        <StyledTable
          aria-label={t("visitsTable.tableAriaLabel", "Visits Table")}
        >
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <StyledTableHeadCell key={headCell.id}>
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={() => handleRequestSort(headCell.id as keyof Visit)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </StyledTableHeadCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedVisits.map((visit) => (
              <StyledTableRow
                key={visit._id}
                hover
                onClick={() => handleRowClick(visit._id ?? "")}
                bgcolor={getRowBackgroundColor(visit.completed, visit.pending)}
              >
                {!clientId && <TableCell>{visit.clientId}</TableCell>}
                <TableCell>
                  {visit.type
                    ? t(
                        `visitsTable.visitType.${visit.type.toLowerCase()}`,
                        visit.type
                      )
                    : t("visitsTable.na", "N/A")}
                </TableCell>
                <TableCell>
                  {visit.visitReason
                    ? t(
                        `visitsTable.visitReason.${visit.visitReason
                          .replace(" ", "")
                          .toLowerCase()}`,
                        visit.visitReason
                      )
                    : t("visitsTable.na", "N/A")}
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
            {paginatedVisits.length === 0 && (
              <TableRow>
                <TableCell colSpan={headCells.length} align="center">
                  {t("visitsTable.noVisits", "No visits found for this client.")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
      {/* Pagination Controls */}
      <TablePagination
        component="div"
        count={sortedVisits.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[rowsPerPage]}
        labelRowsPerPage=""
        sx={{
          "& .MuiTablePagination-toolbar": {
            display: "flex",
            justifyContent: "flex-end",
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-select":
            {
              display: "none",
            },
          "& .MuiTablePagination-displayedRows": {
            marginRight: 2,
            marginTop: 2,
          },
        }}
      />
    </Box>
  );
};

export default VisitsTable;
