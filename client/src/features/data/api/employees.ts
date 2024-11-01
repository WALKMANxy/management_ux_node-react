// src/features/data/api/employees.ts

import { Employee } from "../../../models/entityModels";
import { apiCall } from "../../../utils/apiUtils";


export const getAllEmployees = async (): Promise<Employee[]> => {
  return apiCall<Employee[]>("employees", "GET");
};


export const getEmployeeById = async (id: string): Promise<Employee> => {
  return apiCall<Employee>(`employees/${id}`, "GET");
};


export const createEmployee = async (
  employeeData: Employee
): Promise<Employee> => {
  return apiCall<Employee>("employees", "POST", employeeData);
};


export const updateEmployee = async (
  id: string,
  updatedData: Partial<Employee>
): Promise<Employee> => {
  return apiCall<Employee>(`employees/${id}`, "PATCH", updatedData);
};


export const replaceEmployee = async (
  id: string,
  employeeData: Employee
): Promise<Employee> => {
  return apiCall<Employee>(`employees/${id}`, "PUT", employeeData);
};


export const deleteEmployee = async (id: string): Promise<{ message: string }> => {
  return apiCall<{ message: string }>(`employees/${id}`, "DELETE");
};
