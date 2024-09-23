// components/EventForm.tsx

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { CalendarEvent } from "../../models/dataModels";
import { CreateEventPayload } from "../../models/propsModels";

interface EventFormProps {
  open: boolean;
  selectedDays: Date[];
  onSubmit: (data: CreateEventPayload) => void;
  onCancel: () => void;
  isSubmitting: boolean; // New prop for loading state
}

const reasonOptions: Record<
  CalendarEvent["eventType"],
  CalendarEvent["reason"][]
> = {
  absence: [
    "illness",
    "day_off",
    "unexpected_event",
    "medical_visit",
    "generic",
  ],
  holiday: ["public_holiday", "company_holiday"],
  event: ["company_meeting", "company_party", "conference", "expo", "generic"],
};

export const EventForm: React.FC<EventFormProps> = ({
  open,
  selectedDays,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateEventPayload>({});

  const eventType = watch("eventType");

  useEffect(() => {
    if (open) {
      reset({
        eventType: undefined, // No default value for eventType
        reason: undefined, // No default value for reason
        note: "",
      });
    }
  }, [open, reset]);

  const handleFormSubmit = (data: CreateEventPayload) => {
    onSubmit(data);
  };

  const startDate = selectedDays[0];
  const endDate = selectedDays[1];

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Create New Event</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <TextField
            label="Start Date"
            value={startDate ? startDate.toLocaleString() : "Not selected"}
            fullWidth
            margin="normal"
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            label="End Date"
            value={endDate ? endDate.toLocaleString() : "Not selected"}
            fullWidth
            margin="normal"
            InputProps={{
              readOnly: true,
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="event-type-label">Event Type</InputLabel>
            <Controller
              name="eventType"
              control={control}
              rules={{ required: "Event type is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="event-type-label"
                  label="Event Type"
                  defaultValue="absence"
                >
                  <MenuItem value="absence">Absence</MenuItem>
                  <MenuItem value="holiday">Holiday</MenuItem>
                  <MenuItem value="event">Event</MenuItem>
                </Select>
              )}
            />
            {errors.eventType && (
              <span style={{ color: "red" }}>{errors.eventType.message}</span>
            )}
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="reason-label">Reason</InputLabel>
            <Controller
              name="reason"
              control={control}
              rules={{ required: "Reason is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="reason-label"
                  label="Reason"
                  disabled={!eventType}
                >
                  {reasonOptions[eventType].map((reason) => (
                    <MenuItem key={reason} value={reason}>
                      {reason
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.reason && (
              <span style={{ color: "red" }}>{errors.reason.message}</span>
            )}
          </FormControl>
          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Note (Optional)"
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="secondary">
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
