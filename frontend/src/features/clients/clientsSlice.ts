import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Client, ClientsState } from "../../models/models";
import { api } from "../../services/api"; // Import the API slice

const initialState: ClientsState = {
  clients: [],
  status: "idle",
  error: null,
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        api.endpoints.getClients.matchPending,
        (state) => {
          state.status = "loading";
        }
      )
      .addMatcher(
        api.endpoints.getClients.matchFulfilled,
        (state, action: PayloadAction<Client[]>) => {
          state.status = "succeeded";
          state.clients = action.payload;
        }
      )
      .addMatcher(
        api.endpoints.getClients.matchRejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.error?.message || "Something went wrong";
        }
      );
  },
});

export const selectAllClients = (state: { clients: ClientsState }) =>
  state.clients.clients;

export default clientsSlice.reducer;
