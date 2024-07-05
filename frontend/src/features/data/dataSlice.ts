// src/features/data/dataSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Client, DataState, FetchDataPayload } from "../../models/models";
import {
  loadClientDetailsData,
  loadJsonData,
  mapDataToModels,
} from "../../utils/dataLoader";

const initialState: DataState = {
  clients: [],
  clientIndex: new Map(),
  status: "idle",
  error: null,
};

export const fetchData = createAsyncThunk<FetchDataPayload>(
  "data/fetchData",
  async () => {
    const [data, clientDetails] = await Promise.all([
      loadJsonData("/data/datasetsfrom01JANto12JUN.min.json"),
      loadClientDetailsData("/data/clientdetailsdataset02072024.min.json"),
    ]);
    const clients = await mapDataToModels(data, clientDetails);

    const clientIndex = new Map<string, Client>();
    clients.forEach((client) => {
      clientIndex.set(client.id, client);
    });

    return { clients, clientIndex };
  }
);

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setAgentClients(state, action: PayloadAction<Client[]>) {
      state.clients = action.payload;
      state.clientIndex = new Map<string, Client>(
        action.payload.map((client) => [client.id, client])
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.clients = action.payload.clients;
        state.clientIndex = action.payload.clientIndex;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export const { setAgentClients } = dataSlice.actions;
export default dataSlice.reducer;
