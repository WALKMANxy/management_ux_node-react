//src/middlewares/authentication.ts
import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../models/types";
import { User } from "../models/User";
import { logger } from "../utils/logger";
import { getSessionByAccessToken } from "../utils/sessionUtils";

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.header("Authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    logger.warn("No access token provided in request headers", {
      headers: req.headers,
    });
    return res
      .status(401)
      .json({ message: "Access token not provided, authorization denied" });
  }

  try {
    // logger.info("Authenticating request with access token", { accessToken });

    const session = await getSessionByAccessToken(accessToken, req);

    if (!session) {
      logger.warn("Invalid or expired session during authentication", {
        accessToken,
      });
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    const user = await User.findById(session.userId);

    if (!user) {
      logger.warn("User not found for session", { sessionId: session._id });
      return res.status(401).json({ message: "User not found" });
    }

    // logger.info("User authenticated successfully", { userId: user._id });

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      entityCode: user.entityCode,
      authType: user.authType,
    };

    next();
  } catch (error) {
    logger.error("Authentication error:", { error });
    return res.status(401).json({ message: "Authentication failed" });
  }
};
