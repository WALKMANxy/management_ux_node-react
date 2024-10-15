// src/middlewares/validateClient.ts
import {
    body,
    param,
    ValidationChain,
    validationResult,
  } from "express-validator";
  import { Request, Response, NextFunction } from "express";

  /**
   * Validation rules for creating a client.
   */
  export const validateCreateClient: ValidationChain[] = [
    body("CODICE")
      .isString()
      .notEmpty()
      .withMessage("CODICE is required and must be a string"),
    body("RAGIONE SOCIALE")
      .isString()
      .notEmpty()
      .withMessage("RAGIONE SOCIALE is required and must be a string"),
    body("INDIRIZZO")
      .isString()
      .notEmpty()
      .withMessage("INDIRIZZO is required and must be a string"),
    body("C.A.P. - COMUNE (PROV.)")
      .isString()
      .notEmpty()
      .withMessage("C.A.P. - COMUNE (PROV.) is required and must be a string"),
    body("TELEFONO")
      .isString()
      .notEmpty()
      .withMessage("TELEFONO is required and must be a string"),
    body("PARTITA IVA")
      .isString()
      .notEmpty()
      .withMessage("PARTITA IVA is required and must be a string"),
    body("MP")
      .isString()
      .notEmpty()
      .withMessage("MP is required and must be a string"),
    body("Descizione metodo pagamento")
      .isString()
      .notEmpty()
      .withMessage("Descizione metodo pagamento is required and must be a string"),
    body("AG")
      .isString()
      .notEmpty()
      .withMessage("AG is required and must be a string"),
    // Optional fields can have additional validations if necessary
  ];

  /**
   * Validation rules for updating a client.
   */
  export const validateUpdateClient: ValidationChain[] = [
    param("id")
      .isString()
      .notEmpty()
      .withMessage("Client CODICE is required and must be a string"),
    body("CODICE")
      .optional()
      .isString()
      .withMessage("CODICE must be a string"),
    body("RAGIONE SOCIALE")
      .optional()
      .isString()
      .withMessage("RAGIONE SOCIALE must be a string"),
    body("INDIRIZZO")
      .optional()
      .isString()
      .withMessage("INDIRIZZO must be a string"),
    body("C.A.P. - COMUNE (PROV.)")
      .optional()
      .isString()
      .withMessage("C.A.P. - COMUNE (PROV.) must be a string"),
    body("TELEFONO")
      .optional()
      .isString()
      .withMessage("TELEFONO must be a string"),
    body("PARTITA IVA")
      .optional()
      .isString()
      .withMessage("PARTITA IVA must be a string"),
    body("MP")
      .optional()
      .isString()
      .withMessage("MP must be a string"),
    body("Descizione metodo pagamento")
      .optional()
      .isString()
      .withMessage("Descizione metodo pagamento must be a string"),
    body("AG")
      .optional()
      .isString()
      .withMessage("AG must be a string"),
    // Additional validations for optional fields
  ];

  /**
   * Validation rules for deleting a client.
   */
  export const validateDeleteClient: ValidationChain[] = [
    param("id")
      .isString()
      .notEmpty()
      .withMessage("Client CODICE is required and must be a string"),
  ];

  /**
   * Middleware to handle validation results.
   */
  export const handleValidation = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };
