// src/features/search/searchSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { SearchResult, SearchParams, SearchState } from "../../models/models";
import mockData from "../../mockData/mockData";

const initialState: SearchState = {
  query: "",
  results: [],
  status: "idle",
  error: null,
};

export const searchItems = createAsyncThunk<SearchResult[], SearchParams>(
  "search/searchItems",
  async ({ query, filter }) => {
    const sanitizedQuery = query.toLowerCase();
    let searchResults: SearchResult[] = [];

    if (filter === "all" || filter === "client") {
      searchResults = searchResults.concat(
        mockData.clients
          .filter(
            (client) =>
              client.name.toLowerCase().includes(sanitizedQuery) ||
              client.email.toLowerCase().includes(sanitizedQuery) ||
              client.phone.toLowerCase().includes(sanitizedQuery)
          )
          .map((client) => ({ id: client.id, name: client.name, type: "client" }))
      );
    }

    if (filter === "all" || filter === "article") {
      searchResults = searchResults.concat(
        mockData.clients.flatMap((client) =>
          client.movements
            .filter(
              (movement) =>
                movement.name.toLowerCase().includes(sanitizedQuery) ||
                movement.type.toLowerCase().includes(sanitizedQuery)
            )
            .map((movement) => ({
              id: movement.id,
              name: movement.name,
              type: "article",
            }))
        )
      );
    }

    if (filter === "all" || filter === "promo") {
      searchResults = searchResults.concat(
        mockData.promos
          .filter((promo) =>
            promo.name.toLowerCase().includes(sanitizedQuery)
          )
          .map((promo) => ({
            id: promo.id,
            name: promo.name,
            type: "promo",
          }))
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
