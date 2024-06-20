// src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, UserRole } from "../../models/models";

interface LoginPayload {
  role: UserRole;
  id?: string;
}

const initialState: AuthState = {
  isLoggedIn: false,
  userRole: "guest", // default to guest
  id: null, // add userId field
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<LoginPayload>) {
      state.isLoggedIn = true;
      state.userRole = action.payload.role;
      state.id = action.payload.id || null;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.userRole = "guest"; // default to guest
      state.id = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
