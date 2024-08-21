import { Request, Response } from "express";
import { config } from "../config/config";
import { AuthenticatedRequest } from "../models/types";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyUserEmail,
} from "../services/authService";
import logger from "../utils/logger";
import {
  createSession,
  generateSessionToken,
  getUserSessions,
  invalidateAllUserSessions,
  invalidateSession,
  renewSession,
} from "../utils/sessionUtils";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    await registerUser(email, password);
    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Registration error:", { error: error.message });
      res
        .status(500)
        .json({ message: "Registration failed", error: error.message });
    } else {
      logger.error("Unexpected registration error:", { error: String(error) });
      res
        .status(500)
        .json({ message: "Registration failed", error: String(error) });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await loginUser(email, password);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!user.isEmailVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email before logging in." });
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(user.id, sessionToken, req);

    res.cookie("sessionToken", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    let redirectUrl = `${config.appUrl}/${user.role}-dashboard`;
    res.status(200).json({
      message: "Login successful",
      redirectUrl,
      id: user.id,
      sessionId: session._id,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Login error:", { error: error.message });
      res.status(500).json({ message: "Login failed", error: error.message });
    } else {
      logger.error("Unexpected login error:", { error: String(error) });
      res.status(500).json({ message: "Login failed", error: String(error) });
    }
  }
};

export const logout = async (req: Request, res: Response) => {
  const sessionToken = req.cookies.sessionToken;

  if (sessionToken) {
    try {
      await invalidateSession(sessionToken);
    } catch (error) {
      logger.error("Error invalidating session:", { error });
    }
  }

  res.clearCookie("sessionToken");
  res.status(200).json({ message: "Logout successful" });
};

export const logoutAllDevices = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;

  if (userId) {
    try {
      await invalidateAllUserSessions(userId);
      res.clearCookie("sessionToken");
      res
        .status(200)
        .json({ message: "Logged out from all devices successfully" });
    } catch (error) {
      logger.error("Error logging out from all devices:", { error });
      res
        .status(500)
        .json({ message: "Failed to logout from all devices", error });
    }
  } else {
    res.status(401).json({ message: "User not authenticated" });
  }
};

export const getUserActiveSessions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id;

  if (userId) {
    try {
      const sessions = await getUserSessions(userId);
      res.status(200).json(sessions);
    } catch (error) {
      logger.error("Error fetching user sessions:", { error });
      res.status(500).json({ message: "Failed to fetch user sessions", error });
    }
  } else {
    res.status(401).json({ message: "User not authenticated" });
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

export const requestPasswordResetHandler = async (
  req: Request,
  res: Response
) => {
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

export const refreshSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const sessionToken =
    req.cookies.sessionToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!sessionToken) {
    return res.status(401).json({ message: "No session token provided" });
  }

  try {
    const renewedSession = await renewSession(sessionToken);
    if (!renewedSession) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    res.cookie("sessionToken", renewedSession.token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: renewedSession.expiresAt,
    });

    return res.status(200).json({
      message: "Session renewed successfully",
      expiresAt: renewedSession.expiresAt,
    });
  } catch (error) {
    console.error("Error renewing session:", error);
    return res.status(500).json({ message: "Failed to renew session" });
  }
};
