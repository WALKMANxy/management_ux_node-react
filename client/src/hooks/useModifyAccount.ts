// src/hooks/useModifyAccount.ts

import { useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { handleLogout } from "../features/auth/authSlice";
import { updateUserEmail, updateUserPassword } from "../features/users/api/users";

const useModifyAccount = () => {
  const dispatch = useAppDispatch();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">("success");
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

  const handleUpdateEmail = async (currentEmail: string, currentPassword: string, newEmail: string) => {
    if (!validateEmail(newEmail)) {
      return; // Stop execution if validation fails
    }

    setLoading(true);
    try {
      await updateUserEmail(currentEmail, currentPassword, newEmail);
      setAlertMessage("Account information updated. You will now be logged out.");
      setAlertSeverity("success");
      setTimeout(initiateLogout, 3000); // Log out after 3 seconds
    } catch  {
      setAlertMessage("Failed to update email. Please check your credentials.");
      setAlertSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (currentEmail: string, currentPassword: string, newPassword: string) => {
    if (!validatePassword(newPassword)) {
      return; // Stop execution if validation fails
    }

    setLoading(true);
    try {
      await updateUserPassword(currentEmail, currentPassword, newPassword);
      setAlertMessage("Account information updated. You will now be logged out.");
      setAlertSeverity("success");
      setTimeout(initiateLogout, 3000); // Log out after 3 seconds
    } catch {
      setAlertMessage("Failed to update password. Please check your credentials.");
      setAlertSeverity("error");
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
