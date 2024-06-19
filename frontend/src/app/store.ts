//src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../features/auth/authSlice";
import searchReducer from "../features/search/searchSlice";

const store = configureStore({
  reducer: {
  
    auth: authReducer,
    search: searchReducer,
  },
  
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
