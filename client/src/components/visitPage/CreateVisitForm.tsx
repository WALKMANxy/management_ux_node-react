// src/components/visitPage/CreateVisitForm.tsx
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Box,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDateTimePicker } from "@mui/x-date-pickers/StaticDateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import dayjs, { Dayjs } from "dayjs";
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import { createVisitAsync } from "../../features/data/dataSlice";

interface CreateVisitFormProps {
  clientId: string;
  onClose: () => void;
}

const CreateVisitForm: React.FC<CreateVisitFormProps> = ({
  clientId,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(
    (state: RootState) => state.data.currentUserDetails
  );

  const [type, setType] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [notePublic, setNotePublic] = useState<string>("");

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!type || !reason || !date) {
      setSnackbarMessage("Please fill in all required fields.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const visitData = {
      clientId,
      type,
      visitReason: reason,
      date: date.toISOString(),
      notePublic: notePublic.trim() === "" ? undefined : notePublic.trim(),
      visitIssuedBy: currentUser?.id || "unknown",
      pending: true,
      completed: false,
    };

    try {
      await dispatch(createVisitAsync(visitData)).unwrap();
      setSnackbarMessage("Visit created successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setType("");
      setReason("");
      setDate(dayjs());
      setNotePublic("");
      onClose();
    } catch (error: unknown) {
      setSnackbarMessage(
        error instanceof Error ? error.message : "Failed to create visit."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          m: 2,
          p: 2,
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Create New Visit
        </Typography>
        <Grid container spacing={2}>
          {/* Type Field */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required variant="filled">
              <InputLabel id="visit-type-label">Type</InputLabel>
              <Select
                labelId="visit-type-label"
                id="visit-type"
                value={type}
                label="Type *"
                onChange={(e) => setType(e.target.value)}
                sx={{ backgroundColor: "#f3e5f5" }} // Faint purple
              >
                <MenuItem value="Regular">Regular</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Reason Field */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required variant="filled">
              <InputLabel id="visit-reason-label">Reason</InputLabel>
              <Select
                labelId="visit-reason-label"
                id="visit-reason"
                value={reason}
                label="Reason *"
                onChange={(e) => setReason(e.target.value)}
                sx={{ backgroundColor: "#f3e5f5" }} // Faint purple
              >
                <MenuItem value="Issue">Issue</MenuItem>
                <MenuItem value="Routine">Routine</MenuItem>
                <MenuItem value="New Client">New Client</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Date and Time Field */}
          <Grid item xs={12} sm={6}>
            <StaticDateTimePicker
              value={date}
              onChange={(newValue: Dayjs | null) => {
                setDate(newValue);
              }}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
              }}
            />
          </Grid>

          {/* Public Note */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Public Note"
              value={notePublic}
              onChange={(e) => setNotePublic(e.target.value)}
              fullWidth
              multiline
              rows={2}
              variant="filled"
              sx={{ backgroundColor: "#e3f2fd" }} // Faint blue
            />
          </Grid>

          {/* Submit and Cancel Buttons */}
          <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
            <IconButton
              color="secondary"
              onClick={onClose}
              sx={{
                backgroundColor: "#FFCDD2", // Light red for cancel
                "&:hover": { backgroundColor: "#EF9A9A" },
                borderRadius: "50%",
              }}
            >
              <CloseIcon />
            </IconButton>
            <IconButton
              type="submit"
              color="primary"
              sx={{
                backgroundColor: "#B2DFDB", // Light green for submit
                "&:hover": { backgroundColor: "#80CBC4" },
                borderRadius: "50%",
              }}
            >
              <SendIcon />
            </IconButton>
          </Grid>
        </Grid>

        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateVisitForm;
