import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Promo } from "../../models/models";

type PromosState = {
  promos: Promo[];
};

const initialState: PromosState = {
  promos: [],
};

const promosSlice = createSlice({
  name: "promos",
  initialState,
  reducers: {
    setPromos(state, action: PayloadAction<Promo[]>) {
      state.promos = action.payload;
    },
  },
});

export const { setPromos } = promosSlice.actions;

export const selectPromos = (state: RootState) => state.promos.promos;

export default promosSlice.reducer;
