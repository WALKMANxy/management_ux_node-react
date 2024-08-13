import { /* createAsyncThunk, */ createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "../../models/stateModels";
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
 /*  linkedEntities: [], */
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
      /* state.linkedEntities = []; */
      // Consider moving side effects to a thunk or middleware
      sessionStorage.clear();
      localStorage.clear();
    },
   /*  setLinkedEntities: (state, action: PayloadAction<string[]>) => {
      state.linkedEntities = action.payload;
    }, */
  },
});



export const { login, logout, /* setLinkedEntities */ } = authSlice.actions;

export default authSlice.reducer;