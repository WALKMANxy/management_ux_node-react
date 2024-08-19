import { Request, Response } from "express";
import { config } from "../config/config";
import { User } from "../models/User";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyUserEmail,
} from "../services/authService";
import logger from "../utils/logger";
import {
  blacklistToken,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/tokenUtils";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    await registerUser(email, password);
    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Registration error:", { error: error.message });
      res
        .status(500)
        .json({ message: "Registration failed", error: error.message });
    } else {
      logger.error("Unexpected registration error:", { error: String(error) });
      res
        .status(500)
        .json({ message: "Registration failed", error: String(error) });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await loginUser(email, password);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!user.isEmailVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email before logging in." });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    let redirectUrl = `${config.appUrl}/${user.role}-dashboard`;
    res
      .status(200)
      .json({ message: "Login successful", redirectUrl, id: user._id });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Login error:", { error: error.message });
      res.status(500).json({ message: "Login failed", error: error.message });
    } else {
      logger.error("Unexpected login error:", { error: String(error) });
      res.status(500).json({ message: "Login failed", error: String(error) });
    }
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    try {
      await blacklistToken(refreshToken);
      const decoded = verifyToken(refreshToken);
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (token) => token !== refreshToken
        );
        await user.save();
      }
    } catch (error) {
      logger.error("Error blacklisting refresh token:", { error });
    }
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logout successful" });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    await verifyUserEmail(token as string);
    res.redirect(config.appUrl);
  } catch (error) {
    logger.error("Email verification error:", { error });
    res.status(500).json({ message: "Email verification failed", error });
  }
};

export const requestPasswordResetHandler = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body;

  try {
    await requestPasswordReset(email);
    res.status(200).json({
      message:
        "If that email address is in our database, we will send you an email to reset your password.",
    });
  } catch (error) {
    logger.error("Password reset request failed", { error });
    res.status(500).json({ message: "Password reset request failed", error });
  }
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  const { token } = req.query;
  const { passcode, newPassword } = req.body;

  try {
    await resetPassword(token as string, passcode, newPassword);
    res.redirect(config.appUrl);
  } catch (error) {
    logger.error("Password reset failed", { error });
    res.status(500).json({ message: "Password reset failed", error });
  }
};
