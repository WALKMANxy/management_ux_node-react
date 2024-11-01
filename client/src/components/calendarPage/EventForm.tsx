// src/components/calendarPage/EventForm.tsx

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
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
  renderDateViewCalendar,
  renderTimeViewClock,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectUserRole } from "../../features/auth/authSlice";
import { CalendarEvent } from "../../models/dataModels";
import { CreateEventPayload } from "../../models/propsModels";
import { locale } from "../../services/localizer";
import { showToast } from "../../services/toastMessage";
import { getTwoMonthsFromNow } from "../../utils/dataUtils";

interface EventFormProps {
  open: boolean;
  selectedDays: Date[];
  onSubmit: (data: CreateEventPayload) => void;
  onCancel: () => void;
  isSubmitting: boolean; // New prop for loading state
  initialData?: CalendarEvent | null; // For editing
}

// Updated reasonOptions: Removed 'holiday' and added 'company_holiday' under 'event'
const reasonOptions: Record<"absence" | "event", string[]> = {
  absence: [
    "illness",
    "day_off",
    "unexpected_event",
    "medical_visit",
    "generic",
  ],
  event: [
    "company_meeting",
    "company_party",
    "conference",
    "expo",
    "generic",
    "company_holiday",
  ],
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

  const isInitialMount = useRef(true);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateEventPayload>({
    defaultValues: {
      eventType:
        initialData?.eventType || (userRole === "admin" ? "event" : "absence"),
      reason: initialData?.reason || "",
      note: initialData?.note || "",
      startDate: initialData?.startDate || selectedDays[0],
      endDate:
        initialData?.endDate ||
        (selectedDays.length > 1 ? selectedDays[1] : selectedDays[0]),
    },
  });

  const eventType = watch("eventType");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  // State for form-level errors
  const [formError, setFormError] = useState<string | null>(null);

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
        onCancel();
        return;
      }

      const eventTypeValue =
        initialData?.eventType || (userRole === "admin" ? "event" : "absence");

      reset({
        eventType: eventTypeValue,
        reason: initialData?.reason || "",
        note: initialData?.note || "",
        startDate: initialData?.startDate || selectedDays[0],
        endDate:
          initialData?.endDate ||
          (selectedDays.length > 1 ? selectedDays[1] : selectedDays[0]),
      });

      setValue("eventType", eventTypeValue as CreateEventPayload["eventType"]);

      // Reset the initial mount flag when the form is opened
      isInitialMount.current = true;
    }
  }, [open, reset, userRole, selectedDays, onCancel, t, initialData, setValue]);

  // Reset reason field whenever eventType changes, but skip the initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      setValue("reason", "");
    }
  }, [eventType, setValue]);

  // Cross-field validation for startDate and endDate
  useEffect(() => {
    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);

      if (start.isAfter(end)) {
        setFormError(t("eventForm.validation.startAfterEnd"));
        setError("startDate", {
          type: "manual",
          message: t("eventForm.validation.startAfterEnd"),
        });
        setError("endDate", {
          type: "manual",
          message: t("eventForm.validation.endBeforeStart"),
        });
      } else {
        // Maximum duration validation: 2 weeks
        const maxDuration = dayjs(startDate).add(2, "week");
        if (end.isAfter(maxDuration)) {
          setFormError(t("eventForm.validation.durationTooLong"));
          setError("endDate", {
            type: "manual",
            message: t("eventForm.validation.durationTooLong"),
          });
        } else {
          setFormError(null);
          clearErrors(["startDate", "endDate"]);
        }
      }
    }
  }, [startDate, endDate, setError, clearErrors, t]);

  const handleFormSubmit = (data: CreateEventPayload) => {
    const formattedStartDate = dayjs(data.startDate).toDate();
    const formattedEndDate = dayjs(data.endDate).toDate();

    onSubmit({
      ...data,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={locale}>
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
        <DialogTitle>
          {initialData
            ? t("eventForm.editTitle")
            : userRole === "admin"
            ? t("eventForm.title")
            : t("eventForm.titleMarkAbsence")}
        </DialogTitle>

        {/* Display form-level error  */}
        {formError && (
          <DialogContent>
            <Alert severity="error">{formError}</Alert>
          </DialogContent>
        )}

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
                      setValue("startDate", newValue.toDate());
                    }
                  }}
                  viewRenderers={{
                    day: renderDateViewCalendar,
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                  }}
                  sx={{ mb: 2, width: "100%" }}
                  disablePast={true}
                />
              )}
            />
            {/* Display field-specific error for startDate */}
            {errors.startDate && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.startDate.message}
              </Alert>
            )}

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
                      setValue("endDate", newValue.toDate());
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
            {/* Display field-specific error for endDate */}
            {errors.endDate && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.endDate.message}
              </Alert>
            )}

            {/* Event Type Field */}
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
                    disabled={userRole !== "admin"}
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
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors.eventType.message}
                </Alert>
              )}
            </FormControl>

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
                    disabled={userRole === "admin" ? !eventType : false}
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
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors.reason.message}
                </Alert>
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
                disabled={isSubmitting || !!formError}
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
