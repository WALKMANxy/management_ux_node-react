//src/constants/validationRules
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

export const clientValidationRules = [
  body("RAGIONE SOCIALE").notEmpty().withMessage("Ragione Sociale is required"),
  body("INDIRIZZO").notEmpty().withMessage("Indirizzo is required"),
  body("C.A.P. - COMUNE (PROV.)")
    .notEmpty()
    .withMessage("CAP Comune Prov is required"),
  body("PARTITA IVA").notEmpty().withMessage("Partita IVA is required"),
  body("MP").notEmpty().withMessage("MP is required"),
  body("CS").notEmpty().withMessage("CS is required"),
  body("AG").notEmpty().withMessage("AG is required"),
];

export const movementValidationRules = [
  body("Data Documento Precedente")
    .notEmpty()
    .withMessage("Data Documento Precedente is required"),
  body("Numero Lista").isInt().withMessage("Numero Lista must be an integer"),
  body("Mese").isInt().withMessage("Mese must be an integer"),
  body("Anno").isInt().withMessage("Anno must be an integer"),
  body("Ragione Sociale Cliente")
    .notEmpty()
    .withMessage("Ragione Sociale Cliente is required"),
  body("Codice Cliente")
    .isInt()
    .withMessage("Codice Cliente must be an integer"),
  body("Codice Agente").notEmpty().withMessage("Codice Agente is required"),
  body("Codice Articolo").notEmpty().withMessage("Codice Articolo is required"),
  body("Marca Articolo").notEmpty().withMessage("Marca Articolo is required"),
  body("Descrizione Articolo")
    .notEmpty()
    .withMessage("Descrizione Articolo is required"),
  body("Quantita").isFloat().withMessage("Quantita must be a number"),
  body("Valore").isFloat().withMessage("Valore must be a number"),
  body("Costo").isFloat().withMessage("Costo must be a number"),
  body("Prezzo Articolo")
    .isFloat()
    .withMessage("Prezzo Articolo must be a number"),
];

// Validation rules
export const promoValidationRules = [
  body("clientsId").isArray().withMessage("Clients ID must be an array"),
  body("promoType").notEmpty().withMessage("Type is required"),
  body("name").notEmpty().withMessage("Name is required"),
  body("discount").notEmpty().withMessage("Discount is required"),
  body("startDate")
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  body("endDate")
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
  body("promoIssuedBy").notEmpty().withMessage("Promo issued by is required"),
];

export const userValidationRules = [
  // Validate email
  body("email").optional().isEmail().withMessage("Invalid email"),

  // Validate role
  body("role")
    .optional()
    .isIn(["admin", "agent", "client", "guest", "employee"])
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

// Validation rules
export const visitValidationRules = [
  body("clientId").notEmpty().withMessage("Client ID is required"),
  body("type").notEmpty().withMessage("Type is required"),
  body("visitReason").notEmpty().withMessage("Reason is required"),
  body("date").isISO8601().withMessage("Date must be a valid ISO 8601 date"),
  body("visitIssuedBy").notEmpty().withMessage("Visit issued by is required"),
];
