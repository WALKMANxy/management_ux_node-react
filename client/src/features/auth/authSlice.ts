//src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "../../models/stateModels";
import { showToast } from "../../services/toastMessage";
import { handleLogin, handleLogout } from "./authThunks";

const initialState: AuthState = {
  isLoggedIn: false,
  role: "guest",
  id: "",
  userId: "",
  refreshToken: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
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
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(handleLogout.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.role = "guest";
        state.id = "";
        state.userId = "";
        state.refreshToken = "";
      })
      .addCase(handleLogin.rejected, (_state, action) => {
        showToast.error("Failed to login: " + action.payload);

        console.error(action.payload);
      })
      .addCase(handleLogout.rejected, (_state, action) => {
        console.error(action.payload);
      });
  },
});

export const { updateUserInfo } = authSlice.actions;

export default authSlice.reducer;


// Selector to get the logged-in state
export const selectIsLoggedIn = (state: { auth: AuthState }) =>
  state.auth.isLoggedIn;

// Selector to get the user role
export const selectUserRole = (state: { auth: AuthState }) => state.auth.role;

// Selector to get the user ID
export const selectUserId = (state: { auth: AuthState }) => state.auth.userId;

// Selector to get the entity ID
export const selectId = (state: { auth: AuthState }) => state.auth.id;
