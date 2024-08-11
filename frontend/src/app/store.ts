// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "../services/api";
import { loadAuthState, saveAuthState } from "../utils/localStorage";
import rootReducer from "./rootReducer"; // Import the root reducer

const preloadedState = {
  auth: loadAuthState(),
};

const store = configureStore({
  reducer: rootReducer, // Use the root reducer here
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: false,
      immutableCheck: false,
    }).concat(api.middleware),
});

store.subscribe(() => {
  const authState = store.getState().auth;

  // Save to sessionStorage regardless
  sessionStorage.setItem("auth", JSON.stringify(authState));

  // Conditionally save to localStorage
  if (
    authState.isLoggedIn &&
    localStorage.getItem("keepMeSignedIn") === "true"
  ) {
    saveAuthState(authState);
  } else {
    localStorage.removeItem("auth"); // Remove saved auth state if user is not logged in or doesn't want to stay signed in
  }
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
