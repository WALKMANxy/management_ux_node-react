// src/utils/jwtUtils.ts
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { IUser } from "../models/User";
import { logger } from "./logger";

// Access Token Configuration
const ACCESS_TOKEN_SECRET = config.jwt.accessTokenSecret;
const ACCESS_TOKEN_EXPIRY = config.jwt.accessTokenExpiry;

// Refresh Token Configuration
const REFRESH_TOKEN_SECRET = config.jwt.refreshTokenSecret;
const REFRESH_TOKEN_EXPIRY = config.jwt.refreshTokenExpiry;

export interface DecodedAccessToken extends jwt.JwtPayload {
  userId: string;
  userEmail: string;
  userRole: string;
  entityCode: string;
}

// Generate Access Token (JWT)
export const generateAccessToken = (
  user: Partial<IUser>,
  uniqueId: string
): string => {
  return jwt.sign(
    {
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      entityCode: user.entityCode,
      uniqueId,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

// Verify Access Token
export const verifyAccessToken = (token: string): DecodedAccessToken => {
  try {
    const decoded = jwt.verify(
      token,
      ACCESS_TOKEN_SECRET
    ) as DecodedAccessToken;
    // logger.info("Decoded Access Token successfully", { decoded });
    return decoded;
  } catch (error) {
    logger.error("Failed to verify access token", { token, error });
    throw error;
  }
};

// Generate Refresh Token (JWT)
export const generateRefreshToken = (user: Partial<IUser>): string => {
  return jwt.sign(
    {
      userId: user._id,
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

// Verify Refresh Token (JWT)
export const verifyRefreshTokenJWT = (token: string): DecodedAccessToken => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as DecodedAccessToken;
};
