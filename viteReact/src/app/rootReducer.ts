import { Action, combineReducers } from "@reduxjs/toolkit";
import authReducer, { logout } from "../features/auth/authSlice";
import calendarReducer from "../features/calendar/calendarSlice";
import dataReducer from "../features/data/dataSlice";
/* import promosReducer from "../features/promos/promosSlice";
 */import searchReducer from "../features/search/searchSlice";
/* import visitsReducer from "../features/visits/visitsSlice";
 */import { api } from "../services/api";

// Combine all your reducers
const appReducer = combineReducers({
  auth: authReducer,
  search: searchReducer,
  data: dataReducer,
  calendar: calendarReducer,
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
