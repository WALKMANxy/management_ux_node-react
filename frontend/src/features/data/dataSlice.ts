import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Admin, Agent, Client } from "../../models/entityModels";
import { superApi } from "../../services/api/centralizedApi";

interface DataState {
  clients: Record<string, Client>;
  agents: Record<string, Agent>;
  agentDetails: Record<string, Agent>;
  currentUserDetails: Client | Agent | Admin | null;
  selectedClientId: string | null;
  selectedAgentId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: DataState = {
  clients: {},
  agents: {},
  agentDetails: {},
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

    // Fetch clients, agents, and agent details only if not already in the cache
    const clientsPromise = dispatch(
      superApi.endpoints.getClients.initiate());
    const agentsPromise = dispatch(
      superApi.endpoints.getAgents.initiate());
    const agentDetailsPromise = dispatch(
      superApi.endpoints.getAgentDetails.initiate()
    );

    await Promise.all([clientsPromise, agentsPromise, agentDetailsPromise]);

    if (userRole === "client") {
      await dispatch(superApi.endpoints.getClientById.initiate(id));
    } else if (userRole === "agent") {
      await dispatch(superApi.endpoints.getAgentDetailsById.initiate(id));
    } else if (userRole === "admin") {
      await dispatch(superApi.endpoints.getAdminById.initiate(id));
    }
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
      .addCase(fetchInitialData.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(fetchInitialData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "An error occurred";
      })
      .addMatcher(
        superApi.endpoints.getClients.matchFulfilled,
        (state, action: PayloadAction<Client[]>) => {
          action.payload.forEach((client) => {
            state.clients[client.id] = client;
          });
        }
      )
      .addMatcher(
        superApi.endpoints.getAgents.matchFulfilled,
        (state, action: PayloadAction<Agent[]>) => {
          action.payload.forEach((agent) => {
            state.agents[agent.id] = agent;
          });
        }
      )
      .addMatcher(
        superApi.endpoints.getAgentDetails.matchFulfilled,
        (state, action: PayloadAction<Agent[]>) => {
          action.payload.forEach((agent) => {
            state.agentDetails[agent.id] = agent;
          });
        }
      )
      .addMatcher(
        superApi.endpoints.getClientById.matchFulfilled,
        (state, action: PayloadAction<Client>) => {
          state.currentUserDetails = action.payload;
          state.clients[action.payload.id] = action.payload;
        }
      )
      .addMatcher(
        superApi.endpoints.getAgentDetailsById.matchFulfilled,
        (state, action: PayloadAction<Agent>) => {
          const agentData = action.payload;
          const agentClients = Object.values(state.clients).filter(
            (client) => client.agent === agentData.id
          );
          const updatedAgent = {
            ...agentData,
            clients: agentClients,
            AgentVisits: agentClients.flatMap((client) => client.visits || []),
            AgentPromos: agentClients.flatMap((client) => client.promos || []),
          };
          state.currentUserDetails = updatedAgent;
          state.agents[agentData.id] = updatedAgent;
          state.agentDetails[agentData.id] = updatedAgent;
        }
      )
      .addMatcher(
        superApi.endpoints.getAdminById.matchFulfilled,
        (state, action: PayloadAction<Admin>) => {
          const adminData = action.payload;
          const adminDetails: Admin = {
            ...adminData,
            agents: Object.values(state.agentDetails),
            clients: Object.values(state.clients),
            GlobalVisits: {},
            GlobalPromos: {},
            adminAlerts: [],
          };

          Object.values(state.agentDetails).forEach((agent) => {
            adminDetails.GlobalVisits[agent.id] = {
              Visits: agent.AgentVisits || [],
            };
            adminDetails.GlobalPromos[agent.id] = {
              Promos: agent.AgentPromos || [],
            };
          });

          state.currentUserDetails = adminDetails;
        }
      );
  },
});

export const { clearSelection, selectClient, selectAgent } = dataSlice.actions;
export default dataSlice.reducer;
