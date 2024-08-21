import { Router } from "express";
import {
  loginValidationRules,
  passwordResetRequestValidationRules,
  registerValidationRules,
  resetPasswordValidationRules,
} from "../constants/validationRules";
import {
  getUserActiveSessions,
  login,
  logout,
  logoutAllDevices,
  refreshSession,
  register,
  requestPasswordResetHandler,
  resetPasswordHandler,
  verifyEmail,
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

router.post(
  "/request-password-reset",
  passwordResetRequestValidationRules,
  checkValidation,
  requestPasswordResetHandler
);
router.post(
  "/reset-password",
  resetPasswordValidationRules,
  checkValidation,
  resetPasswordHandler
);

export default router;
