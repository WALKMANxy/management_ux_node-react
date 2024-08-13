import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "../../models/stateModels";



const initialState: AuthState = {
  isLoggedIn: false,
  userRole: "guest",
  id: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ role: AuthState["userRole"]; id: string }>
    ) => {
      state.isLoggedIn = true;
      state.userRole = action.payload.role;
      state.id = action.payload.id;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userRole = "guest";
      state.id = "";
      // Consider moving side effects to a thunk or middleware
      sessionStorage.clear();
      localStorage.clear();
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;