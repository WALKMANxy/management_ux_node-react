import { Request } from "express";
import { ISession, Session } from "../models/Session";
import { logger } from "./logger";
import { verifySessionToken } from "./jwtUtils"; // Only keep the verifySessionToken function
import { config } from "../config/config";
import { AuthenticatedRequest } from "../models/types";

const ms = require("ms");

const sessionDurationMs = ms(config.sessionDuration);

// Create or renew a session using the provided session token
export const createSession = async (
  userId: string,
  token: string,
  req: AuthenticatedRequest
): Promise<ISession> => {
  try {
    const existingSession = await Session.findOne({
      userId,
      userAgent: req.get("User-Agent"),
      expiresAt: { $gt: new Date() },
    });

    if (existingSession) {
      // Renew existing session
      existingSession.expiresAt = new Date(Date.now() + sessionDurationMs);
      const renewedSession = await existingSession.save();
      logger.info("Existing session renewed successfully", {
        userId,
        sessionId: renewedSession._id,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      return renewedSession;
    }

    const expiresAt = new Date(Date.now() + sessionDurationMs);
    const session = new Session({
      userId,
      token,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const savedSession = await session.save();
    logger.info("Session created successfully", {
      userId,
      sessionId: savedSession._id,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    return savedSession;
  } catch (error) {
    logger.error("Error creating session", { error });
    throw error;
  }
};

// Validate a session by verifying the JWT token
export const getSessionByToken = async (
  token: string
): Promise<ISession | null> => {
  try {
    // Verify the token
    const decoded = verifySessionToken(token);
    const session = await Session.findOne({
      userId: decoded.userId,
      token,
      expiresAt: { $gt: new Date() },
    }).populate("userId");
    logger.info("Fetched session by token", {
      token,
      sessionExists: !!session,
    });
    return session;
  } catch (error) {
    logger.error("Error fetching session by token", { token, error });
    throw error;
  }
};

// Invalidate a session by deleting it from the database
export const invalidateSession = async (token: string): Promise<void> => {
  try {
    await Session.deleteOne({ token });
    logger.info("Session invalidated", { token });
  } catch (error) {
    logger.error("Error invalidating session", { token, error });
    throw error;
  }
};

// Invalidate all sessions for a specific user
export const invalidateAllUserSessions = async (
  userId: string
): Promise<void> => {
  try {
    await Session.deleteMany({ userId });
    logger.info("All sessions invalidated for user", { userId });
  } catch (error) {
    logger.error("Error invalidating all sessions for user", { userId, error });
    throw error;
  }
};

// Fetch all valid sessions for a user
export const getUserSessions = async (userId: string): Promise<ISession[]> => {
  try {
    const sessions = await Session.find({
      userId,
      expiresAt: { $gt: new Date() },
    });
    logger.info("Fetched user sessions", {
      userId,
      sessionCount: sessions.length,
    });
    return sessions;
  } catch (error) {
    logger.error("Error fetching user sessions", { userId, error });
    throw error;
  }
};

// Renew an existing session by extending its expiration time
export const renewSession = async (
  sessionToken: string,
  req: Request
): Promise<ISession | null> => {
  try {
    const decoded = verifySessionToken(sessionToken);
    const session = await Session.findOne({
      userId: decoded.userId,
      token: sessionToken,
      userAgent: req.get("User-Agent"),
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      logger.warn("Session renewal attempted for invalid or expired session", {
        sessionToken,
      });
      return null;
    }

    const incomingUserAgent = req.get("User-Agent");
    if (session.userAgent !== incomingUserAgent) {
      logger.warn("User-Agent mismatch during session renewal", {
        sessionId: session._id,
        storedUserAgent: session.userAgent,
        incomingUserAgent,
      });
      return null; // Deny session renewal if user-agent doesn't match
    }

    // Renew session expiry time
    const newExpiresAt = new Date(Date.now() + sessionDurationMs);
    session.expiresAt = newExpiresAt;
    await session.save();

    logger.info("Session renewed successfully", {
      sessionId: session._id,
      newExpiresAt,
    });

    return session;
  } catch (error) {
    logger.error("Error renewing session", { sessionToken, error });
    throw error;
  }
};
