// src/components/Alerts/AlertModal.tsx
import React, { Dispatch, SetStateAction } from "react";
import {
  Box,
  Modal,
  Typography,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";

interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  alertDetails: { alertReason: string; severity: "low" | "medium" | "high" };
  setAlertDetails: Dispatch<
    SetStateAction<{ alertReason: string; severity: "low" | "medium" | "high" }>
  >;
}

const AlertModal: React.FC<AlertModalProps> = ({
  open,
  onClose,
  alertDetails,
  setAlertDetails,
}) => {
  const handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAlertDetails((prev) => ({ ...prev, alertReason: event.target.value }));
  };

  const handleSeverityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAlertDetails((prev) => ({
      ...prev,
      severity: event.target.value as "low" | "medium" | "high",
    }));
  };

  const handleSave = () => {
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" mb={2}>
          Set Alert Details
        </Typography>
        <TextField
          label="Alert Reason"
          value={alertDetails.alertReason}
          onChange={handleReasonChange}
          fullWidth
          margin="normal"
        />
        <TextField
          select
          label="Severity"
          value={alertDetails.severity}
          onChange={handleSeverityChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </TextField>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          fullWidth
        >
          Save
        </Button>
      </Box>
    </Modal>
  );
};

export default AlertModal;
