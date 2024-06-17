// searchSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface SearchResult {
  id: string;
  name: string;
  type: string;
}

interface SearchState {
  query: string;
  results: SearchResult[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SearchState = {
  query: '',
  results: [],
  status: 'idle',
  error: null,
};

interface SearchParams {
  query: string;
  filter?: string;
}

export const searchItems = createAsyncThunk<SearchResult[], SearchParams>(
  'search/searchItems',
  async ({ query, filter }) => {
    console.log('searchItems called with query:', query, 'and filter:', filter);
    const mockData = [
      { id: '1', name: 'Client 1', type: 'client' },
      { id: '2', name: 'Client 2', type: 'client' },
      { id: '3', name: 'Client 3', type: 'client' },
      { id: '4', name: 'Article 1', type: 'article' },
      { id: '5', name: 'Article 2', type: 'article' },
      { id: '6', name: 'Promo 1', type: 'promo' },
      { id: '7', name: 'Promo 2', type: 'promo' },
      { id: '8', name: 'Visit 1', type: 'visit' },
      { id: '9', name: 'Visit 2', type: 'visit' },
      { id: '10', name: 'Alert 1', type: 'alert' },
      { id: '11', name: 'Alert 2', type: 'alert' },
      { id: '12', name: 'Alert 3', type: 'alert' }
    ];
    const lowerCaseQuery = query.toLowerCase();
    let filteredData;

    if (filter && filter !== 'all') {
      filteredData = mockData.filter(item => item.type === filter);
    } else {
      filteredData = mockData;
    }

    const results = filteredData.filter(item =>
      item.name.toLowerCase().includes(lowerCaseQuery)
    );
    console.log('Filtered results:', results);
    return results;
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery(state, action) {
      state.query = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchItems.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.results = action.payload;
      })
      .addCase(searchItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  },
});

export const { setQuery } = searchSlice.actions;

export default searchSlice.reducer;
