//src/features/data/dataSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  GlobalPromos,
  GlobalVisits,
  Promo,
  Visit,
} from "../../models/dataModels";
import { Agent, Client } from "../../models/entityModels";
import { DataSliceState } from "../../models/stateModels";
import { dataApi } from "./dataQueries";
import { updateApi } from "./promosVisitsQueries";

const initialState: DataSliceState = {
  clients: {},
  agents: {},
  currentUserData: null,
  currentUserDetails: null,
  currentUserPromos: null,
  currentUserVisits: null,
  selectedClientId: null,
  selectedAgentId: null,
  status: "idle",
  error: null,
};

export const fetchInitialData = createAsyncThunk(
  "data/fetchInitialData",
  async (_, { getState, dispatch }) => {
    const state = getState() as {
      auth: { role: string; id: string; userId: string };
    };
    const { role, id, userId } = state.auth;

    let userData;
    /* let agentData = null; */
    if (role === "client") {
      userData = await dispatch(
        dataApi.endpoints.getUserClientData.initiate({ entityCode: id, userId })
      ).unwrap();
    } else if (role === "agent") {
      userData = await dispatch(
        dataApi.endpoints.getUserAgentData.initiate({ entityCode: id, userId })
      ).unwrap();
    } else if (role === "admin") {
      // Fetch clients, agents, and agent details using the CRA API endpoints

      /* agentData = await dispatch(
        superApi.endpoints.getAgentDetails.initiate()
      ).unwrap(); */
      userData = await dispatch(
        dataApi.endpoints.getUserAdminData.initiate({ entityCode: id, userId })
      ).unwrap();
    } else {
      throw new Error("Invalid user role");
    }
    return { role, userData, userId /* agentData */ };
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
        const { role, userData, userId /* , agentData */ } = action.payload;

        if (role === "client" && "clientData" in userData) {
          const { clientData, visits, promos } = userData;
          state.clients[clientData.id] = clientData;
          state.currentUserData = clientData;
          state.currentUserDetails = {
            id: clientData.id,
            role: "client",
            name: clientData.name,
            userId: userId,
          };
          state.currentUserPromos = promos;
          state.currentUserVisits = visits;
        } else if (role === "agent" && "agentData" in userData) {
          // Handle agent data
          const { agentData, visits, promos } = userData;

          // Populate agent and assign its clients
          state.agents[agentData.id] = agentData;
          agentData.clients.forEach((client: Client) => {
            state.clients[client.id] = client;
          });

          // Explicitly associate clients, visits, and promos with the agent
          const agentClients = agentData.clients.map(
            (client) => state.clients[client.id]
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
            userId: userId,
          };
          state.currentUserPromos = promos;
          state.currentUserVisits = visits;
        } else if (role === "admin" && "adminData" in userData) {
          // Handle admin data
          const { adminData, globalVisits, globalPromos } = userData;

          // Populate the clients in the state
          adminData.clients.forEach((client: Client) => {
            state.clients[client.id] = client;
          });

          /* if (agentData) {
            agentData.forEach((agent: Agent) => {
              state.agents[agent.id] = agent;
            });
          } */

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
            userId: userId,
          };
          state.currentUserPromos = globalPromos;
          state.currentUserVisits = globalVisits;
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

        // Enhanced error logging
        console.error("fetchInitialData rejected:", {
          errorMessage: action.error.message,
          errorStack: action.error.stack,
          actionError: action.error, // Entire error object
          actionPayload: action.meta.arg, // Payload that was passed to the action
        });

        if (action.error && action.error.message) {
          state.error = action.error.message;
        } else {
          state.error = "An unknown error occurred during data fetching.";
        }
      })
      .addCase(updateVisits.fulfilled, (state, action) => {
        const updatedVisits = action.payload;

        if (
          state.currentUserDetails?.role === "client" ||
          state.currentUserDetails?.role === "agent"
        ) {
          state.currentUserVisits = updatedVisits as Visit[];
        } else if (state.currentUserDetails?.role === "admin") {
          state.currentUserVisits = updatedVisits as GlobalVisits;
        }
      })
      .addCase(updatePromos.fulfilled, (state, action) => {
        const updatedPromos = action.payload;

        if (
          state.currentUserDetails?.role === "client" ||
          state.currentUserDetails?.role === "agent"
        ) {
          state.currentUserPromos = updatedPromos as Promo[];
        } else if (state.currentUserDetails?.role === "admin") {
          state.currentUserPromos = updatedPromos as GlobalPromos;
        }
      });
  },
});

export const {
  clearSelection,
  selectClient,
  selectAgent,
} = dataSlice.actions;

export default dataSlice.reducer;
