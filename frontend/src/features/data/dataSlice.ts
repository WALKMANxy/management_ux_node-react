import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Client } from "../../models/entityModels";
import { DataState } from "../../models/stateModels";
import { api } from "../../services/api"; // Import the API slice

// Define the initial state
const initialState: DataState = {
  clients: [],
  clientIndex: new Map(),
  status: "idle",
  error: null,
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setAgentClients(state, action: PayloadAction<Client[]>) {
      state.clients = action.payload;
      state.clientIndex = new Map<string, Client>(
        action.payload.map((client) => [client.id, client])
      );
    },
  },
  extraReducers: (builder) => {
    // Integrate RTK Query's getClients and getAgentDetails query lifecycle actions
    builder
      .addMatcher(api.endpoints.getClients.matchPending, (state) => {
        state.status = "loading";
      })
      .addMatcher(api.endpoints.getClients.matchFulfilled, (state, action) => {
        state.status = "succeeded";
        state.clients = action.payload;
        state.clientIndex = new Map<string, Client>(
          action.payload.map((client) => [client.id, client])
        );
      })
      .addMatcher(api.endpoints.getClients.matchRejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || null;
      })
      .addMatcher(api.endpoints.getAgentDetails.matchPending, (state) => {
        state.status = "loading";
      })
      .addMatcher(
        api.endpoints.getAgentDetails.matchFulfilled,
        (state, action) => {
          state.status = "succeeded";
          // Assuming action.payload is an array of agents with nested clients
          const clients = action.payload.flatMap((agent) => agent.clients);
          state.clients = clients;
          state.clientIndex = new Map<string, Client>(
            clients.map((client) => [client.id, client])
          );
        }
      )
      .addMatcher(
        api.endpoints.getAgentDetails.matchRejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.error?.message || null;
        }
      );
  },
});

export const { setAgentClients } = dataSlice.actions;
export default dataSlice.reducer;
