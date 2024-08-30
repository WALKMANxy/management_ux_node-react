//src/features/search/searchSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import {
  Alert,
  GlobalPromos,
  GlobalVisits,
  MovementDetail,
  Promo,
  Visit,
} from "../../models/dataModels";
import { Agent, Client } from "../../models/entityModels";
import { SearchParams, SearchResult } from "../../models/searchModels";
import { SearchState } from "../../models/stateModels";
import {
  selectAlerts,
  selectPromos,
  selectVisits,
} from "../data/dataSelectors";

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
      const userRole = state.auth.role;
      const userData = state.data.currentUserData;
      const visits = selectVisits(state);
      const promos = selectPromos(state);
      const alerts = selectAlerts(state);

      const sanitizedQuery = query.toLowerCase();
      const searchResults: SearchResult[] = [];
      const seenIds = new Set<string>(); // Set to track seen IDs for deduplication

      const addResult = (result: SearchResult) => {
        if (!seenIds.has(result.id)) {
          seenIds.add(result.id);
          searchResults.push(result);
        }
      };

      const searchInClients = (clientsToSearch: Client[]) => {
        clientsToSearch.forEach((client) => {
          if (
            client.name?.toLowerCase().includes(sanitizedQuery) ||
            client.id?.toLowerCase().includes(sanitizedQuery)
          ) {
            addResult({
              id: client.id,
              name: client.name,
              type: "client",
              province: client.province,
              phone: client.phone,
              paymentMethod: client.paymentMethod,
              email: client.email,
              agent: client.agent,
            });
          }
        });
      };

      const searchInAgents = (agentsToSearch: Agent[]) => {
        agentsToSearch.forEach((agent) => {
          if (
            agent.name?.toLowerCase().includes(sanitizedQuery) ||
            agent.id?.toLowerCase().includes(sanitizedQuery)
          ) {
            addResult({
              id: agent.id,
              name: agent.name,
              type: "agent",
            });
          }
        });
      };

      const searchInArticles = (clientsToSearch: Client[]) => {
        clientsToSearch.forEach((client) => {
          client.movements.forEach((movement) => {
            movement.details.forEach((detail: MovementDetail) => {
              if (
                detail.name?.toLowerCase().includes(sanitizedQuery) ||
                detail.articleId?.toLowerCase().includes(sanitizedQuery) ||
                detail.brand?.toLowerCase().includes(sanitizedQuery)
              ) {
                const existingResult = searchResults.find(
                  (r) => r.id === detail.articleId
                ) as SearchResult | undefined;
                const newLastSoldDate = new Date(movement.dateOfOrder);
                const existingLastSoldDate = existingResult?.lastSoldDate
                  ? new Date(existingResult.lastSoldDate)
                  : null;

                if (
                  !existingResult ||
                  (existingLastSoldDate &&
                    newLastSoldDate > existingLastSoldDate)
                ) {
                  addResult({
                    id: detail.articleId,
                    name: detail.name,
                    type: "article",
                    articleId: detail.articleId,
                    brand: detail.brand,
                    lastSoldDate: newLastSoldDate.toISOString(), // Store as ISO string for consistency
                  });
                }
              }
            });
          });
        });
      };

      const searchInPromos = (promosToSearch: Promo[] | GlobalPromos) => {
        const processPromo = (promo: Promo) => {
          if (
            promo.name.toLowerCase().includes(sanitizedQuery) ||
            promo.promoType.toLowerCase().includes(sanitizedQuery) ||
            promo.discount.toLowerCase().includes(sanitizedQuery)
          ) {
            addResult({
              id: promo.id,
              name: promo.name,
              type: "promo",
              promoType: promo.promoType,
              startDate: promo.startDate,
              endDate: new Date(promo.endDate),
              promoIssuedBy: promo.promoIssuedBy,
            });
          }
        };

        if (Array.isArray(promosToSearch)) {
          promosToSearch.forEach(processPromo);
        } else {
          Object.values(promosToSearch).forEach(({ Promos }) => {
            Promos.forEach(processPromo);
          });
        }
      };

      const searchInVisits = (visitsToSearch: Visit[] | GlobalVisits) => {
        const processVisit = (visit: Visit) => {
          if (
            visit.reason.toLowerCase().includes(sanitizedQuery) ||
            visit.type.toLowerCase().includes(sanitizedQuery)
          ) {
            addResult({
              id: visit.id,
              name: visit.reason,
              type: "visit",
              reason: visit.reason,
              date: visit.date,
              pending: visit.pending,
              completed: visit.completed,
              visitIssuedBy: visit.visitIssuedBy,
            });
          }
        };

        if (Array.isArray(visitsToSearch)) {
          visitsToSearch.forEach(processVisit);
        } else {
          Object.values(visitsToSearch).forEach(({ Visits }) => {
            Visits.forEach(processVisit);
          });
        }
      };
      const searchInAlerts = (alertsToSearch: Alert[]) => {
        alertsToSearch.forEach((alert) => {
          if (
            alert.alertReason.toLowerCase().includes(sanitizedQuery) ||
            alert.message.toLowerCase().includes(sanitizedQuery)
          ) {
            addResult({
              id: alert._id,
              name: alert.alertReason,
              type: "alert",
              alertReason: alert.alertReason,
              createdAt: alert.createdAt.toISOString(),
              severity: alert.severity,
              alertIssuedBy: alert.alertIssuedBy,
            });
          }
        });
      };

      if (userRole === "admin") {
        if (filter === "all" || filter === "client") {
          searchInClients(Object.values(state.data.clients));
        }
        if (filter === "all" || filter === "agent") {
          searchInAgents(Object.values(state.data.agents));
        }
        if (filter === "all" || filter === "article") {
          searchInArticles(Object.values(state.data.clients));
        }
        if (filter === "all" || filter === "promo") {
          searchInPromos(promos);
        }
        if (filter === "all" || filter === "visit") {
          searchInVisits(visits);
        }
        if (filter === "all" || filter === "alert") {
          searchInAlerts(alerts as Alert[]);
        }
      } else if (userRole === "agent") {
        if (filter === "all" || filter === "client") {
          searchInClients(Object.values(state.data.clients));
        }
        if (filter === "all" || filter === "article") {
          searchInArticles(Object.values(state.data.clients));
        }
        if (filter === "all" || filter === "promo") {
          searchInPromos(promos as Promo[]);
        }
        if (filter === "all" || filter === "visit") {
          searchInVisits(visits as Visit[]);
        }
        if (filter === "all" || filter === "alert") {
          searchInAlerts(alerts as Alert[]);
        }
      } else if (userRole === "client") {
        const clientData = userData as Client;
        if (filter === "all" || filter === "article") {
          searchInArticles([clientData]);
        }
        if (filter === "all" || filter === "promo") {
          searchInPromos(promos as Promo[]);
        }
        if (filter === "all" || filter === "visit") {
          searchInVisits(visits as Visit[]);
        }
        if (filter === "all" || filter === "alert") {
          searchInAlerts(alerts as Alert[]);
        }
      }

      return searchResults;
    } catch (error: unknown) {
      console.error("Error searching items:", error);

      let errorMessage: string;

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = String((error as { message: unknown }).message);
      } else if (typeof error === "string") {
        errorMessage = error;
      } else {
        errorMessage = "An unknown error occurred.";
      }

      return rejectWithValue(errorMessage);
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
