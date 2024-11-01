//src/features/auth/authThunks.ts
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
      /*  console.log("Handling login in Redux with:", {
        role,
        id,
        userId,
        refreshToken,
      }); */

      sessionStorage.setItem(
        "auth",
        JSON.stringify({ isLoggedIn: true, role, id, userId, refreshToken })
      );
      //console.log("Auth state saved in sessionStorage");

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
      try {
        await logoutUser();
        webSocketService.disconnect();
      } catch (apiError) {
        console.error(
          "Logout API call or WebSocket disconnect failed:",
          apiError
        );
      }

      // Clear tokens and auth state regardless of API outcome
      sessionStorage.removeItem("authState");
      localStorage.removeItem("authState");
      setAccessToken(null);

      return;
    } catch (error: unknown) {
      const typedError = error as { message: string };
      return rejectWithValue(typedError.message);
    }
  }
);
