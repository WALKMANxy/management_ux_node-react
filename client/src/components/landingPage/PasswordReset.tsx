// src/components/landingPage/PasswordReset.tsx
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
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  requestPasswordReset,
  updatePassword,
  verifyResetCode,
} from "../../features/auth/api/auth";
import { showToast } from "../../services/toastMessage";

interface PasswordResetProps {
  onClose: () => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string>("".padStart(6, ""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success"
  );
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Create refs for each of the 6 input fields
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (!/[A-Z]/.test(password)) {
      errors.push(t("auth.passwordUppercaseError"));
    }
    if (!/[a-z]/.test(password)) {
      errors.push(t("auth.passwordLowercaseError"));
    }
    if (!/[0-9]/.test(password)) {
      errors.push(t("auth.passwordNumberError"));
    }
    if (!/[\W_]/.test(password)) {
      errors.push(t("auth.passwordSpecialCharError"));
    }

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handleRequestReset = async () => {
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setAlertMessage(t("auth.resetCodeSent"));
      setAlertSeverity("success");
      setStep(2);
      // Focus the first input of the code
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch {
      setAlertMessage(t("auth.requestResetFailed"));
      setAlertSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      await verifyResetCode(email, code);
      setAlertMessage(t("auth.codeVerified"));
      setAlertSeverity("success");
      setStep(3);
    } catch {
      setAlertMessage(t("auth.invalidCode"));
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
      setAlertMessage(t("auth.passwordsDoNotMatch"));
      setAlertSeverity("error");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(email, code, newPassword);
      setAlertMessage(t("auth.passwordUpdated"));
      setAlertSeverity("success");
      showToast.info(t("auth.passwordUpdatedToast"));
      setTimeout(onClose, 3000);
    } catch {
      setAlertMessage(t("auth.updatePasswordFailed"));
      setAlertSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (value: string, index: number) => {
    // Allow only alphanumeric characters
    const sanitizedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    const newCode = code.split("");
    newCode[index] = sanitizedValue.charAt(0) || "";
    setCode(newCode.join(""));

    if (sanitizedValue && index < 5) {
      // Move focus to next input
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key down events for backspace navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (code[index]) {
        // If current input has a value, clear it
        const newCode = code.split("");
        newCode[index] = "";
        setCode(newCode.join(""));
      } else if (index > 0) {
        // Move to previous input if empty
        inputRefs.current[index - 1]?.focus();
        const newCode = code.split("");
        newCode[index - 1] = "";
        setCode(newCode.join(""));
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  // Handle paste event to allow pasting the entire code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData("Text").trim().toUpperCase();
    if (/^[A-Z0-9]{6}$/.test(pasteData)) {
      setCode(pasteData);
      // Populate all input fields
      pasteData.split("").forEach((char, idx) => {
        if (inputRefs.current[idx]) {
          inputRefs.current[idx]!.value = char;
        }
      });
      // Focus the last input
      inputRefs.current[5]?.focus();
      e.preventDefault();
    }
  };

  return (
    <DialogContent
      sx={{
        textAlign: "center",
        padding: "32px",
        borderRadius: "24px",
      }}
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
        {t("auth.resetInstructions")}
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            sx={{ mb: 4, borderRadius: "12px" }}
            placeholder={t("auth.enterEmail")}
            inputProps={{
              autoComplete: "email",
              spellCheck: false,
            }}
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
            {t("auth.enterVerificationCode")}
          </Typography>
          <Box display="flex" justifyContent="center" gap={1}>
            {[...Array(6)].map((_, index) => (
              <TextField
                key={index}
                inputRef={(el) => (inputRefs.current[index] = el)}
                inputProps={{
                  maxLength: 1,
                  sx: {
                    textAlign: "center",
                    fontSize: "1.5rem",
                    textTransform: "uppercase",
                  },
                }}
                variant="outlined"
                sx={{
                  width: "40px",
                  textAlign: "center",
                  borderRadius: "12px",
                }}
                value={code[index] || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  handleCodeChange(value, index);
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
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
            placeholder={t("auth.enterNewPassword")}
            inputProps={{
              autoComplete: "new-password",
            }}
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
            placeholder={t("auth.confirmPassword")}
            inputProps={{
              autoComplete: "new-password",
            }}
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
