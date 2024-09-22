// src/components/visitPage/CreateVisitForm.tsx
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Tooltip,
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
import { createVisitAsync } from "../../features/data/dataThunks";
import { showToast } from "../../utils/toastMessage";
import VisitCard from "./VisitCard"; // Import the VisitCard component

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
  const [notePrivate, setNotePrivate] = useState<string>(""); // New private note field

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const [openConfirm, setOpenConfirm] = useState<boolean>(false); // State for confirmation dialog

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
      date: dayjs(date).toDate(),
      createdAt: new Date(), // Add the current date here

      notePublic: notePublic.trim() === "" ? undefined : notePublic.trim(),
      notePrivate: notePrivate.trim() === "" ? undefined : notePrivate.trim(), // Handle private note
      visitIssuedBy: currentUser?.userId || "unknown",
      pending: true,
      completed: false,
    };

    try {
      await dispatch(createVisitAsync(visitData)).unwrap();
      setType("");
      setReason("");
      setDate(dayjs());
      setNotePublic("");
      setNotePrivate(""); // Reset private note
      onClose();
      showToast.success("Visit created successfully.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error("Failed to create visit: " + error.message);
        console.error("Failed to create visit:", error);
      } else {
        showToast.error("Failed to create visit: An unknown error occurred");
        console.error(
          "Failed to create visit: An unknown error occurred",
          error
        );
      }
      throw error; // Re-throw to handle in the component
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

  const handleCancelClick = () => {
    setOpenConfirm(true);
  };

  const handleConfirmCancel = () => {
    setOpenConfirm(false);
    onClose();
  };

  const handleDenyCancel = () => {
    setOpenConfirm(false);
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
          display: "flex",
          flexDirection: "column",
          height: "100%", // Ensures the form takes full height
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 600, mb: 2, color: "#4d4b5f" }}
        >
          Create New Visit
        </Typography>
        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          {/* Type Field */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel id="visit-type-label">Type</InputLabel>
              <Select
                labelId="visit-type-label"
                id="visit-type"
                value={type}
                label="Type *"
                onChange={(e) => setType(e.target.value)}
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value="Regular">Regular</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Reason Field */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel id="visit-reason-label">Reason</InputLabel>
              <Select
                labelId="visit-reason-label"
                id="visit-reason"
                value={reason}
                label="Reason *"
                onChange={(e) => setReason(e.target.value)}
                sx={{
                  borderRadius: 2,
                }}
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
              disablePast={true}
              onAccept={(newValue: Dayjs | null) => {
                setDate(newValue);
              }}
              onChange={(newValue: Dayjs | null) => {
                setDate(newValue);
              }}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
              }}
            />
          </Grid>

          {/* Public Note - Expandable TextArea */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Public Note"
              value={notePublic}
              onChange={(e) => setNotePublic(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              maxRows={10} // Allow expansion up to 10 rows
              variant="outlined"
              sx={{
                borderRadius: 2,
              }}
            />
          </Grid>

          {/* Private Note - Expandable TextArea */}
          <Grid item xs={12}>
            <TextField
              label="Private Note"
              value={notePrivate}
              onChange={(e) => setNotePrivate(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              maxRows={10}
              variant="outlined"
              sx={{
                borderRadius: 2,
              }}
            />
          </Grid>

          {/* Visit Preview Card */}
          <Grid item xs={12}>
            <VisitCard
              clientId={clientId}
              type={type}
              reason={reason}
              date={date}
              notePublic={notePublic}
              notePrivate={notePrivate} // Pass private note
              pending={true}
              completed={false}
              visitIssuedBy={currentUser?.name || "unknown"}
              isNew={true}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Tooltip title="Send Visit">
            <IconButton
              type="submit"
              color="success"
              sx={{
                backgroundColor: "green",
                color: "white",
                "&:hover": { backgroundColor: "darkgreen" },
                borderRadius: "50%",
                width: 48,
                height: 48,
              }}
              aria-label="Send Visit"
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancel">
            <IconButton
              color="error"
              onClick={handleCancelClick}
              sx={{
                backgroundColor: "red",
                color: "white",
                "&:hover": { backgroundColor: "darkred" },
                borderRadius: "50%",
                width: 48,
                height: 48,
              }}
              aria-label="Cancel"
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>

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

        {/* Confirmation Dialog */}
        <Dialog
          open={openConfirm}
          onClose={handleDenyCancel}
          aria-labelledby="confirm-cancel-title"
          aria-describedby="confirm-cancel-description"
        >
          <DialogTitle id="confirm-cancel-title">
            Cancel Visit Creation
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="confirm-cancel-description">
              Are you sure you want to cancel creating this visit? All entered
              information will be lost.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDenyCancel} color="primary">
              No
            </Button>
            <Button onClick={handleConfirmCancel} color="error" autoFocus>
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateVisitForm;
