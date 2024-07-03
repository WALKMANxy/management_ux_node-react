// features/auth/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "../../models/models";

const initialState: AuthState = {
  isLoggedIn: false,
  userRole: "guest",
  id: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(
      state,
      action: PayloadAction<{ role: AuthState["userRole"]; id: string }>
    ) {
      state.isLoggedIn = true;
      state.userRole = action.payload.role;
      state.id = action.payload.id;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.userRole = "guest";
      state.id = "";
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
