import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Alert, GlobalPromos, GlobalVisits, Promo, Visit } from "../../models/dataModels";
import { Agent, Client } from "../../models/entityModels";
import { DataSliceState } from "../../models/stateModels";
import { updateApi } from "../../services/promosVisitsQueries";
import { dataApi } from "../../services/dataQueries";

const initialState: DataSliceState = {
  clients: {},
  agents: {},
  agentDetails: {},
  currentUserData: null,
  currentUserDetails: null,
  currentUserPromos: null,
  currentUserAlerts: null,
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
      auth: { userRole: string; id: string; userId: string };
    };
    const { userRole, id, userId } = state.auth;

    let userData;
    if (userRole === "client") {
      userData = await dispatch(
        dataApi.endpoints.getUserClientData.initiate({ entityCode: id, userId })
      ).unwrap();
    } else if (userRole === "agent") {
      userData = await dispatch(
        dataApi.endpoints.getUserAgentData.initiate({ entityCode: id, userId })
      ).unwrap();
    } else if (userRole === "admin") {
      userData = await dispatch(
        dataApi.endpoints.getUserAdminData.initiate({ entityCode: id, userId })
      ).unwrap();
    } else {
      throw new Error("Invalid user role");
    }

    return { userRole, userData, userId };
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
    addAlert: (state, action: PayloadAction<Alert>) => {
      const alert = action.payload;
      if (state.currentUserAlerts) {
        state.currentUserAlerts.push(alert);
      }
    },
    updateAlert: (state, action: PayloadAction<Alert>) => {
      const alert = action.payload;
      if (state.currentUserAlerts) {
        const index = state.currentUserAlerts.findIndex(
          (a) => a._id === alert._id
        );
        if (index !== -1) {
          state.currentUserAlerts[index] = alert;
        }
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
        const { userRole, userData, userId } = action.payload;

        if (userRole === "client" && "clientData" in userData) {
          const { clientData, visits, promos, alerts } = userData;
          state.clients[clientData.id] = clientData;
          state.currentUserData = clientData;
          state.currentUserDetails = {
            id: clientData.id,
            role: "client",
            name: clientData.name,
            userId: userId,
          };
          state.currentUserPromos = promos;
          state.currentUserAlerts = alerts;
          state.currentUserVisits = visits;
        } else if (userRole === "agent" && "agentData" in userData) {
          const { agentData, visits, promos, alerts } = userData;
          state.agents[agentData.id] = agentData;
          state.agentDetails[agentData.id] = agentData;
          agentData.clients.forEach((client: Client) => {
            state.clients[client.id] = client;
          });
          state.currentUserData = agentData;
          state.currentUserDetails = {
            id: agentData.id,
            role: "agent",
            name: agentData.name,
            userId: userId,
          };
          state.currentUserPromos = promos;
          state.currentUserAlerts = alerts;
          state.currentUserVisits = visits;
        } else if (userRole === "admin" && "adminData" in userData) {
          const { adminData, globalVisits, globalPromos, alerts } = userData;
          adminData.clients.forEach((client: Client) => {
            state.clients[client.id] = client;
          });
          adminData.agents.forEach((agent: Agent) => {
            state.agents[agent.id] = agent;
            state.agentDetails[agent.id] = agent;
          });
          state.currentUserData = adminData;
          state.currentUserDetails = {
            id: adminData.id,
            role: "admin",
            name: adminData.name,
            userId: userId,
          };
          state.currentUserPromos = globalPromos;
          state.currentUserAlerts = alerts;
          state.currentUserVisits = globalVisits;
        } else {
          // Handle unexpected data structure
          console.error(
            "Unexpected user role or data structure:",
            userRole,
            userData
          );
          state.status = "failed";
          state.error = "Unexpected user role or data structure";
        }
      })
      .addCase(fetchInitialData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "An error occurred";
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
  addAlert,
  updateAlert,
} = dataSlice.actions;

export default dataSlice.reducer;
