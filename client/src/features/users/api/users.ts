import { User } from "../../../models/entityModels";
import { apiCall } from "../../../utils/apiUtils";

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

// New API call to fetch users by a batch of IDs
export const getUsersByBatchIds = async (ids: string[]): Promise<Partial<User>[]> => {
  return apiCall<Partial<User>[]>(`users/batch`, "POST", { ids });
};