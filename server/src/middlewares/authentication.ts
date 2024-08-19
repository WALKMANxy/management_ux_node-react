import {  Response, NextFunction } from "express";
import { User } from "../models/User";
import { verifyToken, generateAccessToken, generateRefreshToken, isTokenBlacklisted } from "../utils/tokenUtils";
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from "../models/types";


export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    return res.status(401).json({ message: "No access token provided, authorization denied" });
  }

  try {
    const decoded = verifyToken(accessToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid token, user not found" });
    }

    if (await isTokenBlacklisted(accessToken)) {
      return res.status(401).json({ message: "Token has been blacklisted" });
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
    if (error instanceof jwt.TokenExpiredError && refreshToken) {
      try {
        const decoded = verifyToken(refreshToken);
        const user = await User.findById(decoded.id);

        if (!user || !user.refreshTokens.includes(refreshToken) || await isTokenBlacklisted(refreshToken)) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }

        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        await user.save();

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });

        req.user = {
          id: user._id,
          email: user.email,
          role: user.role,
          entityCode: user.entityCode,
          authType: decoded.authType,
        };

        next();
      } catch (refreshError) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }
    } else {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
};