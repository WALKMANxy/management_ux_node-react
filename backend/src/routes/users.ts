import express, { Request, Response } from "express";
import { body } from "express-validator";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../models/types";
import { authenticateUser } from "../utils/authentication";
import {
  checkAdminRole,
  checkAgentOrAdminOrClientRole,
} from "../utils/roleChecker"; // Assuming only admins can update user roles or details
import { checkValidation } from "../utils/validate";

const router = express.Router();

// Middleware to authenticate user
router.use(authenticateUser);

const userValidationRules = [
  // Validate email
  body("email").optional().isEmail().withMessage("Invalid email"),

  // Validate role
  body("role")
    .optional()
    .isIn(["admin", "agent", "client", "guest"])
    .withMessage("Invalid role"),

  // Validate password (if provided)
  body("password")
    .optional()
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

  // Validate entityCode (optional, but if provided, it must be a string)
  body("entityCode")
    .optional()
    .isString()
    .withMessage("Entity Code must be a string"),

  // Validate avatar (optional, but if provided, it must be a valid URL)
  body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),

  // Validate isEmailVerified (optional, but if provided, it must be a boolean)
  body("isEmailVerified")
    .optional()
    .isBoolean()
    .withMessage("Email Verified must be a boolean"),

  // Validate passwordResetToken (optional, if provided, must be a string)
  body("passwordResetToken")
    .optional()
    .isString()
    .withMessage("Password Reset Token must be a string"),

  // Validate passwordResetExpires (optional, if provided, must be a valid date)
  body("passwordResetExpires")
    .optional()
    .isISO8601()
    .withMessage("Password Reset Expires must be a valid date"),

  // Validate createdAt and updatedAt (optional, if provided, must be valid dates)
  body("createdAt")
    .optional()
    .isISO8601()
    .withMessage("Created At must be a valid date"),

  body("updatedAt")
    .optional()
    .isISO8601()
    .withMessage("Updated At must be a valid date"),
];

// GET method to retrieve all users (Admin only)
router.get("/", checkAdminRole, async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password"); // Exclude passwords from the response
    res.json(users);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unexpected error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// GET method to retrieve a user by ID
router.get(
  "/:id",
  checkAgentOrAdminOrClientRole,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.params.id).select("-password"); // Exclude password from the response
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        console.error("Unexpected error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
);

// PUT method to replace a user (Admin only)
router.put(
  "/:id",
  userValidationRules,
  checkValidation,
  checkAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User updated successfully", user });
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        console.error("Unexpected error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
);

// PATCH method to update part of a user's information (Admin only)
router.patch(
  "/:id",
  userValidationRules,
  checkValidation,
  checkAdminRole,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: "User updated successfully", user });
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      } else {
        console.error("Unexpected error:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
);

export default router;