import { Movement } from "../../models/dataModels";
import { apiCall } from "./apiUtils";

// Function to fetch filtered movements based on the user's role and entity code
export const getFilteredMovements = async (): Promise<Movement[]> => {
  return apiCall<Movement[]>(`movements/filtered`, "GET");
};
