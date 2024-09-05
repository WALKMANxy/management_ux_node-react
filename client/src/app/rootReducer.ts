//src/app/rootReducer.ts

/* console.log('Initializing rootReducer');
 */
import { Action, combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import dataReducer from "../features/data/dataSlice";
import searchReducer from "../features/search/searchSlice";
import userReducer from "../features/users/userSlice";
import { authApi } from "../services/queries/authQueries";
import { dataApi } from "../services/queries/dataQueries";
import { userApi } from "../services/queries/userQueries";


// Combine all your reducers
const appReducer = combineReducers({
  auth: authReducer,
  search: searchReducer,
  data: dataReducer,
  users: userReducer,

  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [dataApi.reducerPath]: dataApi.reducer, // Add the dataApi reducer here
});

// Root reducer that handles resetting state on logout
const rootReducer = (
  state: Partial<ReturnType<typeof appReducer>> | undefined,
  action: Action
) => {
  if (action.type === "auth/handleLogout/fulfilled") {
    // Reset entire state, including API slice
    state = undefined;
  }

  return appReducer(state as ReturnType<typeof appReducer>, action);
};

// Correctly infer the type of the state using ReturnType
export type State = ReturnType<typeof rootReducer>;

export default rootReducer;
