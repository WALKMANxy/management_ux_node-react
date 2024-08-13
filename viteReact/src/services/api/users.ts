import { User } from "../../models/entityModels";
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

// New function to fetch linked entities
export const getLinkedEntities = async (): Promise<{ linkedEntities: string[] }> => {
  return apiCall<{ linkedEntities: string[] }>('linked-entities', 'GET');
};