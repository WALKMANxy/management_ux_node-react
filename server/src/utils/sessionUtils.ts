import crypto from "crypto";
import { Request } from "express";
import { config } from "../config/config";
import { ISession, Session } from "../models/Session";

export const generateSessionToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const createSession = async (
  userId: string,
  token: string,
  req: Request
): Promise<ISession> => {
  const expiresAt = new Date(Date.now() + config.sessionDuration);
  const session = new Session({
    userId,
    token,
    expiresAt,
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
    deviceId: req.body.deviceId || "unknown",
  });
  return await session.save();
};

export const invalidateSession = async (token: string): Promise<void> => {
  await Session.deleteOne({ token });
};

export const invalidateAllUserSessions = async (
  userId: string
): Promise<void> => {
  await Session.deleteMany({ userId });
};

export const getSessionByToken = async (
  token: string
): Promise<ISession | null> => {
  return Session.findOne({ token, expiresAt: { $gt: new Date() } }).populate(
    "userId"
  );
};

export const getUserSessions = async (userId: string): Promise<ISession[]> => {
  return Session.find({ userId, expiresAt: { $gt: new Date() } });
};

export const renewSession = async (
  sessionToken: string,
  req: Request
): Promise<ISession | null> => {
  const session = await Session.findOne({
    token: sessionToken,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    return null;
  }

  // Compare user-agent strings
  const incomingUserAgent = req.get("User-Agent");
  if (session.userAgent !== incomingUserAgent) {
    console.warn(
      `User-Agent mismatch: stored (${session.userAgent}) vs incoming (${incomingUserAgent})`
    );
    return null;  // Deny session renewal if user-agent doesn't match
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

  return updatedSession;
};
