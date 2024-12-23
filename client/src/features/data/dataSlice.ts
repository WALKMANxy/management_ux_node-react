// src/features/data/dataSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { RootState } from "../../app/store";
import { GlobalVisits, Promo, Visit } from "../../models/dataModels";
import { Agent, Client } from "../../models/entityModels";
import { DataSliceState } from "../../models/stateModels";
import { fetchInitialData } from "./dataThunks";
import { createAgentAsync, updateAgentAsync, deleteAgentAsync } from "./entityThunks";

const initialState: DataSliceState = {
  clients: {},
  agents: {},
  currentUserData: null,
  currentUserDetails: null,
  currentUserPromos: null,
  currentUserVisits: null,
  selectedClientId: null,
  selectedAgentId: null,
  selectedVisitId: null,
  selectedPromoId: null,
  status: "idle",
  error: null,
};

export const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    clearSelection: (state) => {
      state.selectedClientId = null;
      state.selectedAgentId = null;
    },
    selectClient(state, action: PayloadAction<string>) {
      state.selectedClientId = action.payload;
      state.selectedVisitId = null;
    },
    selectAgent(state, action: PayloadAction<string>) {
      state.selectedAgentId = action.payload;
      state.selectedClientId = null;
      state.selectedVisitId = null;
    },
    selectVisit(state, action: PayloadAction<string>) {
      state.selectedVisitId = action.payload;
    },
    clearSelectedClient(state) {
      state.selectedClientId = null;
    },
    clearSelectedAgent(state) {
      state.selectedAgentId = null;
    },
    clearSelectedVisit(state) {
      state.selectedVisitId = null;
    },
    selectPromo(state, action: PayloadAction<string>) {
      state.selectedPromoId = action.payload;
    },
    clearSelectedPromo(state) {
      state.selectedPromoId = null;
    },
    setCurrentUserVisits(state, action: PayloadAction<Visit[] | GlobalVisits>) {
      state.currentUserVisits = action.payload;
    },
    setCurrentUserPromos(state, action: PayloadAction<Promo[]>) {
      state.currentUserPromos = action.payload;
    },
    addOrUpdateVisit(state, action: PayloadAction<Visit>) {
      const newVisit = action.payload;
      const role = state.currentUserDetails?.role;

      if (role === "client" || role === "agent") {
        if (Array.isArray(state.currentUserVisits)) {
          const index = state.currentUserVisits.findIndex(
            (visit) => visit._id === newVisit._id
          );
          if (index !== -1) {
            state.currentUserVisits[index] = newVisit;
          } else {
            state.currentUserVisits.push(newVisit);
          }
        }
      } else if (role === "admin") {
        // Handle admin case
        if (
          typeof state.currentUserVisits !== "object" ||
          Array.isArray(state.currentUserVisits) ||
          state.currentUserVisits === null
        ) {
          state.currentUserVisits = {} as GlobalVisits;
        }

        // Find the agent associated with the client
        const agent = Object.values(state.agents).find((agent) =>
          agent.clients.some((client) => client.id === newVisit.clientId)
        );

        if (agent) {
          if (!state.currentUserVisits[agent.id]) {
            state.currentUserVisits[agent.id] = { Visits: [] };
          }
          const agentVisits = state.currentUserVisits[agent.id].Visits;
          const index = agentVisits.findIndex(
            (visit) => visit._id === newVisit._id
          );
          if (index !== -1) {
            agentVisits[index] = newVisit;
          } else {
            agentVisits.push(newVisit);
          }
        }
      }
    },
    addOrUpdatePromo(state, action: PayloadAction<Promo>) {
      const newPromo = action.payload;
      const role = state.currentUserDetails?.role;

      if (role === "admin") {
        if (!Array.isArray(state.currentUserPromos)) {
          state.currentUserPromos = [];
        }

        const index = state.currentUserPromos.findIndex(
          (promo: Promo) => promo._id === newPromo._id
        );

        if (index !== -1) {
          state.currentUserPromos[index] = newPromo;
        } else {
          state.currentUserPromos.push(newPromo);
        }
      } else {
        throw new Error("Only admins can add or update promos");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { role, userData, userId } = action.payload;

        if (role === "client" && "clientData" in userData!) {
          const { clientData } = userData;

          state.clients[clientData.id] = clientData;
          state.currentUserData = clientData;
          state.currentUserDetails = {
            id: clientData.id,
            role: "client",
            name: clientData.name,
            userId: userId!,
          };
          // Check if agentData exists within clientData and store it
          if (clientData.agentData) {
            clientData.agentData.forEach((agent: Agent) => {
              state.agents[agent.id] = agent;
            });
          }
        } else if (role === "agent" && "agentData" in userData!) {
          // Handle agent data
          const { agentData  } = userData;

          // Populate agent and assign its clients
          state.agents[agentData.id] = agentData;
          agentData.clients.forEach((client: Client) => {
            state.clients[client.id] = client;
          });

          // Explicitly associate clients, visits, and promos with the agent
          const agentClients = agentData.clients.map(
            (client: Client) => state.clients[client.id]
          );
          state.agents[agentData.id] = {
            ...agentData,
            clients: agentClients,
          };

          // Populate current user data for the agent
          state.currentUserData = agentData;
          state.currentUserDetails = {
            id: agentData.id,
            role: "agent",
            name: agentData.name,
            userId: userId!,
          };
        } else if (role === "admin" && "adminData" in userData!) {
          // Handle admin data
          const { adminData } = userData;

          // Populate the clients in the state
          adminData.clients.forEach((client: Client) => {
            state.clients[client.id] = client;
          });

          // Populate the agents in the state
          adminData.agents.forEach((agent: Agent) => {
            state.agents[agent.id] = agent;
          });

          // Populate current user data for the admin
          state.currentUserData = adminData;
          state.currentUserDetails = {
            id: adminData.id,
            role: "admin",
            name: adminData.name,
            userId: userId!,
          };
        } else if (role === "employee") {
          // Handle employee role

          /* state.currentUserDetails = {
            id: userId!,
            role: "employee",
            name: "Employee Name",
            userId: userId!,
          }; */
          state.currentUserDetails = null;
          state.currentUserData = null;

          // TODO: Handle employee data

        } else {
          // Handle unexpected data structure
          console.error(
            "Unexpected user role or data structure:",
            role,
            userData
          );
          state.status = "failed";
          state.error = "Unexpected user role or data structure";
        }
      })
      .addCase(fetchInitialData.rejected, (state, action) => {
        state.status = "failed";

        console.error("fetchInitialData rejected:", {
          errorMessage: action.error.message,
          errorStack: action.error.stack,
          actionError: action.error,
          actionPayload: action.meta.arg,
        });

        if (action.error && action.error.message) {
          state.error = action.error.message;
        } else {
          state.error = "An unknown error occurred during data fetching.";
        }
      })

      // Agent Thunks Cases

      // Create Agent
      .addCase(createAgentAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createAgentAsync.fulfilled, (state, action: PayloadAction<Agent>) => {
        state.status = "succeeded";
        const newAgent = action.payload;
        state.agents[newAgent.id] = newAgent;
      })
      .addCase(createAgentAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to create agent.";
      })

      // Update Agent
      .addCase(updateAgentAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateAgentAsync.fulfilled, (state, action: PayloadAction<Agent>) => {
        state.status = "succeeded";
        const updatedAgent = action.payload;
        if (state.agents[updatedAgent.id]) {
          state.agents[updatedAgent.id] = updatedAgent;
        }
      })
      .addCase(updateAgentAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update agent.";
      })

      // Delete Agent
      .addCase(deleteAgentAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteAgentAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = "succeeded";
        const deletedAgentId = action.payload;
        delete state.agents[deletedAgentId];
      })
      .addCase(deleteAgentAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to delete agent.";
      });
  },
});

export const {
  clearSelection,
  selectClient,
  selectAgent,
  selectPromo,
  selectVisit,
  clearSelectedClient,
  clearSelectedAgent,
  clearSelectedPromo,
  clearSelectedVisit,
  setCurrentUserVisits,
  setCurrentUserPromos,
  addOrUpdatePromo,
  addOrUpdateVisit,
} = dataSlice.actions;

export default dataSlice.reducer;

// Memoized selector to get all client IDs from the state
export const selectClientIds = createSelector(
  (state: RootState) => state.data.clients,
  (clients) => Object.keys(clients)
);

// Memoized selector to get all agent IDs from the state
export const selectAgentIds = createSelector(
  (state: RootState) => state.data.agents,
  (agents) => Object.keys(agents)
);
