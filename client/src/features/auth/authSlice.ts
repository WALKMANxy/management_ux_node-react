import {
  /* createAsyncThunk, */ createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { AuthState } from "../../models/stateModels";
import { webSocketService } from "../../services/webSocket";


const initialState: AuthState = {
  isLoggedIn: false,
  role: "guest",
  id: "placeholderId",
  userId: "placeholderUserId",
};

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
      // Consider moving side effects to a thunk or middleware
      sessionStorage.clear();
      localStorage.clear();
      webSocketService.disconnect(); // Disconnect WebSocket on logout
    },

  },
});

export const { login, logout /* setLinkedEntities */ } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectIsLoggedIn = (state: { auth: AuthState }) =>
  state.auth.isLoggedIn;
export const selectUserRole = (state: { auth: AuthState }) =>
  state.auth.role;
export const selectUserId = (state: { auth: AuthState }) => state.auth.userId;
export const selectId = (state: { auth: AuthState }) => state.auth.id;
