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
  if (
    !currentUser ||
    currentUser.entityName?.trim()
  ) {
    return;
  }

  const entityName = currentUserDetails?.name?.trim();
  const userId = currentUser?._id;

  if (entityName && userId) {
    dispatch(
      updateUserById({
        id: userId,
        updatedData: { entityName },
      })
    );
  }
};
