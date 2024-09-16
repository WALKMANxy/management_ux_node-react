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
import { createSelector } from "reselect";
import { RootState } from "../../app/store";


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

// Thunk to create a new visit
export const createVisitAsync = createAsyncThunk(
  "data/createVisit",
  async (
    visitData: {
      clientId: string;
      type: string;
      visitReason: string;
      date: string;
      notePublic?: string;
      notePrivate?: string;
      visitIssuedBy: string;
      pending: boolean;
      completed: boolean;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Dispatch the mutation and unwrap the response
      const response = await dispatch(
        updateApi.endpoints.createVisit.initiate(visitData)
      ).unwrap();
      return response;
    } catch (err: unknown) {
      // Safely handle and type the error
      if (err instanceof Error && 'data' in err) {
        // Handle errors with a 'data' property (like RTK Query errors)
        return rejectWithValue((err as { data: string }).data);
      } else if (err instanceof Error) {
        // Generic error handling
        return rejectWithValue(err.message);
      } else {
        // Fallback in case the error is of an unknown structure
        return rejectWithValue("Failed to create visit.");
      }
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
    selectClient(state, action: PayloadAction<string>) {
      state.selectedClientId = action.payload;
      state.selectedVisitId = null; // Reset selected visit when client changes
    },
    selectAgent(state, action: PayloadAction<string>) {
      state.selectedAgentId = action.payload;
      state.selectedClientId = null; // Reset selected client when agent changes
      state.selectedVisitId = null; // Reset selected visit
    },
    selectVisit(state, action: PayloadAction<string>) {
      state.selectedVisitId = action.payload;
    },
    selectPromo(state, action: PayloadAction<string>) {
      state.selectedPromoId = action.payload;
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
      })
      .addCase(createVisitAsync.fulfilled, (state, action: PayloadAction<Visit>) => {
        const newVisit = action.payload;

        // Determine how to add the new visit based on user role
        const role = state.currentUserDetails?.role;

        if (role === "client" || role === "agent") {
          // For clients and agents, currentUserVisits is an array
          if (Array.isArray(state.currentUserVisits)) {
            state.currentUserVisits.push(newVisit);
          }
        } else if (role === "admin") {
          // For admin, currentUserVisits is GlobalVisits
          if (typeof state.currentUserVisits !== "object" || Array.isArray(state.currentUserVisits)) {
            // Initialize currentUserVisits as GlobalVisits if it's not already
            state.currentUserVisits = {} as GlobalVisits;
          }

          // Find the agent associated with the client
          const agent = Object.values(state.agents).find((agent) =>
            agent.clients.some((client) => client.id === newVisit.clientId)
          );

          if (agent) {
            // Ensure the agent exists in currentUserVisits
            const agentVisits = state.currentUserVisits as GlobalVisits;
            if (!agentVisits[agent.id]) {
              agentVisits[agent.id] = { Visits: [] };
            }
            agentVisits[agent.id].Visits.push(newVisit);
          }
        }
      })
      .addCase(createVisitAsync.rejected, (state, action) => {
        // Optionally handle errors globally
        // You can set a global error state or manage it locally in the component
        console.error("Create visit failed:", action.payload);
      });
  },
});

export const {
  clearSelection,
  selectClient,
  selectAgent,
  selectPromo,
  selectVisit,
} = dataSlice.actions;

export default dataSlice.reducer;

// Memoized selector to get all client IDs from the state
export const selectClientIds = createSelector(
  (state: RootState) => state.data.clients,
  (clients) => Object.keys(clients)
);
