// src/components/visitPage/CreateVisitForm.tsx

import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDateTimePicker } from "@mui/x-date-pickers/StaticDateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import dayjs, { Dayjs } from "dayjs";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import { createVisitAsync } from "../../features/data/dataThunks";
import { showToast } from "../../services/toastMessage";
import VisitCard from "./VisitCard"; // Import the VisitCard component

// Styled IconButton for Send and Cancel actions
const StyledIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
  borderRadius: "50%",
  width: 48,
  height: 48,
}));

// Styled Close Button
const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.error.main,
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: theme.palette.error.dark,
  },
  borderRadius: "50%",
  width: 48,
  height: 48,
}));

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

  const { t } = useTranslation();

  // Form state
  const [type, setType] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [notePublic, setNotePublic] = useState<string>("");
  const [notePrivate, setNotePrivate] = useState<string>(""); // Private note field

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

    if (!type || !reason || !date) {
      setSnackbarMessage(
        t(
          "createVisitForm.fillAllFields",
          "Please fill in all required fields."
        )
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const visitData = {
      clientId,
      type,
      visitReason: reason,
      date: dayjs(date).toDate(),
      createdAt: new Date(), // Current date

      notePublic: notePublic.trim() === "" ? undefined : notePublic.trim(),
      notePrivate: notePrivate.trim() === "" ? undefined : notePrivate.trim(), // Handle private note
      visitIssuedBy: currentUser?.userId || "unknown",
      pending: true,
      completed: false,
    };

    try {
      await dispatch(createVisitAsync(visitData)).unwrap();
      // Reset form fields
      setType("");
      setReason("");
      setDate(dayjs());
      setNotePublic("");
      setNotePrivate(""); // Reset private note
      onClose();
      showToast.success(
        t("createVisitForm.visitCreated", "Visit created successfully.")
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error(
          t("createVisitForm.creationFailed", "Failed to create visit: ") +
            error.message
        );
        console.error("Failed to create visit:", error);
      } else {
        showToast.error(
          t(
            "createVisitForm.creationFailedUnknown",
            "Failed to create visit: An unknown error occurred."
          )
        );
        console.error(
          "Failed to create visit: An unknown error occurred",
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
          {t("createVisitForm.title", "Create New Visit")}
        </Typography>

        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          {/* Type Field */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel id="visit-type-label">
                {t("createVisitForm.typeLabel", "Type")}
              </InputLabel>
              <Select
                labelId="visit-type-label"
                id="visit-type"
                value={type}
                label={t("createVisitForm.typeLabel", "Type") + " *"}
                onChange={(e) => setType(e.target.value)}
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value="Regular">
                  {t("createVisitForm.regular", "Regular")}
                </MenuItem>
                <MenuItem value="Urgent">
                  {t("createVisitForm.urgent", "Urgent")}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Reason Field */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel id="visit-reason-label">
                {t("createVisitForm.reasonLabel", "Reason")}
              </InputLabel>
              <Select
                labelId="visit-reason-label"
                id="visit-reason"
                value={reason}
                label={t("createVisitForm.reasonLabel", "Reason") + " *"}
                onChange={(e) => setReason(e.target.value)}
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value="Issue">
                  {t("createVisitForm.issue", "Issue")}
                </MenuItem>
                <MenuItem value="Routine">
                  {t("createVisitForm.routine", "Routine")}
                </MenuItem>
                <MenuItem value="New Client">
                  {t("createVisitForm.newClient", "New Client")}
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
                actionBar: { hidden: true }, // This hides the toolbar
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
                    "createVisitForm.publicNoteTooltip",
                    "Enter a public note for the visit."
                  )}
                  arrow
                >
                  <TextField
                    label={t("createVisitForm.publicNoteLabel", "Public Note")}
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
                          borderRadius: 2, // Adjust this value to change the border radius
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
                    "createVisitForm.privateNoteTooltip",
                    "The private note is visible only to you and the administrators."
                  )}
                  arrow
                >
                  <TextField
                    label={t(
                      "createVisitForm.privateNoteLabel",
                      "Private Note"
                    )}
                    placeholder={t(
                      "createVisitForm.privateNotePlaceholder",
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
                          borderRadius: 2, // Adjust this value to change the border radius
                        },
                      },
                    }}
                  />
                </Tooltip>
              </Grid>
            </Grid>
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
          {/* Send Visit Button */}
          <Tooltip
            title={t("createVisitForm.sendVisitTooltip", "Send Visit")}
            arrow
          >
            <StyledIconButton
              type="submit"
              aria-label={t("createVisitForm.sendVisit", "Send Visit")}
            >
              <SendIcon />
            </StyledIconButton>
          </Tooltip>

          {/* Cancel Button */}
          <Tooltip title={t("createVisitForm.cancelTooltip", "Cancel")} arrow>
            <StyledCloseButton
              color="error"
              onClick={handleCancelClick}
              aria-label={t("createVisitForm.cancel", "Cancel")}
            >
              <CloseIcon />
            </StyledCloseButton>
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
            {t("createVisitForm.cancelDialogTitle", "Cancel Visit Creation")}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="confirm-cancel-description">
              {t(
                "createVisitForm.cancelDialogDescription",
                "Are you sure you want to cancel creating this visit? All entered information will be lost."
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDenyCancel} color="primary">
              {t("createVisitForm.no", "No")}
            </Button>
            <Button onClick={handleConfirmCancel} color="error" autoFocus>
              {t("createVisitForm.yes", "Yes")}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateVisitForm;
