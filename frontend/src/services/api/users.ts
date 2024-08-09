import { User } from "../../models/models";
import { apiCall } from "./apiUtils";

export const getUserById = async (id: string): Promise<User> => {
  return apiCall<User>(`users/${id}`, "GET");
};

export const getAllUsers = async (): Promise<User[]> => {
  return apiCall<User[]>(`users`, "GET");
};

export const updateUserById = async (
  id: string,
  updatedData: Partial<User>
): Promise<User> => {
  return apiCall<User>(`users/${id}`, "PATCH", updatedData);
};



export const getEntityByRoleAndCode = async (role: string, entityCode: string): Promise<User> => {
  return apiCall<User>(`entities/${role}/${entityCode}`, "GET");
};
