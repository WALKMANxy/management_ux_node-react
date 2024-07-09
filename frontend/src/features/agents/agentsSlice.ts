import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Agent } from "../../models/models";
import { loadAgentDetailsData } from "../../utils/dataLoader";

// Define the initial state
const initialState: {
  agents: Agent[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
} = {
  agents: [],
  status: 'idle',
  error: null,
};

// Async thunk to load agent details
export const fetchAgents = createAsyncThunk<Agent[], void, { state: RootState }>(
  'agents/fetchAgents',
  async (_, { rejectWithValue }) => {
    try {
      const agentDetails = await loadAgentDetailsData('/data/agentdetailsdataset02072024.min.json');
      return agentDetails;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load agent details');
    }
  }
);

// Create the agents slice
const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.agents = action.payload;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const selectAllAgents = (state: RootState) => state.agents.agents;
export const getAgentsStatus = (state: RootState) => state.agents.status;
export const getAgentsError = (state: RootState) => state.agents.error;

export default agentsSlice.reducer;
