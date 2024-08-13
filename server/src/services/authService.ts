import crypto from "crypto";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { Passcode } from "../models/Passcode";
import { IUser, User } from "../models/User";
import logger from "../utils/logger";
import { logRegisteredUser } from "../utils/logRegisteredUsers";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/sendEmail";

const JWT_SECRET = config.jwtSecret || "";

const generatePasscode = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};

export const registerUser = async (
  email: string,
  password: string
): Promise<IUser> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    logger.warn(`Registration attempt with existing email: ${email}.`);
    throw new Error("User already exists.");
  }

  const user = new User({
    email,
    password,
    role: "guest",
    isEmailVerified: false,
    authType: "email", // Set authType for email registration
  });

  await user.save();
  logger.info("User saved successfully", { email });

  const verificationToken = jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: "1d",
  });
  logger.info("Verification token generated", { verificationToken });

  await sendVerificationEmail(email, verificationToken);
  logger.info("Verification email sent", { email });

  logRegisteredUser(user);

  return user;
};

export const verifyUserEmail = async (token: string): Promise<void> => {
  const decoded: any = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    logger.warn(`Invalid token used for email verification: ${token}`);
    throw new Error("Invalid token.");
  }

  user.isEmailVerified = true;
  await user.save();
};

export const loginUser = async (
  email: string,
  password: string
): Promise<IUser | null> => {
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return null;
  }

  return user;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) {
    logger.warn(`Password reset request for non-existent email: ${email}`);
    return;
  }

  const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: "1h",
  });

  const passcode = generatePasscode();
  const passcodeExpiration = new Date();
  passcodeExpiration.setHours(passcodeExpiration.getHours() + 1);

  const newPasscode = new Passcode({
    userId: user._id,
    passcode,
    expiresAt: passcodeExpiration,
    used: false,
  });

  await newPasscode.save();

  await sendPasswordResetEmail(email, resetToken, passcode);
  logger.info(`Password reset email sent to ${email}.`);
};

export const resetPassword = async (
  token: string,
  passcode: string,
  newPassword: string
): Promise<void> => {
  const decoded: any = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    logger.warn(`Invalid token used for password reset: ${token}`);
    throw new Error("Invalid token.");
  }

  const validPasscode = await Passcode.findOne({
    userId: user._id,
    passcode,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!validPasscode) {
    logger.warn(
      `Invalid or expired passcode used for password reset by user: ${user.email}`
    );
    throw new Error("Invalid or expired passcode.");
  }

  user.password = newPassword;
  await user.save();

  validPasscode.used = true;
  await validPasscode.save();

  logger.info(`Password reset successful for user: ${user.email}.`);
};
