// src/app/store.ts

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { calendarApi } from "../features/calendar/calendarQuery";
import { userApi } from "../features/users/userQueries";
import { weatherApi } from "../features/weather/weatherQuery.ts";
import { loadAuthState, saveAuthState } from "../services/localStorage.ts";
import listenerMiddleware from "./listeners";
import rootReducer from "./rootReducer";

/**
 * Load the authentication state from local storage to prepopulate the Redux state.
 * This allows the app to start with the user's previous session data if available.
 */
const preloadedState: Partial<RootState> = {
  auth: loadAuthState(),
};

/**
 * Configure and create the Redux store.
 *
 * - The store uses a rootReducer that combines all slice reducers.
 * - The preloadedState allows the app to start with persisted data.
 * - Middleware includes both default and custom middleware for handling asynchronous actions and other side effects.
 */
const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true, // Enables support for thunk middleware, commonly used for async logic
      serializableCheck: false, // Disables checks for non-serializable data, useful for certain API payloads
      immutableCheck: false, // Disables checks for state immutability, which can be performance-intensive
    })
      .concat(userApi.middleware)
      .concat(listenerMiddleware.middleware)
      .concat(calendarApi.middleware)
      .concat(weatherApi.middleware),
  // Enable Redux DevTools only in development mode
  devTools: process.env.NODE_ENV !== "production",
});
/**
 * Subscribe to store updates to handle state persistence.
 *
 * - The `auth` state is stored in sessionStorage for session persistence.
 * - If the "keepMeSignedIn" flag is set, the `auth` state is also stored in localStorage.
 * - This ensures that the user's session can persist across page reloads or browser closures.
 */
store.subscribe(() => {
  const authState = store.getState().auth;

  // Persist auth state in sessionStorage
  sessionStorage.setItem("auth", JSON.stringify(authState));

  // Persist auth state in localStorage if the user chose to stay signed in
  if (
    authState.isLoggedIn &&
    localStorage.getItem("keepMeSignedIn") === "true"
  ) {
    saveAuthState(authState);
  } else {
    localStorage.removeItem("auth");
  }
});

// Enable listeners for RTK Query to handle auto-refetching and other features
setupListeners(store.dispatch);

/**
 * Type definitions for the Redux store and related entities.
 *
 * - `AppStore`: The type of the Redux store itself.
 * - `RootState`: The type of the entire Redux state tree, inferred from the root reducer.
 * - `AppDispatch`: The type of the dispatch function, useful for typed dispatching in components and thunks.
 */
export type AppStore = typeof store;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];

export default store;
