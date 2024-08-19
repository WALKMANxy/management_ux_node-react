import { Router } from "express";
import {
  loginValidationRules,
  passwordResetRequestValidationRules,
  registerValidationRules,
  resetPasswordValidationRules,
} from "../constants/validationRules";
import {
  login,
  logout,
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
