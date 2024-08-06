import { Router, Request, Response } from "express";
import { User, IUser } from "../models/User";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/sendEmail";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/authentication";
import fs from "fs";
import path from "path";
import { checkValidation } from "../utils/validate";
import logger from "../utils/logger";
import { body } from "express-validator";
import { config } from "../config/config";
import crypto from "crypto";
import { Passcode } from "../models/Passcode";


const router = Router();

console.log("App url: ", config.appUrl);

const appUrl = config.appUrl;

const JWT_SECRET = config.jwtSecret || "";
console.log("This is the JWT_SECRET inside auth.ts:", JWT_SECRET);
const pathToDataDirectory = path.resolve(__dirname, "..", "..", "data");
const LOG_FILE_PATH = path.join(pathToDataDirectory, "registeredUsersLog.json");

const generatePasscode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // Generates a 6-character alphanumeric passcode
};

const logRegisteredUser = (user: IUser) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    email: user.email,
    role: user.role,
  };

  // Ensure the directory exists
  const logDir = path.dirname(LOG_FILE_PATH);
  if (!fs.existsSync(logDir)) {
    logger.info(`Directory ${logDir} does not exist. Creating...`);
    try {
      fs.mkdirSync(logDir, { recursive: true });
      logger.info(`Directory ${logDir} created successfully.`);
    } catch (err) {
      logger.error(`Failed to create directory ${logDir}:`, err);
      return;
    }
  }

  // Ensure the file exists
  if (!fs.existsSync(LOG_FILE_PATH)) {
    logger.info(`File ${LOG_FILE_PATH} does not exist. Creating...`);
    try {
      fs.writeFileSync(LOG_FILE_PATH, JSON.stringify([], null, 2));
      logger.info(`File ${LOG_FILE_PATH} created successfully.`);
    } catch (err) {
      logger.error(`Failed to create file ${LOG_FILE_PATH}:`, err);
      return;
    }
  }

  // Read, update, and write logs
  fs.readFile(LOG_FILE_PATH, "utf8", (err, data) => {
    if (err) {
      logger.error("Error reading log file:", { error: err });
      return;
    }

    const logs = data ? JSON.parse(data) : [];
    logs.push(logEntry);

    fs.writeFile(LOG_FILE_PATH, JSON.stringify(logs, null, 2), (err) => {
      if (err) {
        logger.error("Error writing log file:", { error: err });
      } else {
        logger.info(`Log entry added to ${LOG_FILE_PATH}`);
      }
    });
  });
};

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least 1 uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least 1 lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least 1 number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least 1 special character"),
  ],
  checkValidation,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    logger.info("Received registration request", { email });

    if (!JWT_SECRET) {
      logger.error("JWT_SECRET is not set");
      return res.status(500).json({ message: "Internal server error" });
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        logger.warn(`Registration attempt with existing email: ${email}`);
        return res.status(400).json({ message: "User already exists" });
      }

      const user = new User({
        email,
        password,
        role: "guest",
        isEmailVerified: false,
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

      res.status(201).json({
        message: "User registered successfully. Please verify your email.",
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Registration error:", {
          error: error.message,
          stack: error.stack,
        });
        res
          .status(500)
          .json({ message: "Registration failed", error: error.message });
      } else {
        logger.error("Registration error:", { error: String(error) });
        res
          .status(500)
          .json({ message: "Registration failed", error: String(error) });
      }
    }
  }
);

router.get("/verify-email", async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    const decoded: any = jwt.verify(token as string, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      logger.warn(`Invalid token used for email verification: ${token}`);
      return res.status(400).json({ message: "Invalid token" });
    }

    user.isEmailVerified = true;
    await user.save();

    console.log("User verified, redirecting...");
    res.redirect(appUrl);
  } catch (error) {
    logger.error("Email verification error:", { error });
    res.status(500).json({ message: "Email verification failed", error });
  }
});

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  checkValidation,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        logger.warn(`Login attempt with non-existent email: ${email}`);
        return res.status(400).json({ message: "User not found" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        logger.warn(`Invalid credentials for email: ${email}`);
        return res.status(400).json({ message: "Invalid credentials" });
      }

      if (!user.isEmailVerified) {
        logger.warn(`Unverified email login attempt: ${email}`);
        return res
          .status(400)
          .json({ message: "Please verify your email before logging in" });
      }

      const token = generateToken(user);
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
      });

      // Determine redirect URL based on user role
      let redirectUrl = config.appUrl;
      if (user.role === "admin") {
        redirectUrl = `${config.appUrl}/admin-dashboard`;
      } else if (user.role === "agent") {
        redirectUrl = `${config.appUrl}/agent-dashboard`;
      } else if (user.role === "client") {
        redirectUrl = `${config.appUrl}/client-dashboard`;
      }

      // Send the redirect URL to the client
      res.status(200).json({ message: "Login successful", redirectUrl, id: user._id, authToken: token });
    } catch (error) {
      logger.error("Login error:", { error });
      res.status(500).json({ message: "Login failed", error });
    }
  }
);

router.post(
  "/request-password-reset",
  [body("email").isEmail().withMessage("Invalid email")],
  checkValidation,
  async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        logger.warn(`Password reset request for non-existent email: ${email}`);
        return res.status(400).json({
          message:
            "If that email address is in our database, we will send you an email to reset your password",
        });
      }

      // Generate JWT reset token
      const resetToken = jwt.sign({ id: user._id }, config.jwtSecret, {
        expiresIn: "1h",
      });

      // Generate and store passcode
      const passcode = generatePasscode();
      const passcodeExpiration = new Date();
      passcodeExpiration.setHours(passcodeExpiration.getHours() + 1); // Set expiration time to 1 hour

      const newPasscode = new Passcode({
        userId: user._id,
        passcode,
        expiresAt: passcodeExpiration,
        used: false,
      });

      await newPasscode.save();

      // Send email with reset token and passcode
      await sendPasswordResetEmail(email, resetToken, passcode);
      logger.info(`Password reset email sent to ${email}`);

      res.status(200).json({
        message:
          "If that email address is in our database, we will send you an email to reset your password",
      });
    } catch (error) {
      logger.error("Password reset request failed", { error });
      res.status(500).json({ message: "Password reset request failed", error });
    }
  }
);


router.post(
  "/reset-password",
  [
    body("passcode").exists().withMessage("Passcode is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least 1 uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least 1 lowercase letter")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least 1 number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least 1 special character"),
  ],
  checkValidation,
  async (req: Request, res: Response) => {
    const { token } = req.query;
    const { passcode, newPassword } = req.body;

    try {
      // Verify the JWT token
      const decoded: any = jwt.verify(token as string, JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        logger.warn(`Invalid token used for password reset: ${token}`);
        return res.status(400).json({ message: "Invalid token" });
      }

      // Verify the passcode
      const validPasscode = await Passcode.findOne({
        userId: user._id,
        passcode,
        used: false,
        expiresAt: { $gt: new Date() }, // Check that the passcode has not expired
      });

      if (!validPasscode) {
        logger.warn(`Invalid or expired passcode used for password reset by user: ${user.email}`);
        return res.status(400).json({ message: "Invalid or expired passcode" });
      }

      // Reset the password
      user.password = newPassword;
      await user.save();

      // Mark the passcode as used
      validPasscode.used = true;
      await validPasscode.save();

      logger.info(`Password reset successful for user: ${user.email}`);

      res.redirect(config.appUrl); // Redirect to the landing page after successful reset
    } catch (error) {
      logger.error("Password reset failed", { error });
      res.status(500).json({ message: "Password reset failed", error });
    }
  }
);


export default router;
