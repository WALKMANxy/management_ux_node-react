//src/routes/auth.ts
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
import { authRateLimiter } from "../middlewares/rateLimiter";
import { checkValidation } from "../middlewares/validate";

const router = Router();

router.post(
  "/register",
  registerValidationRules,
  authRateLimiter,
  checkValidation,
  register
);

router.get("/verify-email", verifyEmail);

router.post(
  "/login",
  loginValidationRules,
  authRateLimiter,
  checkValidation,
  login
);

router.post("/logout", authRateLimiter, logout);

router.post("/logout-all", authenticateUser, authRateLimiter, logoutAllDevices);

router.get(
  "/active-sessions",
  authenticateUser,
  authRateLimiter,
  getUserActiveSessions
);
router.post("/refresh-session", authRateLimiter, refreshSession);

router.post("/request-password-reset", authRateLimiter, requestPasswordReset);

router.post("/verify-reset-code", authRateLimiter, verifyResetCode);

router.post("/update-password", authRateLimiter, updatePassword);

export default router;
