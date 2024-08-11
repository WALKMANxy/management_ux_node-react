import { body } from "express-validator";

export const agentValidationRules = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("phone").notEmpty().withMessage("Phone is required"),
  body("clients").isArray().withMessage("Clients should be an array"),
];

export const alertValidationRules = [
  body("alertReason").notEmpty().withMessage("Alert reason is required"),
  body("message").notEmpty().withMessage("Message is required"),
  body("severity")
    .isIn(["low", "medium", "high"])
    .withMessage("Severity must be low, medium, or high"),
];

export const registerValidationRules = [
  body("email").isEmail().withMessage("Invalid email."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least 1 uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least 1 lowercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least 1 number.")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least 1 special character."),
];

export const loginValidationRules = [
  body("email").isEmail().withMessage("Invalid email."),
  body("password").exists().withMessage("Password is required."),
];

export const passwordResetRequestValidationRules = [
  body("email").isEmail().withMessage("Invalid email."),
];

export const resetPasswordValidationRules = [
  body("passcode").exists().withMessage("Passcode is required."),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least 1 uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least 1 lowercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least 1 number.")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least 1 special character."),
];
