import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Admin, Agent, Client } from "../../models/entityModels";
import { DataSliceState } from "../../models/stateModels";
import { updateApi } from "../../services/promosVisitsQueries";
import { dataApi } from "../../services/queries";

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

export const updateVisits = createAsyncThunk(
  "data/updateVisits",
  async (_, { dispatch }) => {
    return await dispatch(updateApi.endpoints.updateVisits.initiate()).unwrap();
  }
);

export const updatePromos = createAsyncThunk(
  "data/updatePromos",
  async (_, { dispatch }) => {
    return await dispatch(updateApi.endpoints.updatePromos.initiate()).unwrap();
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
      })
      .addCase(updateVisits.fulfilled, (state, action) => {
        const updatedEntity = action.payload;
        if ("visits" in updatedEntity) {
          // Client case
          state.clients[updatedEntity.id] = {
            ...state.clients[updatedEntity.id],
            visits: updatedEntity.visits,
          };
          if (state.currentUserData && "visits" in state.currentUserData) {
            state.currentUserData.visits = updatedEntity.visits;
          }
        } else if ("AgentVisits" in updatedEntity) {
          // Agent case
          state.agents[updatedEntity.id] = {
            ...state.agents[updatedEntity.id],
            AgentVisits: updatedEntity.AgentVisits,
          };
          state.agentDetails[updatedEntity.id] = {
            ...state.agentDetails[updatedEntity.id],
            AgentVisits: updatedEntity.AgentVisits,
          };
          if (state.currentUserData && "AgentVisits" in state.currentUserData) {
            state.currentUserData.AgentVisits = updatedEntity.AgentVisits;
          }
        } else if ("GlobalVisits" in updatedEntity) {
          // Admin case
          if (
            state.currentUserData &&
            "GlobalVisits" in state.currentUserData
          ) {
            state.currentUserData.GlobalVisits = updatedEntity.GlobalVisits;
          }
          // Update agents' visits
          Object.keys(updatedEntity.GlobalVisits).forEach((agentId) => {
            if (state.agents[agentId]) {
              state.agents[agentId] = {
                ...state.agents[agentId],
                AgentVisits: updatedEntity.GlobalVisits[agentId].Visits,
              };
              state.agentDetails[agentId] = {
                ...state.agentDetails[agentId],
                AgentVisits: updatedEntity.GlobalVisits[agentId].Visits,
              };
            }
          });
        }
      })
      .addCase(updatePromos.fulfilled, (state, action) => {
        const updatedEntity = action.payload;
        if ("promos" in updatedEntity) {
          // Client case
          state.clients[updatedEntity.id] = {
            ...state.clients[updatedEntity.id],
            promos: updatedEntity.promos,
          };
          if (state.currentUserData && "promos" in state.currentUserData) {
            state.currentUserData.promos = updatedEntity.promos;
          }
        } else if ("AgentPromos" in updatedEntity) {
          // Agent case
          state.agents[updatedEntity.id] = {
            ...state.agents[updatedEntity.id],
            AgentPromos: updatedEntity.AgentPromos,
          };
          state.agentDetails[updatedEntity.id] = {
            ...state.agentDetails[updatedEntity.id],
            AgentPromos: updatedEntity.AgentPromos,
          };
          if (state.currentUserData && "AgentPromos" in state.currentUserData) {
            state.currentUserData.AgentPromos = updatedEntity.AgentPromos;
          }
        } else if ("GlobalPromos" in updatedEntity) {
          // Admin case
          if (
            state.currentUserData &&
            "GlobalPromos" in state.currentUserData
          ) {
            state.currentUserData.GlobalPromos = updatedEntity.GlobalPromos;
          }
          // Update agents' promos
          Object.keys(updatedEntity.GlobalPromos).forEach((agentId) => {
            if (state.agents[agentId]) {
              state.agents[agentId] = {
                ...state.agents[agentId],
                AgentPromos: updatedEntity.GlobalPromos[agentId].Promos,
              };
              state.agentDetails[agentId] = {
                ...state.agentDetails[agentId],
                AgentPromos: updatedEntity.GlobalPromos[agentId].Promos,
              };
            }
          });
        }
      });
  },
});

export const { clearSelection, selectClient, selectAgent } = dataSlice.actions;

export default dataSlice.reducer;
