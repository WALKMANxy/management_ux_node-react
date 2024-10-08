import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { Passcode } from "../models/Passcode";
import { IpInfo } from "../models/types";
import { IUser, User } from "../models/User";
import { generatePasscode } from "../utils/cryptoUtils";
import { logger } from "../utils/logger";
import { logRegisteredUser } from "../utils/logRegisteredUsers";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/sendEmail";
import { invalidateAllUserSessions } from "../utils/sessionUtils";

const JWT_SECRET = config.jwtSecret || "";

// Function to validate password
const validatePassword = (password: string): string | null => {
  const errors = [];
  if (password.length < 8)
    errors.push("Password must be at least 8 characters long.");
  if (!/[A-Z]/.test(password))
    errors.push("Password must contain at least one uppercase letter.");
  if (!/[a-z]/.test(password))
    errors.push("Password must contain at least one lowercase letter.");
  if (!/[0-9]/.test(password))
    errors.push("Password must contain at least one number.");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    errors.push("Password must contain at least one special character.");

  return errors.length > 0 ? errors.join(" ") : null;
};

export const registerUserService = async (
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

export const verifyUserEmailService = async (token: string): Promise<void> => {
  const decoded: any = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    logger.warn(`Invalid token used for email verification: ${token}`);
    throw new Error("Invalid token.");
  }

  user.isEmailVerified = true;
  await user.save();
};

export const loginUserService = async (
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

export const resetPasswordService = async (
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

  // Invalidate all sessions for the user
  await invalidateAllUserSessions(user.id);

  logger.info(`Password reset successful for user: ${user.email}.`);
};

// Generate reset code
export const generateResetCodeService = async (
  email: string,
  ipInfo: IpInfo | null
): Promise<void> => {
  console.log(`Generating reset code for user: ${email}`);
  const user = await User.findOne({ email });
  if (!user) {
    console.log(`User not found for email: ${email}`);
    return;
  }

  const resetCode = generatePasscode();
  console.log(`Generated reset code for user: ${email}`, resetCode);

  user.passwordResetToken = await bcrypt.hash(resetCode, 10);
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendPasswordResetEmail(user.email, resetCode, ipInfo);
  console.log(`Password reset email sent successfully for user: ${email}`);
};

// Verify reset code
export const verifyResetCodeService = async (
  email: string,
  code: string
): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
    throw new Error("Invalid or expired reset code.");
  }

  if (user.passwordResetExpires < new Date()) {
    throw new Error("Reset code has expired.");
  }

  const isMatch = await bcrypt.compare(code, user.passwordResetToken);
  if (!isMatch) throw new Error("Invalid reset code.");
};

// Update password
export const updatePasswordService = async (
  email: string,
  code: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid or expired reset code.");

  if (!user.passwordResetToken || !user.passwordResetExpires) {
    throw new Error("Invalid or expired reset code.");
  }

  if (user.passwordResetExpires < new Date()) {
    throw new Error("Reset code has expired.");
  }

  const isMatch = await bcrypt.compare(code, user.passwordResetToken);
  if (!isMatch) throw new Error("Invalid reset code.");

  // Validate password
  const validationError = validatePassword(newPassword);
  if (validationError) throw new Error(validationError);

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
};
