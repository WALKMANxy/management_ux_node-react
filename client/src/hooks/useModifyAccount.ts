// src/hooks/useModifyAccount.ts

import { useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { handleLogout } from "../features/auth/authSlice";
import {
  updateUserEmail,
  updateUserPassword,
} from "../features/users/api/users";
import { showToast } from "../utils/toastMessage";

const useModifyAccount = () => {
  const dispatch = useAppDispatch();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const initiateLogout = () => {
    dispatch(handleLogout());
  };

  const validateEmail = (email: string) => {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      errors.push("Email is not valid.");
    }

    setEmailErrors(errors);
    return errors.length === 0;
  };

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

  const handleUpdateEmail = async (
    currentEmail: string,
    currentPassword: string,
    newEmail: string
  ) => {
    if (!validateEmail(newEmail)) {
      return; // Stop execution if validation fails
    }

    setLoading(true);
    try {
      await updateUserEmail(currentEmail, currentPassword, newEmail);
      showToast.info(
        "Account information updated. You will now be logged out."
      );
      setTimeout(initiateLogout, 3000); // Log out after 3 seconds
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error(
          "Failed to update account information: " + error.message
        );
        console.error("Failed to update account information:", error);
      } else {
        showToast.error(
          "Failed to update account information: An unknown error occurred"
        );
        console.error(
          "Failed to update account information: An unknown error occurred",
          error
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (
    currentEmail: string,
    currentPassword: string,
    newPassword: string
  ) => {
    if (!validatePassword(newPassword)) {
      return; // Stop execution if validation fails
    }

    setLoading(true);
    try {
      await updateUserPassword(currentEmail, currentPassword, newPassword);
      showToast.info("Password updated. You will now be logged out.");
      setTimeout(initiateLogout, 3000); // Log out after 3 seconds
    } catch (error: unknown) {
      if (error instanceof Error) {
        showToast.error("Failed to update password: " + error.message);
        console.error("Failed to update password:", error);
      } else {
        showToast.error("Failed to update password: An unknown error occurred");
        console.error(
          "Failed to update password: An unknown error occurred",
          error
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    handleUpdateEmail,
    handleUpdatePassword,
    alertMessage,
    alertSeverity,
    setAlertMessage,
    loading,
    emailErrors,
    passwordErrors,
  };
};

export default useModifyAccount;
