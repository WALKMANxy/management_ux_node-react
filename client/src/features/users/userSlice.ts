// src/features/users/userSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import { createSelector } from "reselect";
import { RootState } from "../../app/store";
import { User } from "../../models/entityModels";
import { deleteUserById, getAllUsers, getUsersByBatchIds } from "./api/users";
import { userApi } from "./userQueries";

// Define the initial state
export interface UserState {
  users: Record<string, Partial<User>>;
  currentUser: Partial<User> | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UserState = {
  users: {},
  currentUser: null,
  status: "idle",
  error: null,
};

// Async thunk to fetch users by IDs using userApi
export const fetchUsersByIds = createAsyncThunk(
  "users/fetchUsersByIds",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const result = await getUsersByBatchIds(ids);
      return result;
    } catch (error) {
      console.error("fetchUsersByIds error:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch users"
      );
    }
  }
);

// Async thunk to fetch a single user by ID using userApi
export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        userApi.endpoints.getUserById.initiate(id)
      ).unwrap();
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch user"
      );
    }
  }
);

// Async thunk to update a user by ID using userApi
export const updateUserById = createAsyncThunk(
  "users/updateUserById",
  async (
    { id, updatedData }: { id: string; updatedData: Partial<User> },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const result = await dispatch(
        userApi.endpoints.updateUserById.initiate({ id, updatedData })
      ).unwrap();
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update user"
      );
    }
  }
);

// Thunk to fetch all users
export const getAllUsersThunk = createAsyncThunk<User[], void>(
  "users/getAllUsersThunk",
  async (_, { rejectWithValue }) => {
    try {
      const result = await getAllUsers();
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch users"
      );
    }
  }
);

// Async thunk to delete a user by ID
export const deleteUserByIdThunk = createAsyncThunk(
  "users/deleteUserById",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteUserById(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete user"
      );
    }
  }
);

// Define the user slice
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserData: (state) => {
      state.users = {};
      state.currentUser = null;
      state.status = "idle";
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<Partial<User>>) => {
      state.currentUser = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      const user = action.payload;
      if (user._id) {
        state.users[user._id] = { ...state.users[user._id], ...user };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsersThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(
        getAllUsersThunk.fulfilled,
        (state, action: PayloadAction<User[]>) => {
          /* console.log(
            "getAllUsersThunk fulfilled with payload:",
            action.payload
          ); // Debug: Log the payload */

          state.status = "succeeded";

          // Transform the array of users into a Record<string, Partial<User>>
          state.users = action.payload.reduce(
            (acc: Record<string, Partial<User>>, user: User) => {
              if (user._id) {
                acc[user._id] = user;
              }
              return acc;
            },
            {}
          ); /*  console.log("Updated current user in state:", state.currentUser); // Debug: Log the transformed users object */

          /*           console.log("Updated users in state:", state.users); // Debug: Log the transformed users object
           */

          /*  console.log(
            "Current state after fulfilling getAllUsersThunk:",
            state
          ); // Debug: Log the complete state */
        }
      )

      .addCase(getAllUsersThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchUsersByIds.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsersByIds.fulfilled, (state, action) => {
        state.status = "succeeded";
        action.payload.forEach((user: WritableDraft<Partial<User>>) => {
          if (user._id) {
            state.users[user._id] = user;
          }
        });
      })
      .addCase(fetchUsersByIds.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchUserById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = "succeeded";
        const user = action.payload;
        if (user._id) {
          state.users[user._id] = user;
          state.currentUser = user;
        }
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(updateUserById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateUserById.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedUser = action.payload;
        if (updatedUser._id) {
          state.users[updatedUser._id] = updatedUser;
          if (state.currentUser?._id === updatedUser._id) {
            state.currentUser = updatedUser;
          }
        }
      })
      .addCase(updateUserById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(deleteUserByIdThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteUserByIdThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const userId = action.payload;
        delete state.users[userId];
      })
      .addCase(deleteUserByIdThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearUserData, setCurrentUser, updateUser } = userSlice.actions;

export default userSlice.reducer;

// Memoized selector to select a user by ID
export const selectUserById = createSelector(
  [
    (state: RootState) => state.users.users,
    (_: RootState, userId: string) => userId,
  ],
  (users, userId) => users[userId] as User | undefined
);

// Memoized selector to get all users as an array
export const selectAllUsers = createSelector(
  (state: RootState) => state.users.users,
  (users) => Object.values(users)
);

export const selectUsersLoading = (state: RootState) =>
  state.users.status === "loading";
export const selectUsersStatus = (state: RootState) => state.users.status;

export const selectUsersError = (state: RootState) => state.users.error;

export const selectCurrentUser = (state: RootState) => state.users.currentUser;
