// src/components/calendarPage/PopOverEvent.tsx

import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import DeleteIcon from "@mui/icons-material/Delete";

import EditIcon from "@mui/icons-material/Edit";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import Popover from "@mui/material/Popover";
import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectClient, selectVisit } from "../../features/data/dataSlice";
import { selectUserById } from "../../features/users/userSlice";
import { CalendarEvent } from "../../models/dataModels";
import { isNotDefaultTime } from "../../utils/calendarUtils";
import EventTitle from "./EventTitle";

/**
 * Props for the PopOverEvent component.
 */
interface PopOverEventProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  handleClose: (event: React.MouseEvent | Event) => void;
  event: CalendarEvent;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  userRole: string;
}

/**
 * PopOverEvent Component
 * Displays detailed information about a calendar event in a popover.
 *
 * @param {PopOverEventProps} props - Component props.
 * @returns {JSX.Element} The rendered component.
 */
const PopOverEvent: React.FC<PopOverEventProps> = ({
  open,
  anchorEl,
  handleClose,
  event,
  onEdit,
  onDelete,
  userRole,
}) => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Select the user associated with the event
  const user = useAppSelector((state) => selectUserById(state, event.userId));
  const entityName = user?.entityName || t("popOverEvent.unknown");

  // Function to handle visit navigation
  const handleGoToVisit = () => {
    if (event.eventType === "visit") {
      dispatch(selectClient(event.visitClientId!)); // Select client
      dispatch(selectVisit(event._id!)); // Select visit
      navigate("/visits"); // Navigate to /visits
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      PaperProps={{
        sx: {
          backdropFilter: "blur(10px)", // Frosted glass effect
          backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent background
          borderRadius: "8px",
          padding: 2,
        },
      }}
    >
      <Box sx={{ maxWidth: 300 }}>
        {/* Event Title */}
        <Typography variant="h6" gutterBottom>
          <EventTitle event={event} entityName={entityName} />
        </Typography>

        {/* Event Type */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="body1">
            <strong>{t("popOverEvent.type")}:</strong>{" "}
            {t(`eventTypes.${event.eventType}`)}
          </Typography>
        </Box>

        {/* Event Reason */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="body1">
            <strong>{t("popOverEvent.reason")}:</strong>{" "}
            {t(`reasons.${event.reason}`)}
          </Typography>
        </Box>

        {/* Conditionally Render Start Time if not 12:00 AM */}
        {isNotDefaultTime(event.startDate) && event.eventType !== "holiday" && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>{t("popOverEvent.startsAt")}:</strong>{" "}
            {dayjs(event.startDate).format("h:mm A")}
          </Typography>
        )}

        {/* Conditionally Render End Time if not 12:00 AM */}
        {isNotDefaultTime(event.endDate) &&
          event.eventType !== "holiday" &&
          event.eventType !== "visit" && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>{t("popOverEvent.endsAt")}:</strong>{" "}
              {dayjs(event.endDate).format("h:mm A")}
            </Typography>
          )}

        {/* Event Note (Optional) */}
        {event.note && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>{t("popOverEvent.note")}:</strong> {event.note}
          </Typography>
        )}

        {/* Event Status (Optional) */}
        {event.status && event.eventType === "absence" && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>{t("popOverEvent.status")}:</strong>{" "}
            {t(`status.${event.status}`)}
          </Typography>
        )}

        {/* Edit and Delete Buttons (Visible Only to Admins and Non-Holiday Events) */}
        {/* Edit, Go to Visit, and Delete Buttons (Visible based on roles and event types) */}
        <Stack direction="row" justifyContent={"flex-end"} spacing={2} sx={{ mt: 2 }}>
          {/* Go to Visit Button for Visit Events (Visible for admin, agent, client roles) */}
          {["admin", "agent", "client"].includes(userRole) &&
            event.eventType === "visit" && (
              <Tooltip title={t("popOverEvent.goToVisit")}>
                <IconButton
                  color="primary"
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    borderRadius: "50%",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                  onClick={handleGoToVisit} // Call handleGoToVisit for visits
                >
                  <AirplaneTicketIcon />
                </IconButton>
              </Tooltip>
            )}

          {/* Edit Button (Visible if eventType is not visit or if roles don't match Go to Visit conditions) */}
          {userRole === "admin" &&
            event.eventType !== "holiday" &&
            event.eventType !== "visit" && (
              <Tooltip title={t("popOverEvent.edit")}>
                <IconButton
                  color="primary"
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    borderRadius: "50%",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                  onClick={() => onEdit && onEdit(event)}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}

          {/* Delete Button (Always visible for admins and non-holiday events) */}
          {userRole === "admin" &&
            event.eventType !== "holiday" &&
            event.eventType !== "visit" && (
              <Tooltip title={t("popOverEvent.delete")}>
                <IconButton
                  color="secondary"
                  sx={{
                    bgcolor: "error.main",
                    color: "white",
                    borderRadius: "50%",
                    "&:hover": { bgcolor: "error.dark" },
                  }}
                  onClick={() => onDelete && onDelete(event)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
        </Stack>
      </Box>
    </Popover>
  );
};

export default React.memo(PopOverEvent);
