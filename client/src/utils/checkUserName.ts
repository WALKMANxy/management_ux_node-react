// src/utils/updateUserEntityNameIfMissing.ts
import { AppDispatch } from "../app/store"; // Import your AppDispatch type
import { updateUserById } from "../features/users/userSlice"; // Import the updateUserById thunk
import { User } from "../models/entityModels"; // Import User model

/**
 * Utility function to update the user's entity name if it's missing or empty
 * @param dispatch - App dispatch function
 * @param currentUser - The current user object from userSlice
 * @param currentUserDetails - The current user details from dataSlice
 */
export const updateUserEntityNameIfMissing = (
  dispatch: AppDispatch,
  currentUser: Partial<User> | null,
  currentUserDetails: { name?: string } | null
) => {
  // Check if the currentUser is defined and the entityName is missing or empty
  if (
    currentUser &&
    (!currentUser.entityName || currentUser.entityName.trim() === "")
  ) {
    // Get the name from currentUserDetails
    const entityName = currentUserDetails?.name;

    // If entityName exists, dispatch updateUserById to update the user entity name
    if (entityName && currentUser._id) {
      dispatch(
        updateUserById({
          id: currentUser._id,
          updatedData: { entityName },
        })
      );
    }
  }
};
