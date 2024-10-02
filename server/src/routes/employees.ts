import express from "express";
import { fetchEmployeeById, fetchAllEmployees } from "../controllers/employeeController"; // Import the controller methods

const router = express.Router();

// GET method to retrieve all employees
router.get("/", fetchAllEmployees);

// GET method to retrieve an employee by ID
router.get("/:id", fetchEmployeeById);

export default router;
