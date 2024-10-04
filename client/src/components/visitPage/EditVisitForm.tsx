// src/components/visitPage/EditVisitForm.tsx

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
import { styled } from "@mui/material/styles";
import { StaticDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import dayjs, { Dayjs } from "dayjs";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../app/hooks";
import { updateVisitAsync } from "../../features/data/dataThunks";
import { Visit } from "../../models/dataModels";
import { showToast } from "../../services/toastMessage";
import VisitCard from "./VisitCard";

// Styled IconButton for Save and Cancel actions
const StyledSaveButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: theme.palette.success.dark,
  },
  borderRadius: "50%",
  width: 48,
  height: 48,
}));

// Styled Cancel Button
const StyledCancelButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: theme.palette.error.dark,
  },
  borderRadius: "50%",
  width: 48,
  height: 48,
}));

interface EditVisitFormProps {
  visit: Visit;
  onClose: () => void;
}

const EditVisitForm: React.FC<EditVisitFormProps> = ({ visit, onClose }) => {
  const dispatch = useAppDispatch();

  const { t } = useTranslation();

  // Form state
  const [date, setDate] = useState<Dayjs | null>(dayjs(visit.date));
  const [notePublic, setNotePublic] = useState<string>(visit.notePublic || "");
  const [notePrivate, setNotePrivate] = useState<string>(
    visit.notePrivate || ""
  );
  const [pending, setPending] = useState<boolean>(visit.pending);
  const [completed, setCompleted] = useState<boolean>(visit.completed);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  // Confirmation Dialog state
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      setSnackbarMessage(t("editVisitForm.fillDate", "Please select a date."));
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
      showToast.success(
        t("editVisitForm.visitUpdated", "Visit updated successfully.")
      );
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error(
          t("editVisitForm.updateFailed", "Failed to update visit: ") +
            error.message
        );
        console.error("Failed to update visit:", error);
      } else {
        showToast.error(
          t(
            "editVisitForm.updateFailedUnknown",
            "Failed to update visit: An unknown error occurred."
          )
        );
        console.error(
          "Failed to update visit: An unknown error occurred",
          error
        );
      }
      throw error; // Re-throw to handle in the component
    }
  };

  // Handle Snackbar close
  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Handle Cancel button click
  const handleCancelClick = () => {
    setOpenConfirm(true);
  };

  // Confirm cancellation
  const handleConfirmCancel = useCallback(() => {
    setOpenConfirm(false);
    onClose();
  }, [onClose]);

  // Deny cancellation
  const handleDenyCancel = useCallback(() => {
    setOpenConfirm(false);
  }, []);

  // Toggle Completed status
  const handleToggleCompleted = () => {
    setCompleted(true);
    setPending(false);
  };

  // Toggle Cancelled status
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
            {t("editVisitForm.title", "Edit Visit")}
          </Typography>
          <Grid container spacing={2} sx={{ flexGrow: 1 }}>
            {/* Type Field (Disabled) */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" disabled>
                <InputLabel id="edit-visit-type-label">
                  {t("editVisitForm.typeLabel", "Type")}
                </InputLabel>
                <Select
                  labelId="edit-visit-type-label"
                  id="edit-visit-type"
                  value={visit.type}
                  label={t("editVisitForm.typeLabel", "Type")}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="Regular">
                    {t("editVisitForm.regular", "Regular")}
                  </MenuItem>
                  <MenuItem value="Urgent">
                    {t("editVisitForm.urgent", "Urgent")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Reason Field (Disabled) */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" disabled>
                <InputLabel id="edit-visit-reason-label">
                  {t("editVisitForm.reasonLabel", "Reason")}
                </InputLabel>
                <Select
                  labelId="edit-visit-reason-label"
                  id="edit-visit-reason"
                  value={visit.visitReason}
                  label={t("editVisitForm.reasonLabel", "Reason")}
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <MenuItem value="Issue">
                    {t("editVisitForm.issue", "Issue")}
                  </MenuItem>
                  <MenuItem value="Routine">
                    {t("editVisitForm.routine", "Routine")}
                  </MenuItem>
                  <MenuItem value="New Client">
                    {t("editVisitForm.newClient", "New Client")}
                  </MenuItem>
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
                renderLoading={() => <CircularProgress />}
                slotProps={{
                  actionBar: { hidden: true },
                }}
              />
            </Grid>

            {/* Notes Section */}
            <Grid item xs={12} sm={6}>
              <Grid container spacing={2}>
                {/* Public Note */}
                <Grid item xs={12}>
                  <Tooltip
                    title={t(
                      "editVisitForm.publicNoteTooltip",
                      "Enter a public note for the visit."
                    )}
                    arrow
                  >
                    <TextField
                      label={t("editVisitForm.publicNoteLabel", "Public Note")}
                      value={notePublic}
                      onChange={(e) => setNotePublic(e.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={10} // Allow expansion up to 10 rows
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderRadius: 2, // Adjust border radius
                          },
                        },
                      }}
                    />
                  </Tooltip>
                </Grid>

                {/* Private Note */}
                <Grid item xs={12}>
                  <Tooltip
                    title={t(
                      "editVisitForm.privateNoteTooltip",
                      "The private note is visible only to you and the administrators."
                    )}
                    arrow
                  >
                    <TextField
                      label={t(
                        "editVisitForm.privateNoteLabel",
                        "Private Note"
                      )}
                      placeholder={t(
                        "editVisitForm.privateNotePlaceholder",
                        "The private note is visible only to you and the administrators."
                      )}
                      value={notePrivate}
                      onChange={(e) => setNotePrivate(e.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={10}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderRadius: 2, // Adjust border radius
                          },
                        },
                      }}
                    />
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>

            {/* Status Buttons */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleToggleCompleted}
                  disabled={completed}
                  sx={{
                    backgroundColor: completed ? "green" : "grey",
                    color: "white",
                    "&:hover": {
                      backgroundColor: completed ? "darkgreen" : "darkgrey",
                    },
                  }}
                >
                  {t("editVisitForm.markAsCompleted", "Mark as Completed")}
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={handleToggleCancelled}
                  disabled={!pending && !completed}
                  sx={{
                    backgroundColor: !pending && !completed ? "red" : "grey",
                    color: "white",
                    "&:hover": {
                      backgroundColor:
                        !pending && !completed ? "darkred" : "darkgrey",
                    },
                  }}
                >
                  {t("editVisitForm.markAsCancelled", "Mark as Cancelled")}
                </Button>
              </Box>
            </Grid>

            {/* Visit Preview Card */}
            <Grid item xs={12}>
              <VisitCard
                clientId={visit.clientId}
                type={visit.type}
                reason={visit.visitReason}
                date={date}
                notePublic={notePublic}
                notePrivate={notePrivate} // Pass private note
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
          {/* Save Changes Button */}
          <Tooltip
            title={t("editVisitForm.saveChangesTooltip", "Save Changes")}
            arrow
          >
            <StyledSaveButton
              type="submit"
              form="edit-visit-form"
              aria-label={t("editVisitForm.saveChanges", "Save Changes")}
            >
              <SaveIcon />
            </StyledSaveButton>
          </Tooltip>

          {/* Cancel Button */}
          <Tooltip title={t("editVisitForm.cancelTooltip", "Cancel")} arrow>
            <StyledCancelButton
              color="error"
              onClick={handleCancelClick}
              aria-label={t("editVisitForm.cancel", "Cancel")}
            >
              <CloseIcon />
            </StyledCancelButton>
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
            {t("editVisitForm.cancelDialogTitle", "Cancel Edit")}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="confirm-cancel-description">
              {t(
                "editVisitForm.cancelDialogDescription",
                "Are you sure you want to cancel editing this visit? All unsaved changes will be lost."
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDenyCancel} color="primary">
              {t("editVisitForm.no", "No")}
            </Button>
            <Button onClick={handleConfirmCancel} color="error" autoFocus>
              {t("editVisitForm.yes", "Yes")}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default EditVisitForm;
