// src/features/example/exampleSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface ExampleState {
  data: any[];
}

const initialState: ExampleState = {
  data: [],
};

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {},
});

export default exampleSlice.reducer;

export {}  // Add this line to ensure the file is treated as a module
