import { Request } from "express";
import ms from "ms";
import { config } from "../config/config";
import { ISession, Session } from "../models/Session";
import { AuthenticatedRequest } from "../models/types";
import { IUser } from "../models/User";
import { UserService } from "../services/userService";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshTokenJWT,
} from "./jwtUtils";
import { logger } from "./logger";

const refreshTokenDurationMs = ms(config.jwt.refreshTokenExpiry); // e.g., "7d"

export const createSession = async (
  user: Partial<IUser>,
  req: AuthenticatedRequest,
  uniqueId: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    // Validate inputs
    if (!user || !uniqueId) {
      logger.error("Validation failed: user or uniqueId missing.", {
        user,
        uniqueId,
      });
      throw new Error("userId and uniqueId are required to create a session.");
    }

    const userId = user?._id?.toString();

    logger.info("Attempting to create session", { userId, uniqueId });

    const userAgent = req.get("User-Agent") || "Unknown";
    logger.info("Retrieved User-Agent from request", { userAgent });

    console.log(
      "Checking if a session with the same userId, uniqueId, and userAgent exists"
    );
    const existingSession = await Session.findOne({
      userId,
      uniqueId,
      userAgent,
    });

    if (existingSession) {
      console.log("Found existing session. Invalidating session...");
      const invalidated = await invalidateSession(userId!, uniqueId, userAgent);
      if (!invalidated) {
        console.log("Failed to invalidate existing session.");
        throw new Error("Failed to invalidate existing session.");
      }
    }

    // Generate tokens
    logger.info("Generating new tokens for user", { userId });
    const newAccessToken = generateAccessToken(user as IUser, uniqueId);
    const newRefreshToken = generateRefreshToken(user as IUser);

    // Create session
    logger.info("Saving new session to database", { userId, uniqueId });
    const session = new Session({
      userId,
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + refreshTokenDurationMs),
      ipAddress: req.ip,
      userAgent,
      uniqueId,
    });

    console.log("Saved session:", session.toObject());

    await session.save();
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error: unknown) {
    const typedError = error as {
      message: string;
      code?: number;
      stack?: string;
    };

    if (
      typedError.message.includes("E11000") &&
      typedError.message.includes("dup key")
    ) {
      // This handles the duplicate key error
      logger.error("Duplicate session detected", {
        error: typedError.message,
        stack: typedError.stack,
        userId: user?._id,
        uniqueId,
      });
      throw new Error("DUPLICATE_SESSION");
    }

    logger.error("Error creating session", {
      error: typedError.message,
      stack: typedError.stack,
      userId: user?._id,
      uniqueId,
    });
    throw error;
  }
};

/**
 * Validates the Access Token and retrieves the corresponding session.
 * @param accessToken - The Access Token provided by the client.
 * @param req - The request object containing userAgent and uniqueId.
 * @returns The session if valid, otherwise null.
 */
export const getSessionByAccessToken = async (
  accessToken: string,
  req: Request
): Promise<ISession | null> => {
  try {
    const decoded = verifyAccessToken(accessToken);
    const userId = decoded.userId;
    const userAgent = req.get("User-Agent");
    const uniqueId = decoded.uniqueId;

    /*  logger.info("Retrieving session by Access Token", {
      accessToken,
      userId,
      userAgent,
      uniqueId,
    }); */

    if (!uniqueId && !userAgent) {
      logger.warn(
        "Session identifiers not provided in the request for session retrieval.",
        { userId }
      );
      return null;
    }

    // Find sessions for the user that are still valid, match userAgent and uniqueId
    const session = await Session.findOne(
      {
        userId,
        userAgent,
        uniqueId,
        expiresAt: { $gt: new Date() },
      },
      { _id: 1, userId: 1, userAgent: 1, uniqueId: 1, expiresAt: 1 }
    );

    if (!session) {
      logger.warn("No valid session found for the provided access token", {
        userId: userId,
        userAgent: userAgent,
        uniqueId: uniqueId,
      });
      return null;
    }

    /*  logger.info("Session found by Access Token", {
      sessionId: session._id,
      userId,
      userAgent,
      uniqueId,
    }); */

    return session;
  } catch (error: unknown) {
    const typedError = error as { message: string; stack?: string };
    logger.error("Error fetching session by Access Token", {
      accessToken,
      error: typedError.message,
      stack: typedError.stack,
    });
    return null;
  }
};

