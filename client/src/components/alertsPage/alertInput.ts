// src/components/Alerts/AlertInput.tsx
import React, { useState } from "react";
import { Box, TextField, Button, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useDispatch } from "react-redux";

const AlertInput: React.FC = () => {
  const [message, setMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [alertDetails, setAlertDetails] = useState({
    alertReason: "Alert Reason", // Default reason
    severity: "low", // Default severity
  });
  const dispatch = useDispatch();

  const handleSend = async () => {
    if (!message.trim()) return;

    // Dispatch the createAlert action
    await dispatch(
      createAlert({
        ...alertDetails,
        message,
        alertIssuedBy: "currentUserId", // Replace with logic to get current user ID
        entityRole: "admin", // This would be dynamic based on context
        entityCode: "entityCode", // This would be dynamic
      })
    );

    setMessage("");
  };

  return (
    <Box
      sx={
        display: "flex",
        alignItems: "center",
        p: 2,
        borderTop: "1px solid #ddd",
      }
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <IconButton color="primary" onClick={() => setOpenModal(true)}>
        {/* Button to open modal for setting alert details */}
        <SendIcon />
      </IconButton>
      <AlertModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        alertDetails={alertDetails}
        setAlertDetails={setAlertDetails}
      />
    </Box>
  );
};

export default AlertInput;
