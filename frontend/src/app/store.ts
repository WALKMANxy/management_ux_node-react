import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { exampleAPI } from '../features/example/exampleAPI';
import debugReducer from '../features/debug/debugSlice';
import authReducer from '../features/auth/authSlice';

const store = configureStore({
  reducer: {
    [exampleAPI.reducerPath]: exampleAPI.reducer,
    debug: debugReducer,
    auth: authReducer,  // Add auth reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(exampleAPI.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
