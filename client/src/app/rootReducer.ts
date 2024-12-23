// src/app/rootReducer.ts
// Root reducer that combines all slices of state and handles global actions.
import { Action, combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import { calendarApi } from "../features/calendar/calendarQuery";
import chatReducer from "../features/chat/chatSlice";
import dataReducer from "../features/data/dataSlice";
import searchReducer from "../features/search/searchSlice";
import downloadedFilesReducer from "../features/downloads/downloadedFilesSlice";

import { userApi } from "../features/users/userQueries";
import userReducer from "../features/users/userSlice";
import { weatherApi } from "../features/weather/weatherQuery.ts";


const appReducer = combineReducers({
  auth: authReducer,
  search: searchReducer,
  data: dataReducer,
  users: userReducer,
  chats: chatReducer,
  downloadedFiles: downloadedFilesReducer,

  // Add the reducers generated by RTK Query
  [userApi.reducerPath]: userApi.reducer,
  [calendarApi.reducerPath]: calendarApi.reducer,
  [weatherApi.reducerPath]: weatherApi.reducer,
});

/**
 * Root reducer with special logic for handling global actions.
 *
 * This reducer is responsible for resetting the entire Redux state when the user logs out.
 * The state is set to `undefined`, which effectively clears the Redux store.
 *
 * @param state - The current state of the application
 * @param action - The action being dispatched
 * @returns The new state of the application
 */
const rootReducer = (
  state: Partial<ReturnType<typeof appReducer>> | undefined,
  action: Action
) => {
  if (action.type === "auth/handleLogout/fulfilled") {
    // Reset the entire state when the logout action is fulfilled
    state = undefined;
  }

  // Delegate all other actions to the app-level reducer
  return appReducer(state as ReturnType<typeof appReducer>, action);
};


export type State = ReturnType<typeof rootReducer>;

export default rootReducer;
