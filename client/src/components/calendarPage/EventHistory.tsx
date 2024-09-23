// components/EventHistory.tsx

import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import { useUpdateEventStatusMutation } from "../../features/calendar/calendarQuery";
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

export const EventHistory: React.FC<EventHistoryProps> = ({
  events,
  userRole,
}) => {
  const [updateEventStatus, { isLoading }] = useUpdateEventStatusMutation();

  const handleApprove = async (eventId: string) => {
    try {
      await updateEventStatus({ eventId, status: "approved" }).unwrap();
      showToast.success("Event approved successfully!");
    } catch (error) {
      const apiError = error as ApiError;
      showToast.error(
        `Failed to approve event: ${
          apiError.data?.message ||
          apiError.message ||
          "An unexpected error occurred"
        }`
      );
    }
  };

  const handleReject = async (eventId: string) => {
    try {
      await updateEventStatus({ eventId, status: "rejected" }).unwrap();
      showToast.success("Event rejected successfully!");
    } catch (error) {
      const apiError = error as ApiError;
      showToast.error(
        `Failed to reject event: ${
          apiError.data?.message ||
          apiError.message ||
          "An unexpected error occurred"
        }`
      );
    }
  };

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" gutterBottom sx={{ padding: 2 }}>
        Event History
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User ID</TableCell>
            <TableCell>Event Type</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Status</TableCell>
            {userRole === "admin" && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event._id}>
              <TableCell>{event.userId}</TableCell>
              <TableCell>
                {event.eventType
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </TableCell>
              <TableCell>
                {event.reason
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </TableCell>
              <TableCell>
                {event.startDate
                  ? new Date(event.startDate).toLocaleString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                {event.endDate
                  ? new Date(event.endDate).toLocaleString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                {event.status
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </TableCell>
              {userRole === "admin" && (
                <TableCell>
                  {event.status === "pending" ? (
                    <>
                      <Button
                        color="primary"
                        onClick={() => handleApprove(event._id!)}
                        disabled={isLoading}
                      >
                        Approve
                      </Button>
                      <Button
                        color="secondary"
                        onClick={() => handleReject(event._id!)}
                        disabled={isLoading}
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
