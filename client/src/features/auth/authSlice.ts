//src/features/auth/authSlice.ts
console.log('Initializing authSlice');


import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "../../models/stateModels";
import { webSocketService } from "../../services/webSocketService";

const initialState: AuthState = {
  isLoggedIn: false,
  role: "guest",
  id: "placeholderId",
  userId: "placeholderUserId",
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
    { dispatch }
  ) => {
    // Perform side effects needed on login
    sessionStorage.setItem(
      "auth",
      JSON.stringify({ isLoggedIn: true, role, id, userId })
    );
    webSocketService.connect();

    // Dispatch the login action after side effects are handled
    dispatch(login({ role, id, userId }));
  }
);

// Thunk to handle logout with side effects
export const handleLogout = createAsyncThunk(
  "auth/handleLogout",
  async (_, { dispatch }) => {
    // Perform side effects needed on logout
    sessionStorage.clear();
    localStorage.clear();
    webSocketService.disconnect();

    // Dispatch the logout action after side effects are handled
    dispatch(logout());
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        role: AuthState["role"];
        id: string;
        userId: string;
      }>
    ) => {
      state.isLoggedIn = true;
      state.role = action.payload.role;
      state.id = action.payload.id;
      state.userId = action.payload.userId;
    },
    logout: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectIsLoggedIn = (state: { auth: AuthState }) =>
  state.auth.isLoggedIn;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.role;
export const selectUserId = (state: { auth: AuthState }) => state.auth.userId;
export const selectId = (state: { auth: AuthState }) => state.auth.id;
