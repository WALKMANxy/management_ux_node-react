import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { SearchState } from "../../models/stateModels";
import { SearchParams, SearchResult } from "../../models/searchModels";
import {Client } from "../../models/entityModels";

const initialState: SearchState = {
  query: "",
  results: [],
  status: "idle",
  error: null,
};

export const searchItems = createAsyncThunk<
  SearchResult[],
  SearchParams,
  { state: RootState }
>(
  "search/searchItems",
  async ({ query, filter }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { id: entityCode, userRole: entityRole } = state.auth;
      const { clients, agentDetails } = state.data;

      const sanitizedQuery = query.toLowerCase();
      const seen = new Map<string, string>(); // Track seen IDs
      let searchResults: SearchResult[] = [];

      // Filter clients based on user role
      let filteredClients: Client[] = [];
      if (entityRole === "admin") {
        filteredClients = Object.values(clients);
      } else if (entityRole === "agent") {
        filteredClients = Object.values(clients).filter(
          (client) => client.agent === entityCode
        );
      } else if (entityRole === "client") {
        filteredClients = entityCode ? [clients[entityCode]] : [];
      }

      // Filter and map clients
      if (
        filter === "all" ||
        filter === "client" ||
        (filter === "admin" && entityRole === "admin")
      ) {
        const clientResults = filteredClients
          .filter(
            (client) =>
              client.name?.toLowerCase().includes(sanitizedQuery) ||
              client.id?.toLowerCase().includes(sanitizedQuery)
          )
          .map((client) => ({
            id: client.id,
            name: client.name,
            type: "client",
            province: client.province,
            phone: client.phone,
            paymentMethod: client.paymentMethod,
          }))
          .filter((result) => !seen.has(result.id) && seen.set(result.id, ""));

        searchResults = searchResults.concat(clientResults);
      }

      // Filter and map agents
      if (
        filter === "all" ||
        filter === "agent" ||
        (filter === "admin" && entityRole === "admin")
      ) {
        const agentResults = Object.values(agentDetails)
          .filter(
            (agent) =>
              agent.name?.toLowerCase().includes(sanitizedQuery) ||
              agent.id?.toLowerCase().includes(sanitizedQuery)
          )
          .map((agent) => ({
            id: agent.id,
            name: agent.name,
            type: "agent",
          }))
          .filter((result) => !seen.has(result.id) && seen.set(result.id, ""));

        searchResults = searchResults.concat(agentResults);
      }

      // Filter and map articles
      if (filter === "all" || filter === "article") {
        const articleResults = filteredClients
          .flatMap((client) =>
            client.movements.flatMap((movement) =>
              movement.details
                .filter(
                  (detail) =>
                    detail.name?.toLowerCase().includes(sanitizedQuery) ||
                    detail.articleId?.toLowerCase().includes(sanitizedQuery) ||
                    detail.brand?.toLowerCase().includes(sanitizedQuery)
                )
                .map((detail) => ({
                  id: detail.articleId,
                  name: detail.name,
                  type: "article",
                  brand: detail.brand,
                  articleId: detail.articleId,
                  lastSoldDate: movement.dateOfOrder,
                }))
            )
          )
          .filter(
            (result) =>
              !seen.has(result.id) && seen.set(result.id, result.lastSoldDate)
          );

        searchResults = searchResults.concat(articleResults);
      }

      // Filter and map promos
      if (filter === "all" || filter === "promo") {
        const promoResults = filteredClients
          .flatMap((client) => client.promos)
          .filter(
            (promo) =>
              promo.name && promo.name.toLowerCase().includes(sanitizedQuery)
          )
          .map((promo) => ({
            id: promo.id,
            name: promo.name,
            promoType: promo.promoType,
            type: "Promo",
            startDate: new Date(promo.startDate),
            endDate: new Date(promo.endDate),
            issuedBy: promo.promoIssuedBy,
          }))
          .filter((result) => !seen.has(result.id) && seen.set(result.id, ""));

        searchResults = searchResults.concat(promoResults);
      }

      // Filter and map visits
      if (filter === "all" || filter === "visit") {
        const visitResults = filteredClients
          .flatMap((client) => client.visits)
          .filter(
            (visit) =>
              visit.reason.toLowerCase().includes(sanitizedQuery) ||
              visit.notePublic?.toLowerCase().includes(sanitizedQuery) ||
              visit.date.toISOString().slice(0, 10).includes(sanitizedQuery)
          )
          .map((visit) => ({
            id: visit.id,
            name: visit.reason,
            type: "visit",
            date: visit.date,
            pending: visit.pending,
            completed: visit.completed,
            issuedBy: visit.visitIssuedBy,
          }))
          .filter((result) => !seen.has(result.id) && seen.set(result.id, ""));

        searchResults = searchResults.concat(visitResults);
      }

      return searchResults;
    } catch (error: any) {
      console.error("Error searching items:", error);
      return rejectWithValue(error.message || "An unknown error occurred.");
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery(state, action) {
      state.query = action.payload;
    },
    clearResults(state) {
      state.results = [];
      state.query = "";
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(searchItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.results = action.payload;
      })
      .addCase(searchItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { setQuery, clearResults } = searchSlice.actions;

export default searchSlice.reducer;