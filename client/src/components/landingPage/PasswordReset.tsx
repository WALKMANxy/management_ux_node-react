import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  DialogContent,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  requestPasswordReset,
  updatePassword,
  verifyResetCode,
} from "../../features/auth/api/auth";

interface PasswordResetProps {
  onClose: () => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // Track the current step of the flow
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success"
  );
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]); // State for password validation errors

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must include at least one uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must include at least one lowercase letter.");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must include at least one number.");
    }
    if (!/[\W_]/.test(password)) {
      errors.push("Password must include at least one special character.");
    }

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handleRequestReset = async () => {
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setAlertMessage(
        "If an account with that email exists, a reset code has been sent."
      );
      setAlertSeverity("success");
      setStep(2); // Move to the code verification step
    } catch {
      setAlertMessage("Failed to request password reset. Please try again.");
      setAlertSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      await verifyResetCode(email, code);
      setAlertMessage("Code verified successfully. Please set a new password.");
      setAlertSeverity("success");
      setStep(3); // Move to the password update step
    } catch {
      setAlertMessage("Invalid or expired code. Please try again.");
      setAlertSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!validatePassword(newPassword)) {
      return;
    }
    if (newPassword !== confirmPassword) {
      setAlertMessage("Passwords do not match. Please try again.");
      setAlertSeverity("error");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(email, code, newPassword);
      setAlertMessage("Password updated successfully. You can now log in.");
      setAlertSeverity("success");
      setTimeout(onClose, 3000); // Close modal after success message
    } catch {
      setAlertMessage("Failed to update password. Please check your inputs.");
      setAlertSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent
      sx={{ textAlign: "center", padding: "32px", borderRadius: "24px" }}
    >
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", marginBottom: "12px" }}
      >
        {t("auth.resetPassword")}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          marginBottom: "24px",
          color: "text.secondary",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "normal",
        }}
      >
        {t("auth.IfYouForgotThePasswordYouCanResetItByEnteringYourEmail")}
      </Typography>

      <Collapse in={!!alertMessage}>
        <Alert
          severity={alertSeverity}
          onClose={() => setAlertMessage(null)}
          sx={{ mb: 2 }}
        >
          {alertMessage}
        </Alert>
      </Collapse>

      {step === 1 && (
        <>
          <Typography
            variant="subtitle2"
            sx={{ textAlign: "left", marginBottom: "8px", fontWeight: "bold" }}
          >
            {t("auth.email")}
          </Typography>
          <TextField
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            sx={{ marginBottom: "16px", borderRadius: "12px" }}
          />
          <Button
            onClick={handleRequestReset}
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#81c784",
              padding: "10px",
              borderRadius: "12px",
              "&:hover": { backgroundColor: "#66bb6a" },
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              t("auth.requestResetCode")
            )}
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <Typography
            variant="subtitle2"
            sx={{
              textAlign: "center",
              marginBottom: "16px",
              fontWeight: "bold",
            }}
          >
            Enter the verification code provided in your email.
          </Typography>
          <Box display="flex" justifyContent="center" gap={1}>
            {[...Array(6)].map((_, index) => (
              <TextField
                key={index}
                inputProps={{ maxLength: 1 }}
                variant="outlined"
                sx={{ width: "40px", textAlign: "center" }}
                onChange={(e) =>
                  setCode(
                    (prev) =>
                      prev.slice(0, index) +
                      e.target.value +
                      prev.slice(index + 1)
                  )
                }
              />
            ))}
          </Box>
          <Button
            onClick={handleVerifyCode}
            variant="contained"
            fullWidth
            sx={{
              marginTop: "16px",
              backgroundColor: "#81c784",
              padding: "10px",
              borderRadius: "12px",
              "&:hover": { backgroundColor: "#66bb6a" },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t("auth.verifyCode")}
          </Button>
        </>
      )}

      {step === 3 && (
        <>
          {passwordErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordErrors.map((error, index) => (
                <Typography key={index}>{error}</Typography>
              ))}
            </Alert>
          )}
          <Typography
            variant="subtitle2"
            sx={{ textAlign: "left", marginBottom: "8px", fontWeight: "bold" }}
          >
            {t("auth.newPassword")}
          </Typography>
          <TextField
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            variant="outlined"
            sx={{ marginBottom: "16px", borderRadius: "12px" }}
          />
          <Typography
            variant="subtitle2"
            sx={{ textAlign: "left", marginBottom: "8px", fontWeight: "bold" }}
          >
            {t("auth.confirmPassword")}
          </Typography>
          <TextField
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            variant="outlined"
            sx={{ marginBottom: "16px", borderRadius: "12px" }}
          />
          <Button
            onClick={handleUpdatePassword}
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "#81c784",
              padding: "10px",
              borderRadius: "12px",
              "&:hover": { backgroundColor: "#66bb6a" },
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              t("auth.updatePassword")
            )}
          </Button>
        </>
      )}
    </DialogContent>
  );
};

export default PasswordReset;
