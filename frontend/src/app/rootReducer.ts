import { combineReducers } from "@reduxjs/toolkit";
import agentsReducer from "../features/agents/agentsSlice";
import authReducer, { logout } from "../features/auth/authSlice";
import calendarReducer from "../features/calendar/calendarSlice";
import clientsReducer from "../features/clients/clientsSlice";
import dataReducer from "../features/data/dataSlice";
import promosReducer from "../features/promos/promosSlice";
import searchReducer from "../features/search/searchSlice";
import visitsReducer from "../features/visits/visitsSlice";
import { api } from "../services/api";

// Combine all your reducers
const appReducer = combineReducers({
  auth: authReducer,
  search: searchReducer,
  data: dataReducer,
  calendar: calendarReducer,
  clients: clientsReducer,
  visits: visitsReducer,
  promos: promosReducer,
  agents: agentsReducer,
  [api.reducerPath]: api.reducer,
});

// Root reducer that handles resetting state on logout
const rootReducer = (state: any, action: any) => {
  if (action.type === logout.type) {
    // Reset entire state, including API slice
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export default rootReducer;
