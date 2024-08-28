import {
  /* createAsyncThunk, */ createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { AuthState } from "../../models/stateModels";
import { webSocketService } from "../../services/webSocket";
/* import { getLinkedEntities } from "../../services/api/users";
 */
/* export const fetchLinkedEntities = createAsyncThunk(
  "auth/fetchLinkedEntities",
  async (_, { dispatch }) => {
    try {
      const { linkedEntities } = await getLinkedEntities();
      dispatch(setLinkedEntities(linkedEntities));
    } catch (error) {
      console.error("Error fetching linked entities:", error);
      throw error;
    }
  }
); */

const initialState: AuthState = {
  isLoggedIn: false,
  userRole: "guest",
  id: "",
  userId: "",
  /*  linkedEntities: [], */
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        role: AuthState["userRole"];
        id: string;
        userId: string;
      }>
    ) => {
      state.isLoggedIn = true;
      state.userRole = action.payload.role;
      state.id = action.payload.id;
      state.userId = action.payload.userId;
    },
    logout: (state) => {
      Object.assign(state, initialState);
      /* state.linkedEntities = []; */
      // Consider moving side effects to a thunk or middleware
      sessionStorage.clear();
      localStorage.clear();
      webSocketService.disconnect(); // Disconnect WebSocket on logout
    },
    /*  setLinkedEntities: (state, action: PayloadAction<string[]>) => {
      state.linkedEntities = action.payload;
    }, */
  },
});

export const { login, logout /* setLinkedEntities */ } = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectIsLoggedIn = (state: { auth: AuthState }) =>
  state.auth.isLoggedIn;
export const selectUserRole = (state: { auth: AuthState }) =>
  state.auth.userRole;
export const selectUserId = (state: { auth: AuthState }) => state.auth.userId;
export const selectId = (state: { auth: AuthState }) => state.auth.id;
