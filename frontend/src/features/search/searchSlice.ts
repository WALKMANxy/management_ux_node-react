import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { SearchResult, SearchParams, SearchState } from "../../models/models";
import { loadJsonData, loadClientDetailsData, mapDataToModels } from "../../utils/dataLoader";
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
    const movementData = await loadJsonData("/datasetsfrom01JANto12JUN.json");
    const clientDetails = await loadClientDetailsData("/clientdetailsdataset02072024.json");
    const clients = await mapDataToModels(movementData, clientDetails);

    
    //console.log('Clients after mapping:', clients);

    const sanitizedQuery = query.toLowerCase();
    const seen = new Map<string, string>();

    const state = getState();
    const { id, userRole } = state.auth;

    let filteredClients;

    if (userRole === "agent") {
      filteredClients = clients.filter(client => client.agent === id);
    } else if (userRole === "client") {
      filteredClients = clients.filter(client => client.id === id);
    } else {
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
          seen.set(result.id, "");
          return true;
        });

      searchResults = searchResults.concat(clientResults);
    }

    // Process articles and promos if needed...

    //console.log('Search results:', searchResults);

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