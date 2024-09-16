import { Router } from "express";
import {
  loginValidationRules,
  registerValidationRules,
} from "../constants/validationRules";
import {
  getUserActiveSessions,
  login,
  logout,
  logoutAllDevices,
  refreshSession,
  register,
  requestPasswordReset,
  updatePassword,
  verifyEmail,
  verifyResetCode,
} from "../controllers/authController";
import { authenticateUser } from "../middlewares/authentication";
import { checkValidation } from "../middlewares/validate";

const router = Router();

router.post("/register", registerValidationRules, checkValidation, register);
router.get("/verify-email", verifyEmail);
router.post("/login", loginValidationRules, checkValidation, login);
router.post("/logout", authenticateUser, logout);
router.post("/logout-all", authenticateUser, logoutAllDevices);
router.get("/active-sessions", authenticateUser, getUserActiveSessions);
router.post("/refresh-session", authenticateUser, refreshSession);

// Password reset routes
router.post("/request-password-reset", requestPasswordReset);
router.post("/verify-reset-code", verifyResetCode);
router.post("/update-password", updatePassword);

export default router;
