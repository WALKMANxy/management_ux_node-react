import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { IUser, User } from "../models/User";
import { AuthenticatedRequest, DecodedToken } from "../models/types";

const JWT_SECRET = config.jwtSecret || "";

export const generateToken = (user: IUser, tokenType: "email" | "google") => {
  return jwt.sign({ id: user._id, tokenType }, JWT_SECRET, { expiresIn: "7d" });
};

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ message: "Token has expired" });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid token, user not found" });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      entityCode: user.entityCode,
      authType: decoded.authType,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token has expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.error("Authentication error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during authentication" });
  }
};
