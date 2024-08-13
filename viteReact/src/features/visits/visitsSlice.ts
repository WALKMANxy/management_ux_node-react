import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Visit } from "../../models/dataModels";

const initialState: Visit[] = [];

const visitsSlice = createSlice({
  name: "visits",
  initialState,
  reducers: {
    setVisits(state, action: PayloadAction<Visit[]>) {
      return action.payload;
    },
    clearVisits(state) {
      return [];
    },
  },
});

export const { setVisits, clearVisits } = visitsSlice.actions;

export const selectVisits = (state: RootState) => state.visits;

export default visitsSlice.reducer;
