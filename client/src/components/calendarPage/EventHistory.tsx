// src/components/calendarPage/EventHistory.tsx

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
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
  Typography,
} from "@mui/material";
import "animate.css"; // Add animate.css for animations
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import { selectAllUsers } from "../../features/users/userSlice";
import { useCalendar } from "../../hooks/useCalendar";
import { CalendarEvent } from "../../models/dataModels";
import {
  getComparator,
  getEditButtonStyles,
  isPastEvent,
} from "../../utils/calendarUtils";
import { EventForm } from "./EventForm";

interface EventHistoryProps {
  events: CalendarEvent[];
  userRole: string;
  handleDeleteEvent: (event: CalendarEvent) => void;
}

export const EventHistory: React.FC<EventHistoryProps> = ({
  events,
  userRole,
  handleDeleteEvent,
}) => {
  const { t } = useTranslation();

  const {
    openForm,
    handleApprove,
    handleReject,
    handleFormSubmit,
    handleFormCancel,
    isCreating,
    handleEditEvent, // Exposed edit handler
    isEditing,
    editingEvent,
    selectedDays,
    isLoading,
  } = useCalendar();

  const getEditButtonTooltip = (event: CalendarEvent) => {
    return isPastEvent(event)
      ? t("eventHistoryTooltips.editDisabled") // New tooltip for past events
      : t("eventHistoryTooltips.edit");
  };

  const users = useAppSelector(selectAllUsers);

  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<keyof CalendarEvent | "actions">(
    "updatedAt"
  );
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredEvents = useMemo(
    () =>
      events
        .filter((event) => event.eventType !== "holiday")
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [events]
  );

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

  const handleRequestSort = (property: keyof CalendarEvent | "actions") => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  /**
   * Determines the background color of a table row based on event type and status.
   *
   * @param {CalendarEvent} event - The event object.
   * @returns {string} The background color.
   */
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
    }
    return "";
  };

  return (
    <Paper
      className="animate__animated animate__animate_faster animate__fadeIn"
      elevation={3}
      sx={{ borderRadius: 2, padding: 2 }}
    >
      <Typography variant="h4" gutterBottom>
        {t("eventHistory.title")}
      </Typography>
      <TableContainer
        component={Paper}
        sx={{ maxHeight: "65dvh", overflowY: "auto" }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "userId"}
                  direction={orderBy === "userId" ? order : "asc"}
                  onClick={() => handleRequestSort("userId")}
                >
                  {t("eventHistory.headers.user")}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "eventType"}
                  direction={orderBy === "eventType" ? order : "asc"}
                  onClick={() => handleRequestSort("eventType")}
                >
                  {t("eventHistory.headers.eventType")}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "reason"}
                  direction={orderBy === "reason" ? order : "asc"}
                  onClick={() => handleRequestSort("reason")}
                >
                  {t("eventHistory.headers.reason")}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "startDate"}
                  direction={orderBy === "startDate" ? order : "asc"}
                  onClick={() => handleRequestSort("startDate")}
                >
                  {t("eventHistory.headers.startDate")}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "endDate"}
                  direction={orderBy === "endDate" ? order : "asc"}
                  onClick={() => handleRequestSort("endDate")}
                >
                  {t("eventHistory.headers.endDate")}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "status"}
                  direction={orderBy === "status" ? order : "asc"}
                  onClick={() => handleRequestSort("status")}
                >
                  {t("eventHistory.headers.status")}
                </TableSortLabel>
              </TableCell>
              {userRole === "admin" && (
                <TableCell>
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
            {sortedEvents
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((event) => (
                <TableRow
                  key={event._id}
                  sx={{ backgroundColor: getBackgroundColor(event) }}
                >
                  <TableCell sx={{ width: "auto", whiteSpace: "nowrap" }}>
                    {event.user?.entityName || t("eventHistory.unknown")}
                  </TableCell>
                  <TableCell sx={{ width: "auto", whiteSpace: "nowrap" }}>
                    {t(`eventTypes.${event.eventType || "generic"}`)}
                  </TableCell>
                  <TableCell sx={{ width: "auto", whiteSpace: "nowrap" }}>
                    {t(`reasons.${event.reason || "generic"}`)}
                  </TableCell>
                  <TableCell sx={{ width: "auto", whiteSpace: "nowrap" }}>
                    {event.startDate
                      ? dayjs(event.startDate).format("MMMM D, YYYY h:mm A")
                      : t("eventHistory.na")}
                  </TableCell>
                  <TableCell sx={{ width: "auto", whiteSpace: "nowrap" }}>
                    {event.endDate
                      ? dayjs(event.endDate).format("MMMM D, YYYY h:mm A")
                      : t("eventHistory.na")}
                  </TableCell>
                  <TableCell sx={{ width: "auto", whiteSpace: "nowrap" }}>
                    {t(`status.${event.status}`)}
                  </TableCell>
                  {userRole === "admin" && (
                    <TableCell sx={{ width: "auto", whiteSpace: "nowrap" }}>
                      {event.eventType === "visit" ? (
                        t("eventHistory.actions.na")
                      ) : event.status === "pending" ? (
                        <>
                          <Tooltip title={t("eventHistoryTooltips.approve")}>
                            <IconButton
                              onClick={() => handleApprove(event._id!)}
                              disabled={isLoading}
                              sx={{
                                backgroundColor: "green",
                                color: "white",
                                marginRight: 1,
                                borderRadius: "50%",
                                "&:hover": {
                                  backgroundColor: "darkgreen",
                                },
                              }}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("eventHistoryTooltips.reject")}>
                            <IconButton
                              onClick={() => handleReject(event._id!)}
                              disabled={isLoading}
                              sx={{
                                backgroundColor: "red",
                                color: "white",
                                borderRadius: "50%",
                                "&:hover": {
                                  backgroundColor: "darkred",
                                },
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : event.status === "approved" ||
                        event.status === "rejected" ? (
                        <>
                          <Tooltip title={getEditButtonTooltip(event)}>
                            <span>
                              <IconButton
                                onClick={() => handleEditEvent(event)}
                                sx={getEditButtonStyles(event)}
                                disabled={isPastEvent(event)} // Disable button for past events
                              >
                                <EditIcon />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip title={t("eventHistoryTooltips.delete")}>
                            <IconButton
                              onClick={() => handleDeleteEvent(event)}
                              sx={{
                                backgroundColor: "brown",
                                color: "white",
                                borderRadius: "50%",
                                "&:hover": {
                                  backgroundColor: "darkgray",
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
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
      <TablePagination
        rowsPerPageOptions={[50]}
        component="div"
        count={eventsWithUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          "& .MuiTablePagination-actions": {
            display: "flex",
            justifyContent: "flex-end", // Align actions to the right horizontally
            alignItems: "center", // Center actions vertically
          },
        }}
      />
      <EventForm
        key={editingEvent ? editingEvent._id : "new-event"}
        open={openForm}
        selectedDays={selectedDays}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        isSubmitting={isCreating || isEditing}
        initialData={editingEvent}
      />
    </Paper>
  );
};

export default EventHistory;
