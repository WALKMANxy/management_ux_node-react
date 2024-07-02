import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Client } from '../../models/models';
import { loadJsonData, loadClientDetailsData, mapDataToModels } from '../../utils/dataLoader';

interface ClientsState {
  clients: Client[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ClientsState = {
  clients: [],
  status: 'idle',
  error: null,
};

export const fetchClients = createAsyncThunk('clients/fetchClients', async () => {
  const clientData = await loadJsonData();
  const clientDetails = await loadClientDetailsData();
  const clients = await mapDataToModels(clientData, clientDetails);
  //console.log("Loaded clients data: ", clients); // Add console log
  return clients;
});

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchClients.fulfilled, (state, action: PayloadAction<Client[]>) => {
        state.status = 'succeeded';
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export const selectAllClients = (state: { clients: ClientsState }) => state.clients.clients;

export default clientsSlice.reducer;
