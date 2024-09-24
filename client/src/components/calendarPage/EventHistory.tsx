// src/components/calendarPage/EventHistory.tsx

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
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
  Tooltip,
  Typography,
} from "@mui/material";
import "animate.css"; // Add animate.css for animations
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import { useUpdateEventStatusMutation } from "../../features/calendar/calendarQuery";
import { selectAllUsers } from "../../features/users/userSlice";
import { CalendarEvent } from "../../models/dataModels";
import { showToast } from "../../utils/toastMessage";

interface EventHistoryProps {
  events: CalendarEvent[];
  userRole: string;
}

interface ApiError {
  data?: {
    message?: string;
  };
  message?: string;
}

/**
 * EventHistory Component
 * Displays a paginated table of calendar events with administrative actions.
 *
 * @param {EventHistoryProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
export const EventHistory: React.FC<EventHistoryProps> = ({
  events,
  userRole,
}) => {
  const { t } = useTranslation();
  const [updateEventStatus, { isLoading }] = useUpdateEventStatusMutation();

  const users = useAppSelector(selectAllUsers);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  /**
   * Handles page change in pagination.
   *
   * @param {unknown} _event - The event source of the callback.
   * @param {number} newPage - The new page number.
   */
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  /**
   * Handles change in rows per page.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event.
   */
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Filters out holiday events and sorts the remaining events by updatedAt in descending order.
   */
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

  /**
   * Associates each event with its corresponding user.
   */
  const eventsWithUsers = useMemo(() => {
    return filteredEvents.map((event) => {
      const user = users.find((u) => u._id === event.userId);
      return { ...event, user };
    });
  }, [filteredEvents, users]);

  /**
   * Handles the approval of an event.
   *
   * @param {string} eventId - The ID of the event to approve.
   */
  const handleApprove = async (eventId: string) => {
    try {
      await updateEventStatus({ eventId, status: "approved" }).unwrap();
      showToast.success(t("eventHistory.toast.approveSuccess"));
    } catch (error) {
      const apiError = error as ApiError;
      showToast.error(
        `${t("eventHistory.toast.approveFailure")}: ${
          apiError.data?.message ||
          apiError.message ||
          t("eventHistory.toast.genericError")
        }`
      );
    }
  };

  /**
   * Handles the rejection of an event.
   *
   * @param {string} eventId - The ID of the event to reject.
   */
  const handleReject = async (eventId: string) => {
    try {
      await updateEventStatus({ eventId, status: "rejected" }).unwrap();
      showToast.success(t("eventHistory.toast.rejectSuccess"));
    } catch (error) {
      const apiError = error as ApiError;
      showToast.error(
        `${t("eventHistory.toast.rejectFailure")}: ${
          apiError.data?.message ||
          apiError.message ||
          t("eventHistory.toast.genericError")
        }`
      );
    }
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
              <TableCell>{t("eventHistory.headers.user")}</TableCell>
              <TableCell>{t("eventHistory.headers.eventType")}</TableCell>
              <TableCell>{t("eventHistory.headers.reason")}</TableCell>
              <TableCell>{t("eventHistory.headers.startDate")}</TableCell>
              <TableCell>{t("eventHistory.headers.endDate")}</TableCell>
              <TableCell>{t("eventHistory.headers.status")}</TableCell>
              {userRole === "admin" && (
                <TableCell>{t("eventHistory.headers.actions")}</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {eventsWithUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((event) => (
                <TableRow
                  key={event._id}
                  sx={{ backgroundColor: getBackgroundColor(event) }}
                >
                  <TableCell>
                    {event.user?.entityName || t("eventHistory.unknown")}
                  </TableCell>
                  <TableCell>
                    {t(
                      `eventHistory.eventTypes.${event.eventType || "generic"}`
                    )}
                  </TableCell>
                  <TableCell>
                    {t(`eventHistory.reasons.${event.reason || "generic"}`)}
                  </TableCell>
                  <TableCell>
                    {event.startDate
                      ? dayjs(event.startDate).format("MMMM D, YYYY h:mm A")
                      : t("eventHistory.na")}
                  </TableCell>
                  <TableCell>
                    {event.endDate
                      ? dayjs(event.endDate).format("MMMM D, YYYY h:mm A")
                      : t("eventHistory.na")}
                  </TableCell>
                  <TableCell>
                    {t(`eventHistory.statuses.${event.status}`)}
                  </TableCell>
                  {userRole === "admin" && (
                    <TableCell>
                      {event.status === "pending" ? (
                        <>
                          <Tooltip title={t("eventHistory.tooltips.approve")}>
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
                          <Tooltip title={t("eventHistory.tooltips.reject")}>
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
        rowsPerPageOptions={[10, 20, 50]}
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
    </Paper>
  );
};

export default EventHistory;
