// src/features/calendar/calendarSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Visit } from "../../models/dataModels";
import { CalendarState } from "../../models/stateModels";

const initialState: CalendarState = {
  visits: [],
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setVisits(state, action: PayloadAction<Visit[]>) {
      state.visits = action.payload;
    },
  },
});

export const { setVisits } = calendarSlice.actions;

export const selectVisits = (state: RootState) => state.calendar.visits;

export default calendarSlice.reducer;
