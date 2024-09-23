// components/calendarPage/EventForm.tsx

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  DateTimePicker,
  LocalizationProvider,
  renderTimeViewClock,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectUserRole } from "../../features/auth/authSlice";
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
  "": [], // Handle empty eventType
};

export const EventForm: React.FC<EventFormProps> = ({
  open,
  selectedDays,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  const userRole = useSelector(selectUserRole);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateEventPayload>({
    defaultValues: {
      eventType: "", // No default value
      reason: "", // No default value
      note: "",
      startDate: selectedDays[0], // Add startDateTime to your payload
      endDate: selectedDays.length > 1 ? selectedDays[1] : selectedDays[0], // Add endDateTime to your payload
    },
  });

  const eventType = watch("eventType");

  React.useEffect(() => {
    if (open) {
      reset({
        eventType: userRole === "admin" ? "" : "absence", // Set to 'absence' for non-admins
        reason: "",
        note: "",
        startDate: selectedDays[0],
        endDate: selectedDays.length > 1 ? selectedDays[1] : selectedDays[0],
      });
    }
  }, [open, reset, userRole, selectedDays]);

  const handleFormSubmit = (data: CreateEventPayload) => {
    onSubmit(data);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onCancel}
        fullWidth
        maxWidth="xs"
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "2rem",
          },
        }}
      >
        <DialogTitle>{t("Create New Event")}</DialogTitle>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogContent sx={{ padding: 2 }}>
            {/* Start Time Picker */}
            <Controller
              name="startDate"
              control={control}
              rules={{ required: t("Start time is required") }}
              render={({ field }) => (
                <DateTimePicker
                  {...field}
                  label={t("Start Time")}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      // Keep the original date, update the time
                      const updatedDate = dayjs(selectedDays[0])
                        .hour(newValue.hour())
                        .minute(newValue.minute())
                        .second(newValue.second());
                      setValue("startDate", updatedDate.toDate());
                    }
                  }}
                  viewRenderers={{
                    day: () => null,
                    month: () => null,
                    year: () => null,
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                  }}
                  sx={{ mb: 2, width: "100%" }}
                />
              )}
            />

            {/* End Time Picker */}
            <Controller
              name="endDate"
              control={control}
              rules={{ required: t("End time is required") }}
              render={({ field }) => (
                <DateTimePicker
                  {...field}
                  label={t("End Time")}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      // Keep the original date, update the time
                      const updatedDate = dayjs(
                        selectedDays.length > 1
                          ? selectedDays[1]
                          : selectedDays[0]
                      )
                        .hour(newValue.hour())
                        .minute(newValue.minute())
                        .second(newValue.second());
                      setValue("endDate", updatedDate.toDate());
                    }
                  }}
                  viewRenderers={{
                    day: () => null,
                    month: () => null,
                    year: () => null,
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                  }}
                  sx={{ mt: 2, mb: 1, width: "100%" }}
                />
              )}
            />

            {/* Event Type Field (Visible Only to Admins) */}
            {userRole === "admin" && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="event-type-label">{t("Event Type")}</InputLabel>
                <Controller
                  name="eventType"
                  control={control}
                  rules={{ required: t("Event type is required") }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="event-type-label"
                      label={t("Event Type")}
                    >
                      <MenuItem value="absence">{t("Absence")}</MenuItem>
                      <MenuItem value="holiday">{t("Holiday")}</MenuItem>
                      <MenuItem value="event">{t("Event")}</MenuItem>
                    </Select>
                  )}
                />
                {errors.eventType && (
                  <span style={{ color: "red" }}>
                    {errors.eventType.message}
                  </span>
                )}
              </FormControl>
            )}

            {/* Reason Field */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="reason-label">{t("Reason")}</InputLabel>
              <Controller
                name="reason"
                control={control}
                rules={{ required: t("Reason is required") }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="reason-label"
                    label={t("Reason")}
                    disabled={userRole === "admin" ? !eventType : false} // Disable only if admin and eventType not selected
                  >
                    {eventType &&
                      reasonOptions[eventType]?.map((reason) => (
                        <MenuItem key={reason} value={reason}>
                          {t(`reasons.${reason}`)}
                        </MenuItem>
                      ))}
                  </Select>
                )}
              />
              {errors.reason && (
                <span style={{ color: "red" }}>{errors.reason.message}</span>
              )}
            </FormControl>

            {/* Note Field */}
            <Controller
              name="note"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("Note (Optional)")}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            {/* Cancel Button */}
            <IconButton
              onClick={onCancel}
              color="secondary"
              aria-label={t("Cancel")}
            >
              <CloseIcon />
            </IconButton>

            {/* Create Button */}
            <IconButton
              type="submit"
              color="primary"
              disabled={isSubmitting}
              aria-label={t("Create")}
            >
              {isSubmitting ? <CircularProgress size={24} /> : <CheckIcon />}
            </IconButton>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};
