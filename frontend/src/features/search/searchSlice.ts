import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Agent, Client, SearchParams, SearchResult, SearchState } from "../../models/models";
import { api } from "../../services/api";

const initialState: SearchState = {
  query: "",
  results: [],
  status: "idle",
  error: null,
};

export const searchItems = createAsyncThunk<SearchResult[], SearchParams, { state: RootState }>(
  "search/searchItems",
  async ({ query, filter }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const { id, userRole } = state.auth;

      const sanitizedQuery = query.toLowerCase();
      const seen = new Map<string, string>(); // Track seen IDs
      let searchResults: SearchResult[] = [];

      // Load data based on user role and search context
      let clients: Client[] = [];
      let agents: Agent[] = [];

      if (userRole === "admin") {
        const adminData = await dispatch(api.endpoints.getAdminData.initiate()).unwrap();
        clients = adminData.clients;
        agents = adminData.agents;
        console.log("Admin Data Loaded: ", { clients, agents });
      } else if (userRole === "agent") {
        clients = (await dispatch(api.endpoints.getClients.initiate()).unwrap()).filter(client => client.agent === id);
        console.log("Agent Data Loaded: ", clients);
      } else if (userRole === "client" && id) {  // Ensure id is not null
        clients = [(await dispatch(api.endpoints.getClientById.initiate(id)).unwrap())];
        console.log("Client Data Loaded: ", clients);
      }

      // Filter and map clients
      if (filter === "all" || filter === "client" || (filter === "admin" && userRole === "admin")) {
        const clientResults = clients
          .filter(client => 
            (client.name?.toLowerCase().includes(sanitizedQuery) || client.id?.toLowerCase().includes(sanitizedQuery))
          )
          .map(client => ({
            id: client.id,
            name: client.name,
            type: "client",
            province: client.province,
            phone: client.phone,
            paymentMethod: client.paymentMethod,
          }))
          .filter(result => !seen.has(result.id) && seen.set(result.id, ""));
        
        searchResults = searchResults.concat(clientResults);
        console.log("Client Search Results: ", clientResults);
      }

      // Filter and map agents
      if (filter === "all" || filter === "agent" || (filter === "admin" && userRole === "admin")) {
        const agentResults = agents
          .filter(agent => agent.name?.toLowerCase().includes(sanitizedQuery) || agent.id?.toLowerCase().includes(sanitizedQuery))
          .map(agent => ({
            id: agent.id,
            name: agent.name,
            type: "agent",
          }))
          .filter(result => !seen.has(result.id) && seen.set(result.id, ""));
        
        searchResults = searchResults.concat(agentResults);
        console.log("Agent Search Results: ", agentResults);
      }

      // Filter and map articles
      if (filter === "all" || filter === "article") {
        const articleResults = clients
          .flatMap(client => client.movements.flatMap(movement => 
            movement.details
              .filter(detail => 
                (detail.name?.toLowerCase().includes(sanitizedQuery) || 
                detail.articleId?.toLowerCase().includes(sanitizedQuery) || 
                detail.brand?.toLowerCase().includes(sanitizedQuery))
              )
              .map(detail => ({
                id: detail.articleId,
                name: detail.name,
                type: "article",
                brand: detail.brand,
                articleId: detail.articleId,
                lastSoldDate: movement.dateOfOrder,
              }))
          ))
          .filter(result => !seen.has(result.id) && seen.set(result.id, result.lastSoldDate));
        
        searchResults = searchResults.concat(articleResults);
        console.log("Article Search Results: ", articleResults);
      }

      // Filter and map promos
      if (filter === "all" || filter === "promo") {
        const promoResults = clients
          .flatMap(client => client.promos)
          .filter(promo => promo.name && promo.name.toLowerCase().includes(sanitizedQuery))
          .map(promo => ({
            id: promo.id,
            name: promo.name,
            type: "promo",
            discountAmount: promo.discount,
            startDate: promo.startDate,
            endDate: promo.endDate,
          }))
          .filter(result => !seen.has(result.id) && seen.set(result.id, ""));
        
        searchResults = searchResults.concat(promoResults);
        console.log("Promo Search Results: ", promoResults);
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
