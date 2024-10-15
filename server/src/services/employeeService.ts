// src/services/employeeService.ts

import { IEmployee, Employee } from "../models/Employee";

/**
 * Service class for Employee-related operations.
 */
export class EmployeeService {
  /**
   * Fetch all employees from the database.
   * @returns Promise resolving to an array of Employee documents.
   */
  static async getAllEmployees(): Promise<IEmployee[]> {
    try {
      const employees = await Employee.find().exec();
      return employees;
    } catch (err) {
      console.error("Error retrieving employees:", err);
      throw new Error(
        `Error retrieving employees: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Fetch a single employee by ID from the database.
   * @param id - The ID of the employee to fetch.
   * @returns Promise resolving to an Employee document or null if not found.
   */
  static async getEmployeeById(id: string): Promise<IEmployee | null> {
    try {
      const employee = await Employee.findOne({ id }).exec();
      return employee;
    } catch (err) {
      console.error(`Error retrieving employee with id ${id}:`, err);
      throw new Error(
        `Error retrieving employee with id ${id}: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Create a new employee in the database.
   * @param employeeData - The data for the new employee.
   * @returns Promise resolving to the created Employee document.
   */
  static async createEmployeeService(employeeData: {
    id: string;
    name: string;
    email?: string;
  }): Promise<IEmployee> {
    try {
      const newEmployee = new Employee(employeeData);
      await newEmployee.save();
      return newEmployee;
    } catch (err: any) {
      console.error("Error creating employee:", err);
      throw err; // Let the controller handle specific error responses
    }
  }

  /**
   * Update an existing employee by ID with provided data.
   * @param id - The ID of the employee to update.
   * @param updatedData - Partial data to update the employee.
   * @returns Promise resolving to the updated Employee document or null if not found.
   */
  static async updateEmployeeService(
    id: string,
    updatedData: Partial<{ name: string; email: string }>
  ): Promise<IEmployee | null> {
    try {
      const updatedEmployee = await Employee.findOneAndUpdate(
        { id },
        { $set: updatedData },
        { new: true, runValidators: true } // Return the updated document and run validators
      ).exec();
      return updatedEmployee;
    } catch (err: any) {
      console.error(`Error updating employee with id ${id}:`, err);
      throw err; // Let the controller handle specific error responses
    }
  }

  /**
   * Delete an employee by ID.
   * @param id - The ID of the employee to delete.
   * @returns Promise resolving to true if deleted, false if not found.
   */
  static async deleteEmployeeService(id: string): Promise<boolean> {
    try {
      const result = await Employee.deleteOne({ id }).exec();
      return result.deletedCount === 1;
    } catch (err) {
      console.error(`Error deleting employee with id ${id}:`, err);
      throw new Error("Error deleting employee");
    }
  }
}
