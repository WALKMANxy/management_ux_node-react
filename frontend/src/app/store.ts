// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../features/auth/authSlice";
import calendarReducer from "../features/calendar/calendarSlice";
import clientsReducer from "../features/clients/clientsSlice";
import dataReducer from "../features/data/dataSlice";
import searchReducer from "../features/search/searchSlice";
import agentsReducer from "../features/agents/agentsSlice";
import visitsReducer from "../features/visits/visitsSlice";
import promosReducer from "../features/promos/promosSlice"; // Import the agents reducer
import { api } from "../services/api";
import { loadAuthState, saveAuthState } from "../utils/localStorage";

const preloadedState = {
  auth: loadAuthState(),
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    search: searchReducer,
    data: dataReducer,
    calendar: calendarReducer,
    clients: clientsReducer,
    visits: visitsReducer,
    promos: promosReducer,
    agents: agentsReducer, // Add the agents reducer
    [api.reducerPath]: api.reducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: false,
      immutableCheck: false,
    }).concat(api.middleware),
});

// Subscribe to the store to save auth state to both sessionStorage and localStorage
store.subscribe(() => {
  const authState = store.getState().auth;

  // Save to sessionStorage regardless
  sessionStorage.setItem('auth', JSON.stringify(authState));

  // Conditionally save to localStorage
  if (authState.isLoggedIn && localStorage.getItem("keepMeSignedIn") === "true") {
    saveAuthState(authState);
  } else {
    localStorage.removeItem("auth"); // Remove saved auth state if user is not logged in or doesn't want to stay signed in
  }
});



setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
