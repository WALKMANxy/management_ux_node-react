import { serverMovement } from "../../../models/dataSetTypes";
import { showToast } from "../../../services/toastMessage";
import { apiCall } from "../../../utils/apiUtils";
import {
  getCachedDataSafe,
  setCachedDataSafe,
} from "../../../utils/cacheUtils";

// Function to fetch filtered movements based on the user's role and entity code
export const getFilteredMovements = async (): Promise<serverMovement[]> => {
  // Attempt to retrieve filtered movements from the cache
  const cachedData = await getCachedDataSafe<serverMovement[]>("movements");
  if (cachedData) {
    console.log("getFilteredMovements: Retrieved from cache");
    return cachedData;
  }

  // If no cached data is found, fetch from the API
  try {
    console.log("getFilteredMovements: Cache not found; fetching from API");
    const data = await apiCall<serverMovement[]>("movements/filtered", "GET");
    console.log("getFilteredMovements: Fetched from API");

    // Update the cache with the fresh data
    await setCachedDataSafe("movements", data);
    console.log("getFilteredMovements: Cached successfully");

    return data;
  } catch (error) {
    console.error(
      "getFilteredMovements: Failed to load filtered movements data",
      error
    );
    showToast.error("Failed to load filtered movements data.");
    throw error;
  }
};
