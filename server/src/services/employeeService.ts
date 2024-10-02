import { IEmployee, Employee } from "../models/Employee";  // Import the Employee model

export class EmployeeService {
  // Fetch all employees
  static async getAllEmployees(): Promise<IEmployee[]> {
    try {
      return await Employee.find().exec();  // Fetch all employee records
    } catch (err) {
      throw new Error(
        `Error retrieving employees: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  // Fetch employee by MongoDB ObjectID or custom id field
  static async getEmployeeById(id: string): Promise<IEmployee | null> {
    try {
      return await Employee.findOne({ id }).exec();  // Fetch an employee by the custom "id" field
    } catch (err) {
      throw new Error(
        `Error retrieving employee by ID: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }
}
