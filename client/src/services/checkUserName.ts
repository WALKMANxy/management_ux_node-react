//src/services/checkUserName.ts
import { AppDispatch } from "../app/store";
import { updateUserById } from "../features/users/userSlice";
import { User } from "../models/entityModels";

export const updateUserEntityNameIfMissing = (
  dispatch: AppDispatch,
  currentUser: Partial<User> | null,
  currentUserDetails: { name?: string } | null
) => {
  if (!currentUser || currentUser.entityName?.trim()) {
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
