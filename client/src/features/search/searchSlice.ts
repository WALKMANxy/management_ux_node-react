//src/features/search/searchSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import {
  GlobalPromos,
  GlobalVisits,
  Promo,
  Visit,
} from "../../models/dataModels";
import { Agent, Client } from "../../models/entityModels";
import { SearchParams, SearchResult } from "../../models/searchModels";
import { SearchState, ThunkError } from "../../models/stateModels";

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

      // Access data from the state correctly
      const entityRole = state.data.currentUserDetails?.role;
      const clients: Client[] = Object.values(state.data.clients);
      const agentDetails: Agent[] = Object.values(state.data.agents);
      const promos = state.data.currentUserPromos;
      const visits = state.data.currentUserVisits;

      const sanitizedQuery = query.toLowerCase();
      const seen = new Map<string, string>(); // Track seen IDs
      let searchResults: SearchResult[] = [];

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
            type: "client" as SearchResult["type"],
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
        const agentResults = agentDetails
          .filter(
            (agent) =>
              agent.name?.toLowerCase().includes(sanitizedQuery) ||
              agent.id?.toLowerCase().includes(sanitizedQuery)
          )
          .map((agent) => ({
            id: agent.id,
            name: agent.name,
            type: "agent" as SearchResult["type"],
          }))
          .filter((result) => !seen.has(result.id) && seen.set(result.id, ""));

        searchResults = searchResults.concat(agentResults);
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
                  type: "article" as SearchResult["type"],
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

      // Filter and map promos for admins using GlobalPromos
      if (
        (filter === "all" || filter === "promo") &&
        entityRole === "admin" &&
        promos
      ) {
        if ("globalPromos" in promos) {
          const globalPromoResults = Object.entries(promos as GlobalPromos)
            .flatMap(([agentId, { Promos }]) =>
              Promos.filter((promo) =>
                promo.name?.toLowerCase().includes(sanitizedQuery)
              )
                .map((promo) => ({
                  id: promo._id || "",
                  name: promo.name,
                  promoType: promo.promoType,
                  type: "promo" as SearchResult["type"],
                  startDate: new Date(promo.startDate),
                  endDate: new Date(promo.endDate),
                  issuedBy: promo.promoIssuedBy,
                  agentId, // Include the agentId if needed
                }))
                .filter((promo) => promo.id !== undefined && promo.id !== "")
            )
            .filter(
              (result) => !seen.has(result.id!) && seen.set(result.id!, "")
            );

          searchResults = searchResults.concat(globalPromoResults);
        }
      } else if (filter === "all" || filter === "promo") {
        // Regular promo handling for non-admin roles
        const promoResults = Array.isArray(promos)
          ? (promos as Promo[]) // Explicitly assert the type as an array of Promo
              .filter(
                (promo) =>
                  promo.name &&
                  promo.name.toLowerCase().includes(sanitizedQuery)
              )
              .map((promo) => ({
                id: promo._id || "",
                name: promo.name,
                promoType: promo.promoType,
                type: "promo" as SearchResult["type"],
                startDate: new Date(promo.startDate),
                endDate: new Date(promo.endDate),
                issuedBy: promo.promoIssuedBy,
              }))
              .filter((promo) => promo.id !== undefined && promo.id !== "")
          : [];
        searchResults = searchResults.concat(promoResults);
      }

      // Filter and map visits for admins using GlobalVisits
      if (
        (filter === "all" || filter === "visit") &&
        entityRole === "admin" &&
        visits
      ) {
        if ("globalVisits" in visits) {
          const globalVisitResults = Object.entries(visits as GlobalVisits)
            .flatMap(([agentId, { Visits }]) =>
              Visits.filter(
                (visit) =>
                  visit.visitReason?.toLowerCase().includes(sanitizedQuery) ||
                  visit.notePublic?.toLowerCase().includes(sanitizedQuery)
              ).map((visit) => ({
                id: visit._id ?? "", // Use the nullish coalescing operator to default to an empty string if _id is null or undefined
                name: visit.visitReason,
                type: "visit" as SearchResult["type"],
                date: visit.date,
                pending: visit.pending,
                completed: visit.completed,
                issuedBy: visit.visitIssuedBy,
                agentId, // Include the agentId if needed
              }))
            )
            .filter(
              (result) => !seen.has(result.id) && seen.set(result.id, "")
            );

          searchResults = searchResults.concat(globalVisitResults);
        }
      } else if (filter === "all" || filter === "visit") {
        // Regular visit handling for non-admin roles
        const visitResults = Array.isArray(visits)
          ? (visits as Visit[]) // Explicitly assert the type as an array of Visit
              .filter(
                (visit) =>
                  visit.visitReason.toLowerCase().includes(sanitizedQuery) ||
                  visit.notePublic?.toLowerCase().includes(sanitizedQuery) ||
                  visit.date.toISOString().slice(0, 10).includes(sanitizedQuery)
              )
              .map((visit) => ({
                id: visit._id ?? "", // Use the nullish coalescing operator to default to an empty string if _id is null or undefined
                name: visit.visitReason,
                type: "visit" as SearchResult["type"],
                date: visit.date,
                pending: visit.pending,
                completed: visit.completed,
                issuedBy: visit.visitIssuedBy,
              }))
          : [];
        searchResults = searchResults.concat(visitResults);
      }

      return searchResults;
    } catch (error: unknown) {
      // Narrow the unknown error to the expected error type
      const typedError = error as ThunkError;

      // Enhanced error logging with fallback handling
      console.error("Error searching items:", typedError);

      // Reject with a specific error message or fallback
      return rejectWithValue(
        typedError.message || "An unknown error occurred."
      );
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
