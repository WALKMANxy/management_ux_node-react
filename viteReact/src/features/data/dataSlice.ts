import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Admin, Agent, Client } from "../../models/entityModels";
import { dataApi } from "../../services/queries";
import { DataSliceState } from "../../models/stateModels";


const initialState: DataSliceState = {
  clients: {},
  agents: {},
  agentDetails: {},
  currentUserData: null,
  currentUserDetails: null,
  selectedClientId: null,
  selectedAgentId: null,
  status: "idle",
  error: null,
};

export const fetchInitialData = createAsyncThunk(
  "data/fetchInitialData",
  async (_, { getState, dispatch }) => {
    const state = getState() as { auth: { userRole: string; id: string } };
    const { userRole, id } = state.auth;

    let userData;
    if (userRole === "client") {
      userData = await dispatch(
        dataApi.endpoints.getUserClientData.initiate(id)
      ).unwrap();
    } else if (userRole === "agent") {
      userData = await dispatch(
        dataApi.endpoints.getUserAgentData.initiate(id)
      ).unwrap();
    } else if (userRole === "admin") {
      userData = await dispatch(
        dataApi.endpoints.getUserAdminData.initiate(id)
      ).unwrap();
    } else {
      throw new Error("Invalid user role");
    }

    return { userRole, userData };
  }
);

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    clearSelection: (state) => {
      state.selectedClientId = null;
      state.selectedAgentId = null;
    },
    selectClient: (state, action: PayloadAction<string>) => {
      state.selectedClientId = action.payload;
      state.selectedAgentId = null;
    },
    selectAgent: (state, action: PayloadAction<string>) => {
      state.selectedAgentId = action.payload;
      state.selectedClientId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { userRole, userData } = action.payload;

        if (userRole === "client") {
          const clientData = userData as Client;
          state.clients[clientData.id] = clientData;
          state.currentUserData = clientData;
          state.currentUserDetails = {
            id: clientData.id,
            role: "client",
            name: clientData.name,
          };
        } else if (userRole === "agent") {
          const agentData = userData as Agent;
          state.agents[agentData.id] = agentData;
          state.agentDetails[agentData.id] = agentData;
          agentData.clients.forEach((client) => {
            state.clients[client.id] = client;
          });
          state.currentUserData = agentData;
          state.currentUserDetails = {
            id: agentData.id,
            role: "agent",
            name: agentData.name,
          };
        } else if (userRole === "admin") {
          const adminData = userData as Admin;
          adminData.clients.forEach((client) => {
            state.clients[client.id] = client;
          });
          adminData.agents.forEach((agent) => {
            state.agents[agent.id] = agent;
            state.agentDetails[agent.id] = agent;
          });
          state.currentUserData = adminData;
          state.currentUserDetails = {
            id: adminData.id,
            role: "admin",
            name: adminData.name,
          };
        }
      })
      .addCase(fetchInitialData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "An error occurred";
      });
  },
});

export const { clearSelection, selectClient, selectAgent } = dataSlice.actions;
export default dataSlice.reducer;
