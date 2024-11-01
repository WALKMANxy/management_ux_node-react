// src/features/search/searchSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import { RootState } from "../../app/store";
import { Promo } from "../../models/dataModels";
import { Agent, Client } from "../../models/entityModels";
import { SearchParams, SearchResult } from "../../models/searchModels";
import { SearchState, ThunkError } from "../../models/stateModels";
import {
  selectVisits,
  VisitWithAgent,
} from "../promoVisits/promoVisitsSelectors";

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
  async ({ query, filter, exact = false }, { getState, rejectWithValue }) => {
    try {
      const state = getState();

      // Access data from the state
      const entityRole = state.data.currentUserDetails?.role;
      const clients: Client[] = Object.values(state.data.clients);
      const agentDetails: Agent[] = Object.values(state.data.agents);
      const promos = state.data.currentUserPromos;
      const visits = selectVisits(state);

      const sanitizedQuery = query.toLowerCase();

      const seen = new Map<string, string>(); // Track seen IDs
      let searchResults: SearchResult[] = [];

      // ====== Clients ======
      if (
        filter === "all" ||
        filter === "client" ||
        (filter === "admin" && entityRole === "admin")
      ) {
        const clientResults = clients
          .filter(
            (client) =>
              (client.name &&
                (exact
                  ? client.name.toLowerCase() === sanitizedQuery
                  : client.name.toLowerCase().includes(sanitizedQuery))) ||
              (client.id &&
                (exact
                  ? client.id.toLowerCase() === sanitizedQuery
                  : client.id.toLowerCase().includes(sanitizedQuery)))
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

      // ====== Agents ======
      if (
        filter === "all" ||
        filter === "agent" ||
        (filter === "admin" && entityRole === "admin")
      ) {
        const agentResults = agentDetails
          .filter(
            (agent) =>
              (agent.name &&
                (exact
                  ? agent.name.toLowerCase() === sanitizedQuery
                  : agent.name.toLowerCase().includes(sanitizedQuery))) ||
              (agent.id &&
                (exact
                  ? agent.id.toLowerCase() === sanitizedQuery
                  : agent.id.toLowerCase().includes(sanitizedQuery)))
          )
          .map((agent) => ({
            id: agent.id,
            name: agent.name,
            type: "agent" as SearchResult["type"],
          }))
          .filter((result) => !seen.has(result.id) && seen.set(result.id, ""));

        searchResults = searchResults.concat(agentResults);
      }

      // ====== Articles ======
      if (filter === "all" || filter === "article") {
        const articleResults = clients
          .flatMap((client) =>
            client.movements.flatMap((movement) =>
              movement.details
                .filter(
                  (detail) =>
                    (detail.name &&
                      (exact
                        ? detail.name.toLowerCase() === sanitizedQuery
                        : detail.name
                            .toLowerCase()
                            .includes(sanitizedQuery))) ||
                    (detail.articleId &&
                      (exact
                        ? detail.articleId.toLowerCase() === sanitizedQuery
                        : detail.articleId
                            .toLowerCase()
                            .includes(sanitizedQuery))) ||
                    (detail.brand &&
                      (exact
                        ? detail.brand.toLowerCase() === sanitizedQuery
                        : detail.brand.toLowerCase().includes(sanitizedQuery)))
                )
                .map((detail) => ({
                  id: detail.articleId,
                  name: detail.name,
                  type: "article" as SearchResult["type"],
                  brand: detail.brand,
                  lastSoldDate: movement.dateOfOrder,
                }))
            )
          )
          .filter(
            (result) =>
              result.id.trim() !== "" &&
              !seen.has(result.id) &&
              seen.set(result.id, result.lastSoldDate || "")
          );

        searchResults = searchResults.concat(articleResults);
      }

      // ====== Promos ======
      if ((filter === "all" || filter === "promo") && promos) {
        const promoResults = Array.isArray(promos)
          ? (promos as Promo[])
              .filter(
                (promo) =>
                  (promo.name &&
                    (exact
                      ? promo.name.toLowerCase() === sanitizedQuery
                      : promo.name.toLowerCase().includes(sanitizedQuery))) ||
                  (promo.promoType &&
                    (exact
                      ? promo.promoType.toLowerCase() === sanitizedQuery
                      : promo.promoType
                          .toLowerCase()
                          .includes(sanitizedQuery))) ||
                  (promo._id &&
                    (exact
                      ? promo._id.toLowerCase() === sanitizedQuery
                      : promo._id.toLowerCase().includes(sanitizedQuery))) ||
                  (promo.clientsId &&
                    promo.clientsId.some((clientId) =>
                      exact
                        ? clientId.toLowerCase() === sanitizedQuery
                        : clientId.toLowerCase().includes(sanitizedQuery)
                    ))
              )
              .map((promo) => ({
                id: promo._id || "",
                name: promo.name,
                promoType: promo.promoType,
                type: "promo" as SearchResult["type"],
                discount: promo.discount,
                startDate: promo.startDate,
                endDate: promo.endDate,
                promoIssuedBy: promo.promoIssuedBy,
                agentId:
                  entityRole === "admin" ? promo.promoIssuedBy : undefined, // Include agentId if role is admin
                clientsId: promo.clientsId, // Include clientsId if needed for matching
              }))
              .filter((promo) => promo.id.trim() !== "")
          : [];

        // Filter out duplicates using the seen Map
        const uniquePromoResults = promoResults.filter(
          (result) => !seen.has(result.id) && seen.set(result.id, "")
        );

        searchResults = searchResults.concat(uniquePromoResults);
      }

      // ====== Visits ======
      if (filter === "all" || filter === "visit") {
        if (entityRole === "admin") {
          // Admin case
          const visitResults = (visits as VisitWithAgent[])
            .filter(
              (visit) =>
                (visit.visitReason &&
                  (exact
                    ? visit.visitReason.toLowerCase() === sanitizedQuery
                    : visit.visitReason
                        .toLowerCase()
                        .includes(sanitizedQuery))) ||
                (visit.clientId &&
                  (exact
                    ? visit.clientId.toLowerCase() === sanitizedQuery
                    : visit.clientId.toLowerCase().includes(sanitizedQuery))) ||
                (visit.date &&
                  (exact
                    ? dayjs(visit.date).format("YYYY-MM-DD") === sanitizedQuery
                    : dayjs(visit.date)
                        .format("YYYY-MM-DD")
                        .includes(sanitizedQuery)))
            )
            .map((visit) => ({
              id: visit._id ?? "",
              name: visit.clientId,
              reason: visit.visitReason,
              type: "visit" as SearchResult["type"],
              date: visit.date,
              pending: visit.pending,
              completed: visit.completed,
              visitIssuedBy: visit.visitIssuedBy,
              clientId: visit.clientId,
              agentId: visit.agentId,
            }))
            .filter(
              (result) =>
                result.id.trim() !== "" &&
                !seen.has(result.id) &&
                seen.set(result.id, "")
            );

          searchResults = searchResults.concat(visitResults);
        } else {
          // Non-admin case
          const visitResults = (visits as VisitWithAgent[])
            .filter(
              (visit) =>
                (visit.visitReason &&
                  (exact
                    ? visit.visitReason.toLowerCase() === sanitizedQuery
                    : visit.visitReason
                        .toLowerCase()
                        .includes(sanitizedQuery))) ||
                (visit.clientId &&
                  (exact
                    ? visit.clientId.toLowerCase() === sanitizedQuery
                    : visit.clientId.toLowerCase().includes(sanitizedQuery))) ||
                (visit.date &&
                  (exact
                    ? dayjs(visit.date).format("YYYY-MM-DD") === sanitizedQuery
                    : dayjs(visit.date)
                        .format("YYYY-MM-DD")
                        .includes(sanitizedQuery)))
            )
            .map((visit) => ({
              id: visit._id ?? "",
              name: visit.clientId,
              reason: visit.visitReason,
              type: "visit" as SearchResult["type"],
              date: visit.date,
              pending: visit.pending,
              completed: visit.completed,
              issuedBy: visit.visitIssuedBy,
              clientId: visit.clientId,
              agentId: visit.agentId,
            }))
            .filter(
              (visit) =>
                visit.id.trim() !== "" &&
                !seen.has(visit.id) &&
                seen.set(visit.id, "")
            );

          searchResults = searchResults.concat(visitResults);
        }
      }

      // Final filter to ensure all results have valid IDs
      return searchResults.filter((result) => result.id.trim() !== "");
    } catch (error: unknown) {
      // Narrow the unknown error to the expected error type
      const typedError = error as ThunkError;

      console.error("Error searching items:", typedError);

      return rejectWithValue(
        typedError.message || "An unknown error occurred."
      );
    }
  }
);

// Create the search slice
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
