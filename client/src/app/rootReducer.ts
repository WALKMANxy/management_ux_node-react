//src/app/rootReducer.ts

/* console.log('Initializing rootReducer');
 */
import { Action, combineReducers } from "@reduxjs/toolkit";
import { authApi } from "../features/auth/authQueries";
import authReducer from "../features/auth/authSlice";
import { chatApi } from "../features/chat/chatQueries";
import chatReducer from "../features/chat/chatSlice";
import { dataApi } from "../features/data/dataQueries";
import dataReducer from "../features/data/dataSlice";
import searchReducer from "../features/search/searchSlice";
import { userApi } from "../features/users/userQueries";
import userReducer from "../features/users/userSlice";
import { promoVisitApi } from "../features/data/promosVisitsQueries";
import { calendarApi } from "../features/calendar/calendarQuery";

// Combine all your reducers
const appReducer = combineReducers({
  auth: authReducer,
  search: searchReducer,
  data: dataReducer,
  users: userReducer,
  chats: chatReducer,

  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [dataApi.reducerPath]: dataApi.reducer,
  [calendarApi.reducerPath]: calendarApi.reducer,
  [promoVisitApi.reducerPath]: promoVisitApi.reducer,
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
