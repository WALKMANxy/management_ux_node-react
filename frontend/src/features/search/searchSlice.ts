// src/features/search/searchSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { SearchResult, SearchParams, SearchState, Movement, MovementDetail } from "../../models/models";
import { loadJsonData, loadClientDetailsData, mapDataToModels } from "../../utils/dataLoader";
import { RootState } from "../../app/store";
import dayjs from "dayjs";

const initialState: SearchState = {
  query: "",
  results: [],
  status: "idle",
  error: null,
};

export const searchItems = createAsyncThunk<SearchResult[], SearchParams, { state: RootState }>(
  "search/searchItems",
  async ({ query, filter }, { getState }) => {
    console.log(`Searching for query: ${query} with filter: ${filter}`);

    const movementData: Movement[] = await loadJsonData("/datasetsfrom01JANto12JUN.json");
    const clientDetails = await loadClientDetailsData("/clientdetailsdataset02072024.json");
    const clients = await mapDataToModels(movementData, clientDetails);

    const sanitizedQuery = query.toLowerCase();
    const seen = new Map<string, string>(); // Track seen IDs and latest sold dates

    // Retrieve the logged-in user details from the state
    const state = getState();
    const { id, userRole } = state.auth;

    let filteredClients;

    if (userRole === "agent") {
      // Filter clients based on the agent ID if the userRole is "agent"
      filteredClients = clients.filter(client => client.agent === id);
    } else if (userRole === "client") {
      // Filter clients based on the client ID if the userRole is "client"
      filteredClients = clients.filter(client => client.id === id);
    } else {
      // Admin sees all clients
      filteredClients = clients;
    }

    let searchResults: SearchResult[] = [];

    if (filter === "all" || filter === "client") {
      const clientResults = filteredClients
        .filter(client => {
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
      console.log("Client results:", clientResults);
    }

    if (filter === "all" || filter === "article") {
      const articleMap = new Map<string, SearchResult>();

      movementData.forEach((movement) => {
        movement.details.forEach((detail: MovementDetail) => {
          const articleKey = `${detail.articleId}-${detail.brand}-${detail.name}`;
          const includesQuery = (value: string | null | undefined) =>
            value ? value.toLowerCase().includes(sanitizedQuery) : false;

          if (
            includesQuery(detail.name) ||
            includesQuery(detail.articleId) ||
            includesQuery(detail.brand)
          ) {
            const lastSoldDate = movement.dateOfOrder;

            if (articleMap.has(articleKey)) {
              const existingArticle = articleMap.get(articleKey);
              if (existingArticle && dayjs(existingArticle.lastSoldDate).isBefore(dayjs(lastSoldDate))) {
                existingArticle.lastSoldDate = lastSoldDate;
              }
            } else {
              articleMap.set(articleKey, {
                id: detail.articleId,
                name: detail.name,
                type: "article",
                brand: detail.brand,
                lastSoldDate,
              });
            }
          }
        });
      });

      const articleResults = Array.from(articleMap.values()).filter((result) => {
        if (seen.has(result.id)) {
          const existingDate = seen.get(result.id);
          if (existingDate && dayjs(existingDate).isAfter(dayjs(result.lastSoldDate))) {
            return false;
          }
        }
        seen.set(result.id, result.lastSoldDate); // Update seen map with the latest date
        return true;
      });

      searchResults = searchResults.concat(articleResults);
      console.log("Article results:", articleResults);
    }

    if (filter === "all" || filter === "promo") {
      const promoResults = filteredClients.flatMap(client => client.promos)
        .filter(promo => promo.name ? promo.name.toLowerCase().includes(sanitizedQuery) : false)
        .map((promo) => ({
          id: promo.id,
          name: promo.name,
          type: "promo",
          discountAmount: promo.discount,
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
      console.log("Promo results:", promoResults);
    }

    console.log("Final search results:", searchResults);
    return searchResults;
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
        state.error = action.error.message || null;
      });
  },
});

export const { setQuery, clearResults } = searchSlice.actions;

export default searchSlice.reducer;
