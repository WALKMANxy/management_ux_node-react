import { Router, Request, Response } from "express";
import { User, IUser } from "../models/User";
import { sendVerificationEmail } from "../utils/sendEmail";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/authentication";
import fs from "fs";
import path from "path";
import { checkValidation } from "../utils/validate";
import logger from "../utils/logger";
import { body } from "express-validator";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "";
console.log("This is the JWT_SECRET inside auth.ts:", JWT_SECRET);
const LOG_FILE_PATH = path.join(__dirname, "../data/registeredUsersLog.json");

console.log(
  "JWT_SECRET inside process.env inside auth:",
  process.env.JWT_SECRET
);

const logRegisteredUser = (user: IUser) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    email: user.email,
    role: user.role,
  };

  fs.readFile(LOG_FILE_PATH, "utf8", (err, data) => {
    if (err && err.code !== "ENOENT") {
      logger.error("Error reading log file:", { error: err });
      return;
    }

    const logs = data ? JSON.parse(data) : [];
    logs.push(logEntry);

    fs.writeFile(LOG_FILE_PATH, JSON.stringify(logs, null, 2), (err) => {
      if (err) {
        logger.error("Error writing log file:", { error: err });
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

    console.log("JWT_SECRET at start:", process.env.JWT_SECRET);
    console.log("JWT_SECRET at check:", JWT_SECRET);

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

    res.status(200).json({ message: "Email verified successfully" });
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
        secure: process.env.NODE_ENV === "production",
      });

      res.status(200).json({ message: "Login successful", user });
    } catch (error) {
      logger.error("Login error:", { error });
      res.status(500).json({ message: "Login failed", error });
    }
  }
);

export default router;
