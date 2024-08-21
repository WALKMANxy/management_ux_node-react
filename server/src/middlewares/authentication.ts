import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../models/types";
import { User } from "../models/User";
import { getSessionByToken } from "../utils/sessionUtils";

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const sessionToken =
    req.cookies.sessionToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!sessionToken) {
    return res
      .status(401)
      .json({ message: "No session token provided, authorization denied" });
  }

  try {
    const session = await getSessionByToken(sessionToken);

    if (!session) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    const user = await User.findById(session.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      entityCode: user.entityCode,
      authType: user.authType,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};
