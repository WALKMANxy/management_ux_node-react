// src/components/calendarPage/PopOverEvent.tsx

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import Popover from "@mui/material/Popover";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../app/hooks";
import { selectUserById } from "../../features/users/userSlice";
import { CalendarEvent } from "../../models/dataModels";
import EventTitle from "./EventTitle";

/**
 * Props for the PopOverEvent component.
 */
interface PopOverEventProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  handleClose: () => void;
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

  // Select the user associated with the event
  const user = useAppSelector((state) => selectUserById(state, event.userId));
  const entityName = user?.entityName || t("popOverEvent.labels.unknown");

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
            <strong>{t("popOverEvent.labels.type")}:</strong>{" "}
            {t(`popOverEvent.labels.${event.eventType}`)}
          </Typography>
        </Box>

        {/* Event Reason */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="body1">
            <strong>{t("popOverEvent.labels.reason")}:</strong>{" "}
            {t(`reasons.${event.reason}`)}
          </Typography>
        </Box>

        {/* Event Note (Optional) */}
        {event.note && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>{t("popOverEvent.labels.note")}:</strong> {event.note}
          </Typography>
        )}

        {/* Edit and Delete Buttons (Visible Only to Admins and Non-Holiday Events) */}
        {userRole === "admin" && event.eventType !== "holiday" && (
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            {/* Edit Button */}
            <Tooltip title={t("popOverEvent.tooltips.edit")}>
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

            {/* Delete Button */}
            <Tooltip title={t("popOverEvent.tooltips.delete")}>
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
          </Stack>
        )}
      </Box>
    </Popover>
  );
};

export default React.memo(PopOverEvent);
