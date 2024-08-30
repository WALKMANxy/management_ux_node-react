import crypto from "crypto";
import { Request } from "express";
import { config } from "../config/config";
import { ISession, Session } from "../models/Session";
import { logger } from "./logger";


const ms = require("ms");

const sessionDurationMs = ms(config.sessionDuration);


export const generateSessionToken = (): string => {
  const token = crypto.randomBytes(32).toString("hex");
  logger.debug("Generated new session token", { token });
  return token;
};

export const createSession = async (
  userId: string,
  token: string,
  req: Request
): Promise<ISession> => {
  try {
    const expiresAt = new Date(Date.now() + sessionDurationMs);
    const session = new Session({
      userId,
      token,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      deviceId: req.body.deviceId || "unknown",
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

export const invalidateSession = async (token: string): Promise<void> => {
  try {
    await Session.deleteOne({ token });
    logger.info("Session invalidated", { token });
  } catch (error) {
    logger.error("Error invalidating session", { token, error });
    throw error;
  }
};

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

export const getSessionByToken = async (
  token: string
): Promise<ISession | null> => {
  try {
    const session = await Session.findOne({
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

export const renewSession = async (
  sessionToken: string,
  req: Request
): Promise<ISession | null> => {
  try {
    const session = await Session.findOne({
      token: sessionToken,
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

    const newExpiresAt = new Date(Date.now() + config.sessionDuration);
    const updatedSession = await Session.findOneAndUpdate(
      { _id: session._id },
      {
        $set: {
          expiresAt: newExpiresAt,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    logger.info("Session renewed successfully", {
      sessionId: session._id,
      newExpiresAt,
    });

    return updatedSession;
  } catch (error) {
    logger.error("Error renewing session", { sessionToken, error });
    throw error;
  }
};
