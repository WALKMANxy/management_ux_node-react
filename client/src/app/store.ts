//src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "../services/authQueries";
import { loadAuthState, saveAuthState } from "../utils/localStorage";
import rootReducer from "./rootReducer";

const preloadedState: Partial<RootState> = {
  auth: loadAuthState(),
};

const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: false,
      immutableCheck: false,
    }).concat(authApi.middleware),
});

store.subscribe(() => {
  const authState = store.getState().auth;

  sessionStorage.setItem("auth", JSON.stringify(authState));

  if (
    authState.isLoggedIn &&
    localStorage.getItem("keepMeSignedIn") === "true"
  ) {
    saveAuthState(authState);
  } else {
    localStorage.removeItem("auth");
  }
});

setupListeners(store.dispatch);

export type AppStore = typeof store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = AppStore["dispatch"];
export default store;
