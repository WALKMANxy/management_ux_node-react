// src/features/debug/debugSlice.ts
import { createSlice } from '@reduxjs/toolkit';

interface DebugState {
  enabled: boolean;
}

const initialState: DebugState = {
  enabled: false,
};

const debugSlice = createSlice({
  name: 'debug',
  initialState,
  reducers: {
    toggleDebug: (state) => {
      state.enabled = !state.enabled;
    },
  },
});

export const { toggleDebug } = debugSlice.actions;
export default debugSlice.reducer;
