import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Agent } from "../../models/entityModels";
import { AgentState } from "../../models/stateModels";
import { api } from "../../services/api"; // Import the API slice

// Define the initial state
const initialState: AgentState = {
  agents: [],
  status: "idle",
  error: null,
};

// Create the agents slice
const agentsSlice = createSlice({
  name: "agents",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(api.endpoints.getAgentDetails.matchPending, (state) => {
        state.status = "loading";
      })
      .addMatcher(
        api.endpoints.getAgentDetails.matchFulfilled,
        (state, action: PayloadAction<Agent[]>) => {
          state.status = "succeeded";
          state.agents = action.payload;
        }
      )
      .addMatcher(
        api.endpoints.getAgentDetails.matchRejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.error?.message || "Something went wrong";
        }
      );
  },
});

export const selectAllAgents = (state: RootState) => state.agents.agents;
export const getAgentsStatus = (state: RootState) => state.agents.status;
export const getAgentsError = (state: RootState) => state.agents.error;

export default agentsSlice.reducer;
