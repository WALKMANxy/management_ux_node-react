import { Request, Response } from "express";
import { config } from "../config/config";
import { generateToken } from "../middlewares/authentication";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyUserEmail,
} from "../services/authService";
import logger from "../utils/logger";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    await registerUser(email, password);
    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Registration error:", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ message: "Registration failed", error: error.message });
    } else {
      logger.error("Registration error:", { error: String(error) });
      res.status(500).json({ message: "Registration failed", error: String(error) });
    }
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    await verifyUserEmail(token as string);
    res.redirect(config.appUrl);
  } catch (error) {
    logger.error("Email verification error:", { error });
    res.status(500).json({ message: "Email verification failed", error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await loginUser(email, password);
    if (!user) {
      logger.warn(`Login attempt with non-existent email or invalid credentials: ${email}`);
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!user.isEmailVerified) {
      logger.warn(`Unverified email login attempt: ${email}`);
      return res
        .status(400)
        .json({ message: "Please verify your email before logging in." });
    }

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    let redirectUrl = config.appUrl;
    if (user.role === "admin") {
      redirectUrl = `${config.appUrl}/admin-dashboard`;
    } else if (user.role === "agent") {
      redirectUrl = `${config.appUrl}/agent-dashboard`;
    } else if (user.role === "client") {
      redirectUrl = `${config.appUrl}/client-dashboard`;
    }

    res
      .status(200)
      .json({ message: "Login successful", redirectUrl, id: user._id });
  } catch (error) {
    logger.error("Login error:", { error });
    res.status(500).json({ message: "Login failed", error });
  }
};

export const requestPasswordResetHandler = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    await requestPasswordReset(email);
    res.status(200).json({
      message:
        "If that email address is in our database, we will send you an email to reset your password.",
    });
  } catch (error) {
    logger.error("Password reset request failed", { error });
    res.status(500).json({ message: "Password reset request failed", error });
  }
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  const { token } = req.query;
  const { passcode, newPassword } = req.body;

  try {
    await resetPassword(token as string, passcode, newPassword);
    res.redirect(config.appUrl);
  } catch (error) {
    logger.error("Password reset failed", { error });
    res.status(500).json({ message: "Password reset failed", error });
  }
};