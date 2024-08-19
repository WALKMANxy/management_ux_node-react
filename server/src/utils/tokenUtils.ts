import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { IUser } from '../models/User';
import { TokenBlacklist } from '../models/TokenBlackList';

const JWT_SECRET = config.jwtSecret || "";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "30d";
const MAX_REFRESH_TOKENS = 5;

export interface DecodedToken extends jwt.JwtPayload {
  id: string;
  tokenType: "access" | "refresh";
  authType: "email" | "google";
}

export const generateAccessToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, tokenType: "access", authType: user.authType },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

export const generateRefreshToken = (user: IUser): string => {
  const refreshToken = jwt.sign(
    { id: user._id, tokenType: "refresh", authType: user.authType },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  user.refreshTokens.push(refreshToken);
  if (user.refreshTokens.length > MAX_REFRESH_TOKENS) {
    user.refreshTokens.shift();
  }
  return refreshToken;
};

export const verifyToken = (token: string): DecodedToken => {
  return jwt.verify(token, JWT_SECRET) as DecodedToken;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const blacklistToken = async (token: string): Promise<void> => {
  const decoded = verifyToken(token);
  const tokenHash = hashToken(token);
  const blacklistEntry = new TokenBlacklist({
    tokenHash,
    expiresAt: new Date(decoded.exp! * 1000),
  });
  await blacklistEntry.save();
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
    const tokenHash = hashToken(token);
    const blacklistEntry = await TokenBlacklist.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() }
    });
    return !!blacklistEntry;
  };