export const renewSession = async (
  refreshToken: string,
  req: Request,
  uniqueId: string // Now mandatory to ensure consistent session binding
): Promise<{ accessToken: string; refreshToken: string } | null> => {
  try {
    if (!refreshToken) {
      logger.warn("No refresh token provided");
      return null;
    }

    // Find session with the hashed refresh token
    const session = await Session.findOne({ refreshToken, uniqueId });

    if (!session) {
      logger.warn("Invalid refresh token", { refreshToken });
      return null;
    }

    // Optional: Validate uniqueId, IP, User-Agent
    if (uniqueId && session.uniqueId !== uniqueId) {
      logger.warn("Unique identifier mismatch during token refresh", {
        sessionId: session._id,
        storedUniqueId: session.uniqueId,
        incomingUniqueId: uniqueId,
      });
      return null;
    }

    // Step 1: Verify and decode the refresh token to extract userId
    let decodedToken;
    try {
      decodedToken = verifyRefreshTokenJWT(refreshToken);
    } catch (err) {
      logger.warn("Invalid or expired refresh token", {
        refreshToken,
        error: err,
      });
      return null;
    }

    const userId = decodedToken.userId;
    if (!userId) {
      logger.warn("Refresh token does not contain userId", { refreshToken });
      return null;
    }

    // Step 2: Retrieve userAgent from the request
    const userAgent = req.get("User-Agent") || "Unknown";

    if (session.expiresAt < new Date()) {
      logger.warn("Refresh token expired", { sessionId: session._id });
      await invalidateSession(userId!, uniqueId, userAgent);
      return null;
    }

    // Validate userAgent
    const incomingUserAgent = req.get("User-Agent");
    if (session.userAgent !== incomingUserAgent) {
      logger.warn("User-Agent mismatch during token refresh", {
        sessionId: session._id,
        storedUserAgent: session.userAgent,
        incomingUserAgent,
      });
      return null;
    }

    // Retrieve the user details using UserService
    const user = await UserService.getUserById(session.userId.toString());
    if (!user) {
      logger.warn("User not found for session", { sessionId: session._id });
      return null;
    }

    // Generate new tokens (Rotate refresh token)
    const newAccessToken = generateAccessToken(user, uniqueId);
    const newRefreshToken = generateRefreshToken(user);

    // Update session with new refresh token and expiration
    session.refreshToken = newRefreshToken;
    session.expiresAt = new Date(Date.now() + refreshTokenDurationMs);
    await session.save();

    /*  logger.info("Session refreshed successfully", {
      sessionId: session._id,
      newExpiresAt: session.expiresAt,
    }); */

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    logger.error("Error refreshing session", { refreshToken, error });
    throw error;
  }
};

export const invalidateSession = async (
  userId: string,
  uniqueId: string,
  userAgent: string
): Promise<boolean> => {
  console.log(`invalidateSession called with:`, {
    userId,
    uniqueId,
    userAgent,
  });
  try {
    const result = await Session.deleteOne({ userId, uniqueId, userAgent });
    console.log(`Deleted session:`, result);
    logger.info("Session invalidated", { userId, uniqueId, userAgent });
    return true;
  } catch (error) {
    console.error("Error invalidating session", {
      userId,
      uniqueId,
      userAgent,
      error,
    });
    logger.error("Error invalidating session", {
      userId,
      uniqueId,
      userAgent,
      error,
    });
    return false;
  }
};

/**
 * Invalidates all sessions for a specific user.
 * @param userId - The ID of the user whose sessions are to be invalidated.
 */
export const invalidateAllUserSessions = async (
  userId: string
): Promise<void> => {
  try {
    await Session.deleteMany({ userId });

    /*  logger.info("All sessions invalidated for user.", {
      userId,
      deletedCount: result.deletedCount,
    }); */
  } catch (error: unknown) {
    logger.error("Error invalidating all sessions for user.", {
      userId,
      error,
    });
    throw error;
  }
};

/**
 * Fetches all active sessions for a user.
 * @param userId - The ID of the user whose sessions are to be fetched.
 * @returns An array of active sessions.
 */
export const getUserSessions = async (userId: string): Promise<ISession[]> => {
  try {
    const sessions = await Session.find({
      userId,
      expiresAt: { $gt: new Date() },
    });
    /*  logger.info("Fetched user sessions", {
      userId,
      sessionCount: sessions.length,
    }); */
    return sessions;
  } catch (error: unknown) {
    logger.error("Error fetching user sessions.", { userId, error });
    throw error;
  }
};
