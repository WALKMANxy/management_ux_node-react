// src/components/calendarPage/EventHistory.tsx
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import "animate.css";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectClient, selectVisit } from "../../features/data/dataSlice";
import { selectAllUsers } from "../../features/users/userSlice";
import { CalendarEvent } from "../../models/dataModels";
import {
  getComparator,
  getDeleteButtonStyles,
  getEditButtonStyles,
  isDisabled,
} from "../../utils/calendarUtils";

interface EventHistoryProps {
  events: CalendarEvent[];
  userRole: string;
  handleDeleteEvent: (event: CalendarEvent) => void;
  handleApproveEvent: (eventId: string) => void;
  handleRejectEvent: (eventId: string) => void;
  handleEditEvent: (event: CalendarEvent) => void;
  openForm: boolean;
  handleFormSubmit: (eventData: CalendarEvent) => void;
  handleFormCancel: () => void;
  isCreating: boolean;
  selectedDays: Date[];
  isLoading: boolean;
}

export const EventHistory: React.FC<EventHistoryProps> = ({
  events,
  userRole,
  handleDeleteEvent,
  handleApproveEvent,
  handleRejectEvent,
  handleEditEvent,
  isLoading,
}) => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleGoToVisit = (event: CalendarEvent) => {
    dispatch(selectClient(event.visitClientId!));
    dispatch(selectVisit(event._id!));
    navigate("/visits");
  };

  const getEditButtonTooltip = (event: CalendarEvent) => {
    return isDisabled(event, userRole)
      ? t("eventHistoryTooltips.editDisabled")
      : t("eventHistoryTooltips.edit");
  };

  const users = useAppSelector(selectAllUsers);

  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof CalendarEvent | "actions">(
    "updatedAt"
  );

  // Pagination state
  const [page, setPage] = useState(0);
  const rowsPerPage = 50;

  // Filter state
  const [filter, setFilter] = useState<
    "All" | "Absence" | "Holiday" | "Event" | "Visit"
  >("All");

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Apply filtering
  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => event.eventType !== "holiday")
      .filter((event) => {
        if (filter === "All") return true;
        return event.eventType === filter.toLowerCase();
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [events, filter]);

  const eventsWithUsers = useMemo(() => {
    return filteredEvents.map((event) => {
      const user = users.find((u) => u._id === event.userId);
      return { ...event, user };
    });
  }, [filteredEvents, users]);

  // Sorting logic
  const sortedEvents = useMemo(() => {
    return [...eventsWithUsers].sort(getComparator(order, orderBy));
  }, [eventsWithUsers, order, orderBy]);

  // Apply pagination
  const paginatedEvents = useMemo(() => {
    return sortedEvents.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedEvents, page, rowsPerPage]);

  const handleRequestSort = (property: keyof CalendarEvent | "actions") => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const getBackgroundColor = (event: CalendarEvent) => {
    if (event.eventType === "event") {
      return "rgba(0, 0, 255, 0.05)"; // Faint blue for events
    } else if (event.eventType === "absence") {
      switch (event.status) {
        case "pending":
          return "rgba(255, 165, 0, 0.1)"; // Faint orange for pending
        case "approved":
          return "rgba(0, 255, 0, 0.1)"; // Faint green for approved
        case "rejected":
          return "rgba(255, 0, 0, 0.1)"; // Faint red for rejected
        default:
          return "";
      }
    } else if (event.eventType === "visit" && event.status === "pending") {
      return "rgba(255, 165, 0, 0.1)"; // Faint orange for pending visits
    }
    return "";
  };

  // Responsive font size and padding
  const getTableCellStyles = () => ({
    padding: isMobile ? "10px 8px" : "16px",
    fontSize: isMobile ? "0.8rem" : "0.875rem",
    whiteSpace: "nowrap" as const,
    // Adjust minWidth for better layout on mobile
    minWidth: isMobile ? "80px" : "auto",
  });

  // Handler to update filter and reset page to 0
  const handleFilterChange = (
    newFilter: "All" | "Absence" | "Holiday" | "Event" | "Visit"
  ) => {
    setFilter(newFilter);
    setPage(0);
  };

  return (
    <Paper
      className="animate__animated animate__animate_faster animate__fadeIn"
      elevation={3}
      sx={{ borderRadius: 2, padding: isMobile ? 1 : 2 }}
    >
      {/* Filter ButtonGroup */}
      <Box display="flex" justifyContent="flex-start" alignItems="center" mb={0}>
        <ButtonGroup
          variant="contained"
          aria-label={t("eventHistory.filterSelection", "Filter selection")}
          sx={{
            boxShadow: "none",
            gap: 1,
            transform: isMobile ? "scale(0.75)" : "none",
            transformOrigin: "top left",
            width: isMobile ? "133.33%" : "auto",
          }}
        >
          <Button
            onClick={() => handleFilterChange("All")}
            sx={{
              backgroundColor: filter === "All" ? "grey" : "black",
              "&:hover": {
                backgroundColor: filter === "All" ? "darkgrey" : "gray",
              },
            }}
          >
            {t("eventHistory.filterAll", "All")}
          </Button>
          <Button
            onClick={() => handleFilterChange("Absence")}
            sx={{
              backgroundColor: filter === "Absence" ? "orange" : "black",
              "&:hover": {
                backgroundColor: filter === "Absence" ? "darkorange" : "gray",
              },
            }}
          >
            {t("eventTypes.absence", "Absence")}
          </Button>
          <Button
            onClick={() => handleFilterChange("Holiday")}
            sx={{
              backgroundColor: filter === "Holiday" ? "green" : "black",
              "&:hover": {
                backgroundColor: filter === "Holiday" ? "darkgreen" : "gray",
              },
            }}
          >
            {t("eventTypes.holiday", "Holiday")}
          </Button>
          <Button
            onClick={() => handleFilterChange("Event")}
            sx={{
              backgroundColor: filter === "Event" ? "blue" : "black",
              "&:hover": {
                backgroundColor: filter === "Event" ? "darkblue" : "gray",
              },
            }}
          >
            {t("eventTypes.event", "Event")}
          </Button>
          <Button
            onClick={() => handleFilterChange("Visit")}
            sx={{
              backgroundColor: filter === "Visit" ? "purple" : "black",
              "&:hover": {
                backgroundColor: filter === "Visit" ? "darkpurple" : "gray",
              },
            }}
          >
            {t("eventTypes.visit", "Visit")}
          </Button>
        </ButtonGroup>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: "70vh",
          minHeight: "65vh",
          overflowY: "auto",
          overflowX: "auto",
          "&::-webkitScrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
          MsOverflowStyle: "none",
        }}
      >
        <Table stickyHeader size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              <TableCell sx={getTableCellStyles()}>
                <TableSortLabel
                  active={orderBy === "userId"}
                  direction={orderBy === "userId" ? order : "asc"}
                  onClick={() => handleRequestSort("userId")}
                >
                  {t("eventHistory.headers.user")}
                </TableSortLabel>
              </TableCell>
              <TableCell sx={getTableCellStyles()}>
                <TableSortLabel
                  active={orderBy === "eventType"}
                  direction={orderBy === "eventType" ? order : "asc"}
                  onClick={() => handleRequestSort("eventType")}
                >
                  {t("eventHistory.headers.eventType")}
                </TableSortLabel>
              </TableCell>
              <TableCell sx={getTableCellStyles()}>
                <TableSortLabel
                  active={orderBy === "reason"}
                  direction={orderBy === "reason" ? order : "asc"}
                  onClick={() => handleRequestSort("reason")}
                >
                  {t("eventHistory.headers.reason")}
                </TableSortLabel>
              </TableCell>
              <TableCell sx={getTableCellStyles()}>
                <TableSortLabel
                  active={orderBy === "startDate"}
                  direction={orderBy === "startDate" ? order : "asc"}
                  onClick={() => handleRequestSort("startDate")}
                >
                  {t("eventHistory.headers.startDate")}
                </TableSortLabel>
              </TableCell>
              <TableCell sx={getTableCellStyles()}>
                <TableSortLabel
                  active={orderBy === "endDate"}
                  direction={orderBy === "endDate" ? order : "asc"}
                  onClick={() => handleRequestSort("endDate")}
                >
                  {t("eventHistory.headers.endDate")}
                </TableSortLabel>
              </TableCell>
              <TableCell sx={getTableCellStyles()}>
                <TableSortLabel
                  active={orderBy === "status"}
                  direction={orderBy === "status" ? order : "asc"}
                  onClick={() => handleRequestSort("status")}
                >
                  {t("eventHistory.headers.status")}
                </TableSortLabel>
              </TableCell>
              {userRole === "admin" && (
                <TableCell sx={getTableCellStyles()}>
                  <TableSortLabel
                    active={orderBy === "actions"}
                    direction={orderBy === "actions" ? order : "asc"}
                    onClick={() => handleRequestSort("actions")}
                  >
                    {t("eventHistory.headers.actions")}
                  </TableSortLabel>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEvents.map((event) => (
              <TableRow
                key={event._id}
                sx={{ backgroundColor: getBackgroundColor(event) }}
              >
                <TableCell sx={getTableCellStyles()}>
                  {event.user?.entityName ||
                    t("eventHistory.system") ||
                    t("eventHistory.unknown")}
                </TableCell>
                <TableCell sx={getTableCellStyles()}>
                  {t(`eventTypes.${event.eventType || "generic"}`)}
                </TableCell>
                <TableCell sx={getTableCellStyles()}>
                  {t(`reasons.${event.reason || "generic"}`)}
                </TableCell>
                <TableCell sx={getTableCellStyles()}>
                  {event.startDate
                    ? dayjs(event.startDate).format("MMMM D, YYYY h:mm A")
                    : t("eventHistory.na")}
                </TableCell>
                <TableCell sx={getTableCellStyles()}>
                  {event.endDate
                    ? dayjs(event.endDate).format("MMMM D, YYYY h:mm A")
                    : t("eventHistory.na")}
                </TableCell>
                <TableCell sx={getTableCellStyles()}>
                  {t(`status.${event.status}`)}
                </TableCell>
                {userRole === "admin" && (
                  <TableCell sx={getTableCellStyles()}>
                    {event.eventType === "visit" ? (
                      <>
                        {/* Go to Visit Button for Visit Events (Visible for admin, agent, client roles) */}
                        {["admin", "agent", "client"].includes(userRole) && (
                          <Tooltip title={t("popOverEvent.goToVisit")}>
                            <IconButton
                              color="primary"
                              sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                borderRadius: "50%",
                                padding: isMobile ? "4px" : "8px",
                                "&:hover": { bgcolor: "primary.dark" },
                              }}
                              onClick={() => handleGoToVisit(event)}
                            >
                              <AirplaneTicketIcon
                                sx={{
                                  fontSize: isMobile ? "1rem" : "1.25rem",
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    ) : event.eventType === "absence" &&
                      event.status === "pending" ? (
                      <>
                        {/* Approve and Reject Buttons for Absence Events (Visible only to admin) */}
                        <Tooltip title={t("eventHistoryTooltips.approve")}>
                          <IconButton
                            onClick={() => handleApproveEvent(event._id!)}
                            disabled={isLoading}
                            sx={{
                              backgroundColor: "green",
                              color: "white",
                              marginRight: isMobile ? 0.5 : 1,
                              borderRadius: "50%",
                              padding: isMobile ? "4px" : "8px",
                              "&:hover": {
                                backgroundColor: "darkgreen",
                              },
                            }}
                          >
                            <CheckIcon
                              sx={{
                                fontSize: isMobile ? "1rem" : "1.25rem",
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("eventHistoryTooltips.reject")}>
                          <IconButton
                            onClick={() => handleRejectEvent(event._id!)}
                            disabled={isLoading}
                            sx={{
                              backgroundColor: "red",
                              color: "white",
                              borderRadius: "50%",
                              padding: isMobile ? "4px" : "8px",
                              "&:hover": {
                                backgroundColor: "darkred",
                              },
                            }}
                          >
                            <CloseIcon
                              sx={{
                                fontSize: isMobile ? "1rem" : "1.25rem",
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : event.status === "approved" ||
                      (event.status === "rejected" && userRole === "admin") ? (
                      <>
                        <Tooltip title={getEditButtonTooltip(event)}>
                          <span>
                            <IconButton
                              onClick={() => handleEditEvent(event)}
                              sx={{
                                ...getEditButtonStyles(event, userRole),
                                padding: isMobile ? "4px" : "8px",
                                "& .MuiSvgIcon-root": {
                                  fontSize: isMobile ? "1rem" : "1.25rem",
                                },
                              }}
                              disabled={isDisabled(event, userRole)}
                            >
                              <EditIcon />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title={t("eventHistoryTooltips.delete")}>
                          <span>
                            <IconButton
                              onClick={() => handleDeleteEvent(event)}
                              sx={{
                                ...getDeleteButtonStyles(event, userRole),
                                padding: isMobile ? "4px" : "8px",
                                "& .MuiSvgIcon-root": {
                                  fontSize: isMobile ? "1rem" : "1.25rem",
                                },
                              }}
                              disabled={isDisabled(event, userRole)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </>
                    ) : (
                      t("eventHistory.actions.na")
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Table Pagination */}
      <TablePagination
        rowsPerPageOptions={[]}
        component="div"
        count={sortedEvents.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        // Remove onRowsPerPageChange since rowsPerPage is fixed
        labelRowsPerPage=""
        sx={{
          "& .MuiTablePagination-toolbar": {
            display: "flex",
            justifyContent: "flex-end",
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-select": {
            display: "none",
          },
          "& .MuiTablePagination-displayedRows": {
            marginRight: 2,
            marginTop: 2,
          },
        }}
      />
    </Paper>
  );
};

export default EventHistory;
