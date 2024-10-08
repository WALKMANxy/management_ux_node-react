import { Request, Response } from "express";
import { config } from "../config/config";
import { AuthenticatedRequest } from "../models/types";
import {
  generateResetCodeService,
  loginUserService,
  registerUserService,
  updatePasswordService,
  verifyResetCodeService,
  verifyUserEmailService,
} from "../services/authService";
import { logger } from "../utils/logger";
import {
  createSession,
  getUserSessions,
  invalidateAllUserSessions,
  invalidateSession,
  renewSession,
} from "../utils/sessionUtils";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    await registerUserService(email, password);
    return res.status(201).json({
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Registration error:", { error: error.message });
      res
        .status(500)
        .json({ message: "Registration failed", error: error.message });
      return;
    } else {
      logger.error("Unexpected registration error:", { error: String(error) });
      res
        .status(500)
        .json({ message: "Registration failed", error: String(error) });
      return;
    }
  }
};

// Login endpoint to handle authentication and session creation
export const login = async (req: Request, res: Response) => {
  const { email, password, uniqueId } = req.body; // Ensure uniqueId is sent from client

  if (!uniqueId) {
    return res.status(400).json({ message: "uniqueId is required for login." });
  }

  try {
    // Authenticate user credentials
    const user = await loginUserService(email, password);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!user.isEmailVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email before logging in." });
    }

    // Create a new session; existing sessions with the same uniqueId will be invalidated
    const { accessToken, refreshToken } = await createSession(
      user,
      req,
      uniqueId
    );

    return res.status(200).json({
      message: "Login successful",
      accessToken, // Access Token for authenticating requests
      refreshToken, // Refresh Token for renewing Access Tokens
      id: user.id,
    });
  } catch (error: unknown) {
    logger.error("Login error:", { error });
    res
      .status(500)
      .json({ message: "Login failed", error: "Internal server error." });
  }
};

// Logout endpoint to invalidate a single session
export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.header("Authorization")?.replace("Bearer ", "");
  const uniqueId = req.header("uniqueId");

  if (!refreshToken) {
    return res
      .status(400)
      .json({ message: "Refresh token is required for logout." });
  }

  try {
    const invalidated = await invalidateSession(refreshToken, uniqueId!);
    if (invalidated) {
      res.status(200).json({ message: "Logout successful." });
    } else {
      res
        .status(400)
        .json({ message: "Logout failed. Invalid refresh token." });
    }
  } catch (error: unknown) {
    logger.error("Error during logout:", { error });
    res
      .status(500)
      .json({ message: "Logout failed.", error: "Internal server error." });
  }
};

// Logout from all devices by invalidating all sessions for the user
export const logoutAllDevices = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  try {
    await invalidateAllUserSessions(userId);
    res
      .status(200)
      .json({ message: "Logged out from all devices successfully." });
  } catch (error: unknown) {
    logger.error("Error logging out from all devices:", { error });
    res.status(500).json({
      message: "Failed to logout from all devices.",
      error: "Internal server error.",
    });
  }
};

// Retrieve all active sessions for a user
export const getUserActiveSessions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  try {
    const sessions = await getUserSessions(userId);
    res.status(200).json({ sessions });
  } catch (error: unknown) {
    logger.error("Error fetching user sessions:", { error });
    res.status(500).json({
      message: "Failed to fetch user sessions.",
      error: "Internal server error.",
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    await verifyUserEmailService(token as string);
    res.redirect(config.appUrl);
  } catch (error) {
    logger.error("Email verification error:", { error });
    res.status(500).json({ message: "Email verification failed", error });
  }
};

// Refresh Access Token using Refresh Token
export const refreshSession = async (req: Request, res: Response) => {
  const { refreshToken, uniqueId } = req.body; // Ensure uniqueId is sent from client

  if (!refreshToken || !uniqueId) {
    return res
      .status(400)
      .json({ message: "Refresh token and uniqueId are required." });
  }

  try {
    const renewedTokens = await renewSession(refreshToken, req, uniqueId);

    if (!renewedTokens) {
      return res.status(401).json({ message: "Invalid or expired session." });
    }

    return res.status(200).json({
      message: "Session renewed successfully.",
      accessToken: renewedTokens.accessToken,
      refreshToken: renewedTokens.refreshToken,
    });
  } catch (error: unknown) {
    logger.error("Error renewing session:", { error });
    res.status(500).json({
      message: "Failed to renew session.",
      error: "Internal server error.",
    });
  }
};

// Request password reset
export const requestPasswordReset = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  try {
    const ipInfo = req.ipInfo || {
      ip: req.ip ? req.ip.replace("::ffff:", "") : "",
      country: "",
      region: "",
      city: "",
      latitude: 0,
      longitude: 0,
    };

    console.log("Requesting password reset for:", email);
    console.log("IP Info:", ipInfo);
    await generateResetCodeService(email, ipInfo);
    console.log("Password reset code sent successfully.");
    res.status(200).json({
      message:
        "If an account with that email exists, a reset code will be sent.",
    });
  } catch (err) {
    console.error("Error requesting password reset:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Verify reset code
export const verifyResetCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, code } = req.body;
  try {
    await verifyResetCodeService(email, code);
    res.status(200).json({ message: "Code verified." });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

// Update password
export const updatePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, code, newPassword } = req.body;
  try {
    await updatePasswordService(email, code, newPassword);
    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};
