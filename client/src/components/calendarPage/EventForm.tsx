// src/components/calendarPage/EventForm.tsx

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
  Tooltip,
} from "@mui/material";
import {
  DateTimePicker,
  LocalizationProvider,
  renderTimeViewClock,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectUserRole } from "../../features/auth/authSlice";
import { CalendarEvent } from "../../models/dataModels";
import { CreateEventPayload } from "../../models/propsModels";
import { getTwoMonthsFromNow } from "../../utils/dataUtils";
import { showToast } from "../../utils/toastMessage";

interface EventFormProps {
  open: boolean;
  selectedDays: Date[];
  onSubmit: (data: CreateEventPayload) => void;
  onCancel: () => void;
  isSubmitting: boolean; // New prop for loading state
  initialData?: CalendarEvent | null; // For editing
}

const reasonOptions: Record<"absence" | "event", string[]> = {
  absence: [
    "illness",
    "day_off",
    "unexpected_event",
    "medical_visit",
    "generic",
  ],
  event: ["company_meeting", "company_party", "conference", "expo", "generic"],
};

export const EventForm: React.FC<EventFormProps> = ({
  open,
  selectedDays,
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
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
      eventType:
        initialData?.eventType || (userRole === "admin" ? "" : "absence"),
      reason: "",
      note: initialData?.note || "",
      startDate: initialData?.startDate || selectedDays[0],
      endDate:
        initialData?.endDate ||
        (selectedDays.length > 1 ? selectedDays[1] : selectedDays[0]),
    },
  });

  const eventType = watch("eventType");

  // Reset form when it's opened
  useEffect(() => {
    if (open) {
      const twoMonthsFromNow = getTwoMonthsFromNow();

      if (
        userRole !== "admin" &&
        dayjs(selectedDays[0]).isAfter(twoMonthsFromNow)
      ) {
        showToast.error(
          t("eventForm.validation.dateTooFar", {
            date: dayjs(twoMonthsFromNow).format("MMMM D, YYYY"),
          })
        );
        onCancel(); // Close the form immediately
        return;
      }

      const eventTypeValue =
        initialData?.eventType || (userRole === "admin" ? "" : "absence");

      reset({
        eventType: eventTypeValue,
        reason: initialData?.reason || "",
        note: initialData?.note || "",
        startDate: initialData?.startDate || selectedDays[0],
        endDate:
          initialData?.endDate ||
          (selectedDays.length > 1 ? selectedDays[1] : selectedDays[0]),
      });

      // Explicitly set the eventType to ensure it's updated
      setValue("eventType", eventTypeValue);
    }
  }, [open, reset, userRole, selectedDays, onCancel, t, initialData, setValue]);

  const handleFormSubmit = (data: CreateEventPayload) => {
    onSubmit({
      ...data,
      startDate: dayjs(data.startDate).toDate(), // Ensure Date object is passed
      endDate: dayjs(data.endDate).toDate(), // Ensure Date object is passed
    });
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
        <DialogTitle>{t("eventForm.title")}</DialogTitle>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogContent sx={{ padding: 2 }}>
            {/* Start Time Picker */}
            <Controller
              name="startDate"
              control={control}
              rules={{ required: t("eventForm.validation.startTimeRequired") }}
              render={({ field }) => (
                <DateTimePicker
                  {...field}
                  label={t("eventForm.labels.startTime")}
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
                  disablePast={true}
                />
              )}
            />

            {/* End Time Picker */}
            <Controller
              name="endDate"
              control={control}
              rules={{ required: t("eventForm.validation.endTimeRequired") }}
              render={({ field }) => (
                <DateTimePicker
                  {...field}
                  label={t("eventForm.labels.endTime")}
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
                  disablePast={true}

                />
              )}
            />

            {/* Event Type Field (Visible Only to Admins) */}
            {userRole === "admin" && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="event-type-label">
                  {t("eventForm.labels.eventType")}
                </InputLabel>
                <Controller
                  name="eventType"
                  control={control}
                  rules={{
                    required: t("eventForm.validation.eventTypeRequired"),
                  }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="event-type-label"
                      label={t("eventForm.labels.eventType")}
                    >
                      <MenuItem value="absence">
                        {t("eventForm.options.absence")}
                      </MenuItem>
                      <MenuItem value="event">
                        {t("eventForm.options.event")}
                      </MenuItem>
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
              <InputLabel id="reason-label">
                {t("eventForm.labels.reason")}
              </InputLabel>
              <Controller
                name="reason"
                control={control}
                rules={{ required: t("eventForm.validation.reasonRequired") }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="reason-label"
                    label={t("eventForm.labels.reason")}
                    disabled={userRole === "admin" ? !eventType : false} // Disable only if admin and eventType not selected
                  >
                    {(eventType === "absence" || eventType === "event") &&
                      reasonOptions[eventType]?.map((reason) => (
                        <MenuItem key={reason} value={reason}>
                          {t(`eventForm.reasons.${reason}`)}
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
                  label={t("eventForm.labels.note")}
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
            <Tooltip title={t("eventForm.tooltips.cancel")}>
              <IconButton
                onClick={onCancel}
                color="secondary"
                aria-label={t("eventForm.labels.cancel")}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>

            {/* Create Button */}
            <Tooltip title={t("eventForm.tooltips.create")}>
              <IconButton
                type="submit"
                color="primary"
                disabled={isSubmitting}
                aria-label={t("eventForm.labels.create")}
              >
                {isSubmitting ? <CircularProgress size={24} /> : <CheckIcon />}
              </IconButton>
            </Tooltip>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EventForm;
