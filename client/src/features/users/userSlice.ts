// src/store/slices/userSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";
import { RootState } from "../../app/store";
import { User } from "../../models/entityModels";
import { userApi } from "../../services/queries/userQueries";

// Define the initial state
export interface UserState {
  users: Record<string, Partial<User>>; // Mapping of userId to user data
  currentUser: Partial<User> | null; // For logged-in user data
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
  async (ids: string[], { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        userApi.endpoints.fetchUsersByIds.initiate(ids)
      ).unwrap();
      return result;
    } catch (error) {
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
      // Handle fetchUsersByIds
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

      // Handle fetchUserById
      .addCase(fetchUserById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = "succeeded";
        const user = action.payload;
        if (user._id) {
          state.users[user._id] = user;
          state.currentUser = user; // Optionally set the fetched user as current
        }
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Handle updateUserById
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
            state.currentUser = updatedUser; // Update currentUser if applicable
          }
        }
      })
      .addCase(updateUserById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearUserData, setCurrentUser, updateUser } = userSlice.actions;

export default userSlice.reducer;

// Selectors
export const selectUserById = (state: RootState, userId: string) =>
  state.users.users[userId];
export const selectUsersStatus = (state: RootState) => state.users.status;
export const selectUsersError = (state: RootState) => state.users.error;
export const selectCurrentUser = (state: RootState) => state.users.currentUser;
