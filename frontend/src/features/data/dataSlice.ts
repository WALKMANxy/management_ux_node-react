// dataSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Client, Agent, Admin } from "../../models/entityModels";
import { api } from "../../services/api";

interface DataState {
  clients: Client[];
  agents: Agent[];
  agentDetails: Agent[];
  currentUserDetails: Client | Agent | Admin | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DataState = {
  clients: [],
  agents: [],
  agentDetails: [],
  currentUserDetails: null,
  status: 'idle',
  error: null,
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        api.endpoints.getClients.matchFulfilled,
        (state, action: PayloadAction<Client[]>) => {
          state.clients = action.payload;
          state.status = 'succeeded';
        }
      )
      .addMatcher(
        api.endpoints.getAgents.matchFulfilled,
        (state, action: PayloadAction<Agent[]>) => {
          state.agents = action.payload;
          state.status = 'succeeded';
        }
      )
      .addMatcher(
        api.endpoints.getAgentDetails.matchFulfilled,
        (state, action: PayloadAction<Agent[]>) => {
          state.agentDetails = action.payload;
          state.status = 'succeeded';
        }
      )
      .addMatcher(
        api.endpoints.getClientById.matchFulfilled,
        (state, action: PayloadAction<Client>) => {
          state.currentUserDetails = action.payload;
          state.status = 'succeeded';
        }
      )
      .addMatcher(
        api.endpoints.getAgentDetailsById.matchFulfilled,
        (state, action: PayloadAction<Agent>) => {
          state.currentUserDetails = action.payload;
          state.status = 'succeeded';
        }
      )
      .addMatcher(
        api.endpoints.getAdminById.matchFulfilled,
        (state, action: PayloadAction<Admin>) => {
          state.currentUserDetails = action.payload;
          state.status = 'succeeded';
        }
      )
      .addMatcher(
        api.endpoints.getClients.matchPending,
        (state) => {
          state.status = 'loading';
        }
      )
      .addMatcher(
        api.endpoints.getClients.matchRejected,
        (state, action) => {
          state.status = 'failed';
          state.error = action.error.message || 'An error occurred';
        }
      );
  },
});

export default dataSlice.reducer;