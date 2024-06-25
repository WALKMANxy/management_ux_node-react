//src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../features/auth/authSlice";
import searchReducer from "../features/search/searchSlice";
import dataReducer, { fetchData } from "../features/data/dataSlice";
import { api } from "../services/api";


const store = configureStore({
  reducer: {
    auth: authReducer,
    search: searchReducer,
    data: dataReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: api.middleware,
      },
      serializableCheck: false,
      immutableCheck: false,
    }).concat(api.middleware),
});

store.dispatch(fetchData());
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;