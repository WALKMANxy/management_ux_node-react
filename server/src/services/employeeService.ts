// src/services/employeeService.ts
import { Employee, IEmployee } from "../models/Employee";

export class EmployeeService {
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
      throw err;
    }
  }

  static async updateEmployeeService(
    id: string,
    updatedData: Partial<{ name: string; email: string }>
  ): Promise<IEmployee | null> {
    try {
      const updatedEmployee = await Employee.findOneAndUpdate(
        { id },
        { $set: updatedData },
        { new: true, runValidators: true }
      ).exec();
      return updatedEmployee;
    } catch (err: any) {
      console.error(`Error updating employee with id ${id}:`, err);
      throw err;
    }
  }

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
