// src/components/visitPage/EditVisitForm.tsx
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
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
import { useAppDispatch } from "../../app/hooks";
import { updateVisitAsync } from "../../features/data/dataThunks";
import { Visit } from "../../models/dataModels";
import VisitCard from "./VisitCard";

interface EditVisitFormProps {
  visit: Visit;
  onClose: () => void;
}

const EditVisitForm: React.FC<EditVisitFormProps> = ({ visit, onClose }) => {
  const dispatch = useAppDispatch();

  const [date, setDate] = useState<Dayjs | null>(dayjs(visit.date));
  const [notePublic, setNotePublic] = useState<string>(visit.notePublic || "");
  const [notePrivate, setNotePrivate] = useState<string>(
    visit.notePrivate || ""
  );
  const [pending, setPending] = useState<boolean>(visit.pending);
  const [completed, setCompleted] = useState<boolean>(visit.completed);

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const [openConfirm, setOpenConfirm] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      setSnackbarMessage("Please select a date.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const updatedVisit = {
      ...visit,
      date: dayjs(date).toDate(),
      notePublic: notePublic.trim() === "" ? undefined : notePublic.trim(),
      notePrivate: notePrivate.trim() === "" ? undefined : notePrivate.trim(),
      createdAt: new Date(visit.createdAt),
      pending,
      completed,
    };

    try {
      if (updatedVisit._id) {
        await dispatch(
          updateVisitAsync({ _id: updatedVisit._id, visitData: updatedVisit })
        ).unwrap();
      }
      setSnackbarMessage("Visit updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      onClose();
    } catch (error: unknown) {
      setSnackbarMessage(
        error instanceof Error ? error.message : "Failed to update visit."
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

  const handleToggleCompleted = () => {
    setCompleted(true);
    setPending(false);
  };

  const handleToggleCancelled = () => {
    setCompleted(false);
    setPending(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ m: 2 }}>
        {/* Form Container */}
        <Box
          component="form"
          id="edit-visit-form"
          onSubmit={handleSubmit}
          sx={{
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
            Edit Visit
          </Typography>
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            {/* Type Field (Disabled) */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" disabled>
                <InputLabel id="visit-type-label">Type</InputLabel>
                <Select
                  labelId="visit-type-label"
                  id="visit-type"
                  value={visit.type}
                  label="Type"
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Reason Field (Disabled) */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" disabled>
                <InputLabel id="visit-reason-label">Reason</InputLabel>
                <Select
                  labelId="visit-reason-label"
                  id="visit-reason"
                  value={visit.visitReason}
                  label="Reason"
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

            {/* Date and Notes */}
            <Grid item xs={12} sm={6}>
              {/* Date and Time Field */}
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
            <Grid item xs={12} sm={6}>
              {/* Notes */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Public Note */}
                <TextField
                  label="Public Note"
                  value={notePublic}
                  onChange={(e) => setNotePublic(e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={10}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                  }}
                />
                {/* Private Note */}
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
              </Box>
              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: { xs: "flex-start", sm: "flex-end" },
                    gap: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    color={completed ? "success" : "info"}
                    onClick={handleToggleCompleted}
                    sx={{
                      backgroundColor: completed ? "green" : "grey",
                      color: "white",
                      "&:hover": {
                        backgroundColor: completed ? "darkgreen" : "darkgrey",
                      },
                    }}
                  >
                    Mark as Completed
                  </Button>
                  <Button
                    variant="contained"
                    color={!pending && !completed ? "error" : "info"}
                    onClick={handleToggleCancelled}
                    sx={{
                      backgroundColor: !pending && !completed ? "red" : "grey",
                      color: "white",
                      "&:hover": {
                        backgroundColor:
                          !pending && !completed ? "darkred" : "darkgrey",
                      },
                    }}
                  >
                    Mark as Cancelled
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {/* Status Buttons */}

            {/* Visit Preview Card */}
            <Grid item xs={12}>
              <VisitCard
                clientId={visit.clientId}
                type={visit.type}
                reason={visit.visitReason}
                date={date}
                notePublic={notePublic}
                notePrivate={notePrivate}
                pending={pending}
                completed={completed}
                visitIssuedBy={visit.visitIssuedBy}
                isNew={true}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Tooltip title="Save Changes">
            <IconButton
              type="submit"
              form="edit-visit-form"
              color="primary"
              sx={{
                backgroundColor: "blue",
                color: "white",
                "&:hover": { backgroundColor: "darkblue" },
                borderRadius: "50%",
                width: 48,
                height: 48,
              }}
              aria-label="Save Changes"
            >
              <SaveIcon />
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
        <DialogTitle id="confirm-cancel-title">Cancel Edit</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-cancel-description">
            Are you sure you want to cancel editing this visit? All unsaved
            changes will be lost.
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
    </LocalizationProvider>
  );
};

export default EditVisitForm;
