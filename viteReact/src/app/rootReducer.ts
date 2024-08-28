import { Action, combineReducers } from "@reduxjs/toolkit";
import authReducer, { logout } from "../features/auth/authSlice";
import dataReducer from "../features/data/dataSlice";
import searchReducer from "../features/search/searchSlice";
import { api } from "../services/api";

// Combine all your reducers
const appReducer = combineReducers({
  auth: authReducer,
  search: searchReducer,
  data: dataReducer,
  /* visits: visitsReducer,
  promos: promosReducer, */
  [api.reducerPath]: api.reducer,
});

// Root reducer that handles resetting state on logout
const rootReducer = (
  state: Partial<ReturnType<typeof appReducer>> | undefined,
  action: Action
) => {
  if (action.type === logout.type) {
    // Reset entire state, including API slice
    state = undefined;
  }

  return appReducer(state as ReturnType<typeof appReducer>, action);
};

// Correctly infer the type of the state using ReturnType
export type State = ReturnType<typeof rootReducer>;

export default rootReducer;
