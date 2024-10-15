// src/routes/employeeRoutes.ts
import express from "express";
import {
  fetchEmployeeById,
  fetchAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController";
import { authenticateUser } from "../middlewares/authentication";
import { checkAdminRole } from "../middlewares/roleChecker";
import {
  validateCreateEmployee,
  validateUpdateEmployee,
  validateDeleteEmployee,
  handleValidation,
} from "../middlewares/validateEmployee";

const router = express.Router();

// Middleware to authenticate user
router.use(authenticateUser);

/**
 * GET /employees
 * Fetch all employees
 * Accessible by authenticated users with appropriate roles
 */
router.get("/", fetchAllEmployees);

/**
 * GET /employees/:id
 * Fetch an employee by ID
 * Accessible by authenticated users with appropriate roles
 */
router.get("/:id", fetchEmployeeById);

/**
 * POST /employees
 * Create a new employee
 * Accessible only by admin users
 */
router.post(
  "/",
  validateCreateEmployee,
  handleValidation,
  checkAdminRole,
  createEmployee
);

/**
 * PUT /employees/:id
 * Replace an entire employee document
 * Accessible only by admin users
 */
router.put(
  "/:id",
  validateUpdateEmployee,
  handleValidation,
  checkAdminRole,
  updateEmployee
);

/**
 * PATCH /employees/:id
 * Partially update an employee's information
 * Accessible only by admin users
 */
router.patch(
  "/:id",
  validateUpdateEmployee,
  handleValidation,
  checkAdminRole,
  updateEmployee
);

/**
 * DELETE /employees/:id
 * Delete an employee by ID
 * Accessible only by admin users
 */
router.delete(
  "/:id",
  validateDeleteEmployee,
  handleValidation,
  checkAdminRole,
  deleteEmployee
);

export default router;
