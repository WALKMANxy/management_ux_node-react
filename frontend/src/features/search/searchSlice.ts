// src/features/search/searchSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import {
  Movement,
  SearchParams,
  SearchResult,
  SearchState,
} from "../../models/models";
import {
  loadClientDetailsData,
  loadJsonData,
  mapDataToModels,
} from "../../utils/dataLoader";

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
      //console.log(`Searching for query: ${query} with filter: ${filter}`);

      const movementData: Movement[] = await loadJsonData(
        "/data/datasetsfrom01JANto12JUN.min.json"
      );
      const clientDetails = await loadClientDetailsData(
        "/data/clientdetailsdataset02072024.min.json"
      );
      const clients = await mapDataToModels(movementData, clientDetails);

      const sanitizedQuery = query.toLowerCase();
      const seen = new Map<string, string>(); // Track seen IDs

      // Retrieve the logged-in user details from the state
      const state = getState();
      const { id, userRole } = state.auth;

      let filteredClients;

      if (userRole === "agent") {
        // Filter clients based on the agent ID if the userRole is "agent"
        filteredClients = clients.filter((client) => client.agent === id);
      } else if (userRole === "client") {
        // Filter clients based on the client ID if the userRole is "client"
        filteredClients = clients.filter((client) => client.id === id);
      } else {
        // Admin sees all clients
        filteredClients = clients;
      }

      let searchResults: SearchResult[] = [];

      if (filter === "all" || filter === "client") {
        const clientResults = filteredClients
          .filter((client) => {
            const includesQuery = (value: string | null | undefined) =>
              value ? value.toLowerCase().includes(sanitizedQuery) : false;

            return (
              includesQuery(client.name) ||
              includesQuery(client.email) ||
              includesQuery(client.phone)
            );
          })
          .map((client) => ({
            id: client.id,
            name: client.name,
            type: "client",
            province: client.province,
            phone: client.phone,
            paymentMethod: client.paymentMethod,
          }))
          .filter((result) => {
            if (seen.has(result.id)) {
              return false;
            }
            seen.set(result.id, ""); // Add to seen map
            return true;
          });

        searchResults = searchResults.concat(clientResults);
        //console.log("Client results:", clientResults);
      }

      if (filter === "all" || filter === "article") {
        const articleResults = filteredClients
          .flatMap((client) =>
            client.movements.flatMap((movement) =>
              movement.details
                .filter((detail) => {
                  const includesQuery = (value: string | null | undefined) =>
                    value
                      ? value.toLowerCase().includes(sanitizedQuery)
                      : false;

                  return (
                    includesQuery(detail.name) ||
                    includesQuery(detail.articleId) ||
                    includesQuery(detail.brand)
                  );
                })
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
          .filter((result) => {
            if (seen.has(result.id)) {
              const existingDate = seen.get(result.id);
              if (existingDate && existingDate > result.lastSoldDate) {
                return false;
              }
            }
            seen.set(result.id, result.lastSoldDate); // Update seen map with the latest date
            return true;
          });

        searchResults = searchResults.concat(articleResults);
      }

      if (filter === "all" || filter === "promo") {
        const promoResults = filteredClients
          .flatMap((client) => client.promos)
          .filter((promo) =>
            promo.name
              ? promo.name.toLowerCase().includes(sanitizedQuery)
              : false
          )
          .map((promo) => ({
            id: promo.id,
            name: promo.name,
            type: "promo",
            discountAmount: promo.discount,
            // isEligible: promo.isEligible, // Commented out until data is available
            startDate: promo.startDate,
            endDate: promo.endDate,
          }))
          .filter((result) => {
            if (seen.has(result.id)) {
              return false;
            }
            seen.set(result.id, ""); // Add to seen map
            return true;
          });

        searchResults = searchResults.concat(promoResults);
      }
      //console.log("Final search results:", searchResults);
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
        state.error = action.payload as string; // Properly type the error
      });
  },
});

export const { setQuery, clearResults } = searchSlice.actions;

export default searchSlice.reducer;
