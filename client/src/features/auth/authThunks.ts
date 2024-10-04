import { createAsyncThunk } from "@reduxjs/toolkit";
import { AuthState } from "../../models/stateModels";
import { setAccessToken } from "../../services/tokenService";
import { webSocketService } from "../../services/webSocketService";
import { logoutUser } from "./api/auth";

// Thunk to handle login with potential side effects
export const handleLogin = createAsyncThunk(
  "auth/handleLogin",
  async (
    {
      role,
      id,
      userId,
      refreshToken,
    }: {
      role: AuthState["role"];
      id: string;
      userId: string;
      refreshToken: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log("Handling login in Redux with:", {
        role,
        id,
        userId,
        refreshToken,
      });

      // Perform side effects needed on login
      sessionStorage.setItem(
        "auth",
        JSON.stringify({ isLoggedIn: true, role, id, userId, refreshToken })
      );
    //   console.log("Auth state saved in sessionStorage");

      // Connect to WebSocket service
      webSocketService.connect();
      console.log("WebSocket service connected");

      // Return the payload to be used in the fulfilled case
      return { role, id, userId, refreshToken };
    } catch (error: unknown) {
      console.error("Error in handleLogin thunk:", error);
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
      // Call the logout API endpoint
      await logoutUser();

      webSocketService.disconnect();

      // Clear tokens
    //   console.log("Removing auth state from sessionStorage");
      sessionStorage.removeItem("authState");
    //   console.log("Removing auth state from localStorage");
      localStorage.removeItem("authState");
    //   console.log("Clearing access token");
      setAccessToken(null);

      return; // No payload needed
    } catch (error: unknown) {
      const typedError = error as { message: string };
      return rejectWithValue(typedError.message);
    }
  }
);
