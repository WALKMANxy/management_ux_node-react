// jwtUtils.ts

import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { IUser } from "../models/User";

const JWT_SECRET = config.jwtSecret || "";
const SESSION_EXPIRY = config.sessionDuration || "24h"; // Use your session duration

export interface DecodedToken extends jwt.JwtPayload {
  userId: string;
  userEmail: string;
  userRole: string;
  entityCode: string;
}

export const generateSessionToken = (user: IUser): string => {
  return jwt.sign(
    {
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      entityCode: user.entityCode, // or any relevant code associated with the user
    },
    JWT_SECRET,
    { expiresIn: SESSION_EXPIRY }
  );
};

export const verifySessionToken = (token: string): DecodedToken => {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  };

