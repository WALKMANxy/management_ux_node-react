// src/controllers/employeeController.ts
import { Request, Response } from "express";
import { EmployeeService } from "../services/employeeService";
import { isMongoDuplicateKeyError } from "./adminController";

/**
 * Fetch all employees and return as a response
 */
export const fetchAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await EmployeeService.getAllEmployees();
    res.json(employees);
  } catch (error) {
    console.error("Error in fetchAllEmployees:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Fetch a specific employee by ID
 */
export const fetchEmployeeById = async (req: Request, res: Response) => {
  try {
    const employee = await EmployeeService.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    console.error(`Error in fetchEmployeeById for id ${req.params.id}:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Create a new employee.
 */
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { id, name, email } = req.body;

    // Validate required fields
    if (!id || !name) {
      return res
        .status(400)
        .json({ message: "id and name are required" });
    }

    const newEmployee = await EmployeeService.createEmployeeService({ id, name, email });

    res.status(201).json({
      id: newEmployee.id,
      name: newEmployee.name,
      email: newEmployee.email,
    });
  } catch (error) {
    console.error("Error in createEmployee:", error);

    if (isMongoDuplicateKeyError(error)) {
      // Determine which field caused the duplicate key error
      const duplicatedField = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        message: `Employee with the given ${duplicatedField} already exists`,
      });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Update an existing employee by ID.
 */
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const employeeId = req.params.id;
    const { name, email } = req.body;

    // At least one field must be provided for update
    if (!name && !email) {
      return res.status(400).json({
        message: "At least one of name or email must be provided for update",
      });
    }

    const updatedEmployee = await EmployeeService.updateEmployeeService(employeeId, { name, email });

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      id: updatedEmployee.id,
      name: updatedEmployee.name,
      email: updatedEmployee.email,
    });
  } catch (error) {
    console.error(`Error in updateEmployee for id ${req.params.id}:`, error);

    if (isMongoDuplicateKeyError(error)) {
      const duplicatedField = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        message: `${duplicatedField.charAt(0).toUpperCase() + duplicatedField.slice(1)} already in use`,
      });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Delete an employee by ID.
 */
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const employeeId = req.params.id;
    const deleted = await EmployeeService.deleteEmployeeService(employeeId);

    if (!deleted) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error(`Error in deleteEmployee for id ${req.params.id}:`, error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
