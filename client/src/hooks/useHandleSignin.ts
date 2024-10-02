import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "../utils/toastMessage";
import { useAuth } from "./useAuth";

export const useHandleSignin = (onClose: () => void) => {
  const { t } = useTranslation(); // Initialize translation

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(false); // Track "Keep me signed in" state
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<
    "success" | "error" | "info"
  >("error");
  const [shakeEmail, setShakeEmail] = useState(false);
  const [shakePassword, setShakePassword] = useState(false);
  const [shakeConfirmPassword, setShakeConfirmPassword] = useState(false); // For confirming password shake effect

  const { initiateLogin, initiateRegister, handleLoginWithGoogle } = useAuth();

  const toggleMode = useCallback(() => {
    setIsLoginMode((prevMode) => !prevMode);
    // Reset form fields and errors when toggling mode
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }, []);

  useEffect(() => {
    // Watch for changes in alertMessage and trigger the shake effect
    if (alertMessage.includes("email")) {
      setTimeout(() => {
        setShakeEmail(true);
      }, Math.random() * 50); // Random delay for email shake
    }
    if (alertMessage.includes("Password")) {
      setTimeout(() => {
        setShakePassword(true);
        setShakeConfirmPassword(true);
      }, Math.random() * 50); // Random delay for password shake
    }

    // Reset shake effects after the animation completes
    const resetShake = setTimeout(() => {
      setShakeEmail(false);
      setShakePassword(false);
      setShakeConfirmPassword(false);
    }, 2000);

    return () => clearTimeout(resetShake);
  }, [alertMessage]); // Dependency array includes alertMessage to trigger effect when it changes

  const handleSubmit = async () => {
    setLoading(true);
    setShakeEmail(false);
    setShakePassword(false);
    setShakeConfirmPassword(false);
    try {
      if (isLoginMode) {
        await initiateLogin(
          email,
          password,
          setAlertMessage,
          setAlertSeverity,
          setAlertOpen,
          onClose,
          keepMeSignedIn
        );
      } else {
        let hasError = false;
        if (password !== confirmPassword) {
          setAlertMessage(t("signin.passwordMismatch"));
          setAlertSeverity("error");
          setAlertOpen(true);
          setShakePassword(true);
          setShakeConfirmPassword(true);
          hasError = true;
        }
        if (hasError) {
          setLoading(false);
          // Debounce reset to ensure animation triggers
          setTimeout(() => {
            setShakePassword(false);
            setShakeConfirmPassword(false);
          }, 2000);
          return;
        }
        await initiateRegister(
          email,
          password,
          setAlertMessage,
          setAlertSeverity,
          setAlertOpen
        );
      }
    } catch (error: unknown) {
      // Handling the error with proper type checking
      if (error instanceof Error) {
        setAlertMessage(t("errors.unknown"));
        setAlertSeverity("error");
        setAlertOpen(true);
      } else {
        // Fallback in case error is not an instance of Error
        setAlertMessage(t("errors.unknown"));
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithGoogleClick = useCallback(async () => {
    try {
      handleLoginWithGoogle();
      onClose();
      showToast.success(t("signin.loginWithGoogleSuccess"));
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error(error.message);
      } else {
        showToast.error(t("errors.unknown"));
      }
    }
  }, [handleLoginWithGoogle, onClose, t]);

  return {
    isLoginMode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    keepMeSignedIn,
    setKeepMeSignedIn, // Include setter for the checkbox
    loading,
    alertOpen,
    setAlertOpen,
    alertMessage,
    alertSeverity,
    shakeEmail,
    shakePassword,
    shakeConfirmPassword,
    toggleMode,
    handleSubmit,
    handleLoginWithGoogleClick,
  };
};
