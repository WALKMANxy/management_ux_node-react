// src/services/api/employees.ts

import { Employee } from "../../../models/entityModels"; // Adjust the path as necessary
import { apiCall } from "../../../utils/apiUtils"; // Ensure this utility is correctly implemented

/**
 * Fetch all employees.
 * @returns Promise resolving to an array of Employee objects.
 */
export const getAllEmployees = async (): Promise<Employee[]> => {
  return apiCall<Employee[]>("employees", "GET");
};

/**
 * Fetch a specific employee by ID.
 * @param id - The ID of the employee to fetch.
 * @returns Promise resolving to an Employee object.
 */
export const getEmployeeById = async (id: string): Promise<Employee> => {
  return apiCall<Employee>(`employees/${id}`, "GET");
};

/**
 * Create a new employee.
 * @param employeeData - The data of the employee to create.
 * @returns Promise resolving to the created Employee object.
 */
export const createEmployee = async (
  employeeData: Employee
): Promise<Employee> => {
  return apiCall<Employee>("employees", "POST", employeeData);
};

/**
 * Update an existing employee by ID.
 * @param id - The ID of the employee to update.
 * @param updatedData - The partial data to update the employee.
 * @returns Promise resolving to the updated Employee object.
 */
export const updateEmployee = async (
  id: string,
  updatedData: Partial<Employee>
): Promise<Employee> => {
  return apiCall<Employee>(`employees/${id}`, "PATCH", updatedData);
};

/**
 * Replace an entire employee by ID.
 * @param id - The ID of the employee to replace.
 * @param employeeData - The complete data for the employee.
 * @returns Promise resolving to the replaced Employee object.
 */
export const replaceEmployee = async (
  id: string,
  employeeData: Employee
): Promise<Employee> => {
  return apiCall<Employee>(`employees/${id}`, "PUT", employeeData);
};

/**
 * Delete an employee by ID.
 * @param id - The ID of the employee to delete.
 * @returns Promise resolving to a success message.
 */
export const deleteEmployee = async (id: string): Promise<{ message: string }> => {
  return apiCall<{ message: string }>(`employees/${id}`, "DELETE");
};
