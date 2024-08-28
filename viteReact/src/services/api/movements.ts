import { serverMovement } from "../../models/dataSetTypes";
import { apiCall } from "./apiUtils";

// Function to fetch filtered movements based on the user's role and entity code
export const getFilteredMovements = async (): Promise<serverMovement[]> => {
  return apiCall<serverMovement[]>(`movements/filtered`, "GET");
};
