import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { SearchResult, SearchParams, SearchState } from "../../models/models";
import { loadJsonData, mapDataToModels } from "../../utils/dataLoader";
import { RootState } from "../../app/store";

const initialState: SearchState = {
  query: "",
  results: [],
  status: "idle",
  error: null,
};

export const searchItems = createAsyncThunk<SearchResult[], SearchParams, { state: RootState }>(
  "search/searchItems",
  async ({ query, filter }, { getState }) => {
    const data = await loadJsonData("/datasetsfrom01JANto12JUN.json");
    const clients = await mapDataToModels(data);

    const sanitizedQuery = query.toLowerCase();
    const seen = new Set<string>(); // Track seen IDs

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
      searchResults = searchResults.concat(
        filteredClients
          .filter(
            (client) =>
              client.name.toLowerCase().includes(sanitizedQuery) ||
              client.email.toLowerCase().includes(sanitizedQuery) ||
              client.phone.toLowerCase().includes(sanitizedQuery)
          )
          .map((client) => ({ id: client.id, name: client.name, type: "client" }))
          .filter((result) => {
            if (seen.has(result.id)) {
              return false;
            }
            seen.add(result.id);
            return true;
          })
      );
    }

    if (filter === "all" || filter === "article") {
      searchResults = searchResults.concat(
        filteredClients.flatMap((client) =>
          client.movements
            .flatMap(movement =>
              movement.details
                .filter(
                  (detail) =>
                    detail.name.toLowerCase().includes(sanitizedQuery) ||
                    movement.id.toLowerCase().includes(sanitizedQuery)
                )
                .map((detail) => ({
                  id: `${movement.id}-${detail.articleId}`,
                  name: detail.name,
                  type: "article",
                }))
            )
        )
        .filter((result) => {
          if (seen.has(result.id)) {
            return false;
          }
          seen.add(result.id);
          return true;
        })
      );
    }

    if (filter === "all" || filter === "promo") {
      searchResults = searchResults.concat(
        filteredClients.flatMap(client => client.promos)
          .filter((promo) =>
            promo.name.toLowerCase().includes(sanitizedQuery)
          )
          .map((promo) => ({
            id: promo.id,
            name: promo.name,
            type: "promo",
          }))
          .filter((result) => {
            if (seen.has(result.id)) {
              return false;
            }
            seen.add(result.id);
            return true;
          })
      );
    }

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
