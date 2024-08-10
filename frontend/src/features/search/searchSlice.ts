import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

import { api } from "../../services/api";
import { SearchState } from "../../models/stateModels";
import { SearchParams, SearchResult } from "../../models/searchModels";
import { Agent, Client } from "../../models/entityModels";

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
  async ({ query, filter }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const { id, userRole } = state.auth;

      const entityCode = id;
      const entityRole = userRole;

      const sanitizedQuery = query.toLowerCase();
      const seen = new Map<string, string>(); // Track seen IDs
      let searchResults: SearchResult[] = [];

      // Load data based on user role and search context
      let clients: Client[] = [];
      let agents: Agent[] = [];

      if (entityRole === "admin" && entityCode) {
        const adminData = await dispatch(
          api.endpoints.getAdminData.initiate(entityCode)
        ).unwrap();
        clients = adminData.clients;
        agents = adminData.agents;
        //console.log("Admin Data Loaded: ", { clients, agents });
      } else if (entityRole === "agent") {
        clients = (
          await dispatch(api.endpoints.getClients.initiate()).unwrap()
        ).filter((client) => client.agent === entityCode);
        //console.log("Agent Data Loaded: ", clients);
      } else if (entityRole === "client" && entityCode) {
        // Ensure id is not null
        clients = [
          await dispatch(
            api.endpoints.getClientById.initiate(entityCode)
          ).unwrap(),
        ];
        //console.log("Client Data Loaded: ", clients);
      }

      // Filter and map clients
      if (
        filter === "all" ||
        filter === "client" ||
        (filter === "admin" && entityRole === "admin")
      ) {
        const clientResults = clients
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
        //console.log("Client Search Results: ", clientResults);
      }

      // Filter and map agents
      if (
        filter === "all" ||
        filter === "agent" ||
        (filter === "admin" && entityRole === "admin")
      ) {
        const agentResults = agents
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
        //console.log("Agent Search Results: ", agentResults);
      }

      // Filter and map articles
      if (filter === "all" || filter === "article") {
        const articleResults = clients
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
        //console.log("Article Search Results: ", articleResults);
      }

      // Filter and map promos
      if (filter === "all" || filter === "promo") {
        const promoResults = clients
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
        //console.log("Promo Search Results: ", promoResults);
      }

      // Filter and map visits
      if (filter === "all" || filter === "visit") {
        const visitResults = clients
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
        //console.log("Visit Search Results: ", visitResults);
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
