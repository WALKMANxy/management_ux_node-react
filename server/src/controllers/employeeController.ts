import { Request, Response } from "express";
import { EmployeeService } from "../services/employeeService";

// Fetch all employees and return as a response
export const fetchAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await EmployeeService.getAllEmployees();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Fetch a specific employee by ID
export const fetchEmployeeById = async (req: Request, res: Response) => {
  try {
    const employee = await EmployeeService.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
