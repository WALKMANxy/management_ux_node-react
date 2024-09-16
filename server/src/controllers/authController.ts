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
import { generateSessionToken, verifySessionToken } from "../utils/jwtUtils";
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

// Modified login endpoint to handle existing session tokens
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Attempt to log in the user with the provided credentials
    const user = await loginUserService(email, password);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!user.isEmailVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email before logging in." });
    }

    // Check for an existing session token in the request cookies
    const existingToken = req.cookies.sessionToken;

    let sessionToken;
    let session;

    if (existingToken) {
      try {
        // Verify the existing token
        const decoded = verifySessionToken(existingToken);
        console.log("Existing token found and verified:", decoded);

        // Attempt to renew the session with the existing token
        session = await createSession(user.id, existingToken, req);
        sessionToken = existingToken; // Use the existing token for the response
      } catch (error) {
        // If token verification fails, log the error and proceed to generate a new token
        console.warn(
          "Existing token verification failed, generating a new token.",
          error
        );
        sessionToken = generateSessionToken(user); // Generate a new token
        session = await createSession(user.id, sessionToken, req);
      }
    } else {
      // No existing token found, generate a new one
      sessionToken = generateSessionToken(user);
      session = await createSession(user.id, sessionToken, req);
    }

    // Log the cookie being set
    console.log("Setting session cookie with attributes:", {
      sessionToken,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // Set the session token in the cookie
    res.cookie("sessionToken", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // Redirect URL based on user role
    return res.status(200).json({
      message: "Login successful",
      id: user.id,
      sessionId: session._id,
    });
  } catch (error: unknown) {
    logger.error("Login error:", { error });
    res.status(500).json({ message: "Login failed", error });
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
    await verifyUserEmailService(token as string);
    res.redirect(config.appUrl);
  } catch (error) {
    logger.error("Email verification error:", { error });
    res.status(500).json({ message: "Email verification failed", error });
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
    const renewedSession = await renewSession(sessionToken, req);
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

    await generateResetCodeService(email, ipInfo);
    res
      .status(200)
      .json({
        message:
          "If an account with that email exists, a reset code will be sent.",
      });
  } catch (err) {
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
