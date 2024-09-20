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
export const getUsersByBatchIds = async (
  ids: string[]
): Promise<Partial<User>[]> => {

  try {
    const response = await apiCall<Partial<User>[]>(`users/batch`, "POST", { ids });
    return response;
  } catch (error) {
    console.error("getUsersByBatchIds error:", error); // Debugging: Log any errors
    throw error; // Re-throw the error to ensure it propagates correctly
  }
};


// API call to update the user's email
export const updateUserEmail = async (
  currentEmail: string,
  currentPassword: string,
  newEmail: string
): Promise<{ message: string }> => {
  return apiCall<{ message: string }>(`users/update-email`, "PATCH", {
    currentEmail,
    currentPassword,
    newEmail,
  });
};

// API call to update the user's password
export const updateUserPassword = async (
  currentEmail: string,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  return apiCall<{ message: string }>(`users/update-password`, "PATCH", {
    currentEmail,
    currentPassword,
    newPassword,
  });
};
