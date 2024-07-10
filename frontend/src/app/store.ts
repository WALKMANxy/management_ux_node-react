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
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: false,
      immutableCheck: false,
    }).concat(api.middleware),
});

// Dispatch the initial data fetching queries
store.dispatch(api.endpoints.getClients.initiate());
store.dispatch(api.endpoints.getAgentDetails.initiate());

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
