// src/services/api/employees.ts

import { Employee } from "../../../models/entityModels"; // Assuming Employee type is defined in entityModels
import { apiCall } from "../../../utils/apiUtils"; // Assuming apiCall is a utility function for making HTTP requests

// Fetch a specific employee by ID
export const getEmployeeById = async (id: string): Promise<Employee> => {
  return apiCall<Employee>(`employees/${id}`, "GET");
};

// Fetch all employees
export const getAllEmployees = async (): Promise<Employee[]> => {
  return apiCall<Employee[]>(`employees`, "GET");
};
