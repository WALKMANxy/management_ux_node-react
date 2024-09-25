//src/features/auth/authSlice.ts

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { AuthState } from "../../models/stateModels";
import { webSocketService } from "../../services/webSocketService";
import { showToast } from "../../utils/toastMessage";

const initialState: AuthState = {
  isLoggedIn: false,
  role: "guest",
  id: "",
  userId: "",
};

// Thunk to handle login with potential side effects
export const handleLogin = createAsyncThunk(
  "auth/handleLogin",
  async (
    {
      role,
      id,
      userId,
    }: { role: AuthState["role"]; id: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      // Perform side effects needed on login
      sessionStorage.setItem(
        "auth",
        JSON.stringify({ isLoggedIn: true, role, id, userId })
      );

      webSocketService.connect();

      // Return the payload to be used in the fulfilled case
      return { role, id, userId };
    } catch (error: unknown) {
      const typedError = error as { message: string };

      return rejectWithValue(typedError.message);
    }
  }
);

// Thunk to handle logout with side effects
export const handleLogout = createAsyncThunk(
  "auth/handleLogout",
  async (_, { rejectWithValue }) => {
    try {
      // Perform side effects needed on logout
      sessionStorage.clear();
      localStorage.clear();
      webSocketService.disconnect();
      Cookies.remove("token");

      return; // No payload needed
    } catch (error: unknown) {
      const typedError = error as { message: string };

      return rejectWithValue(typedError.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Optional: Define synchronous actions if needed
    // For example, to update user info without side effects
    updateUserInfo: (
      state,
      action: PayloadAction<{
        role: AuthState["role"];
        id: string;
        userId: string;
      }>
    ) => {
      state.role = action.payload.role;
      state.id = action.payload.id;
      state.userId = action.payload.userId;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(handleLogin.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.role = action.payload.role;
        state.id = action.payload.id;
        state.userId = action.payload.userId;
      })
      .addCase(handleLogout.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.role = "guest";
        state.id = "";
        state.userId = "";
      })
      .addCase(handleLogin.rejected, (_state, action) => {
        // Optionally, handle login errors
        showToast.error("Failed to login: " + action.payload);

        console.error(action.payload);
      })
      .addCase(handleLogout.rejected, (_state, action) => {
        // Optionally, handle logout errors
        showToast.error("Failed to logout: " + action.payload);

        console.error(action.payload);
      });
  },
});

export default authSlice.reducer;

// Memoized selectors using reselect

// Selector to get the logged-in state
export const selectIsLoggedIn = (state: { auth: AuthState }) =>
  state.auth.isLoggedIn;

// Selector to get the user role
export const selectUserRole = (state: { auth: AuthState }) => state.auth.role;

// Selector to get the user ID
export const selectUserId = (state: { auth: AuthState }) => state.auth.userId;

export const selectId = (state: { auth: AuthState }) => state.auth.id;
