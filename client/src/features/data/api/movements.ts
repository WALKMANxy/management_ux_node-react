import { serverMovement } from "../../../models/dataSetTypes";
import { apiCall } from "../../../utils/apiUtils";


// Function to fetch filtered movements based on the user's role and entity code
export const getFilteredMovements = async (): Promise<serverMovement[]> => {
  try {
    //console.log("getFilteredMovements: Initiating API call to movements/filtered");
    const response = await apiCall<serverMovement[]>(`movements/filtered`, "GET");
    //console.log("getFilteredMovements: API call successful", response);
    return response;
  } catch (error) {
    console.error("getFilteredMovements: API call failed", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};