// src/thunks/visitPromoThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Promo, Visit } from "../../models/dataModels";
import { DataSliceState } from "../../models/stateModels";
import { promoVisitApi } from "../promoVisits/promosVisitsQueries";
import { dataApi } from "./dataQueries.ts";

export const fetchInitialData = createAsyncThunk(
  "data/fetchInitialData",
  async (_, { getState, dispatch }) => {
    const state = getState() as {
      auth: { role: string; id: string; userId: string };
    };
    const { role, id, userId } = state.auth;

    if (role === "employee") {
      // For employees, skip data fetching
      return { role, userData: null, userId };
    }

    let userData;
    if (role === "client") {
      userData = await dispatch(
        dataApi.endpoints.getUserClientData.initiate({ entityCode: id, userId })
      ).unwrap();
    } else if (role === "agent") {
      userData = await dispatch(
        dataApi.endpoints.getUserAgentData.initiate({ entityCode: id, userId })
      ).unwrap();
    } else if (role === "admin") {
      userData = await dispatch(
        dataApi.endpoints.getUserAdminData.initiate({ entityCode: id, userId })
      ).unwrap();
    } else {
      throw new Error("Invalid user role");
    }
    return { role, userData, userId };
  }
);
// Thunk to update visits
export const getVisits = createAsyncThunk<
  void, // Changed return type to void
  void,
  { state: { data: DataSliceState } }
>("data/updateVisits", async (_, { dispatch, getState }) => {
  try {
    const state = getState().data;
    const entity = state.currentUserData;
    const id = state.currentUserDetails?.id
    const role = state.currentUserDetails?.role;
    if (role === "employee") {
      // Employees should not fetch visits
      return;
    }

    if (!entity || !role) {
      throw new Error("No entity or role found in the state.");
    }

    // Dispatch the RTK Query endpoint with the necessary arguments
    await dispatch(
      promoVisitApi.endpoints.getVisits.initiate({ entity, role, id })
    ).unwrap();
  } catch (error) {
    console.error("Failed to update visits:", error);
    throw error;
  }
});

// Thunk to update promos
export const getPromos = createAsyncThunk<
  void, // Changed return type to void
  void,
  { state: { data: DataSliceState } }
>("data/updatePromos", async (_, { dispatch, getState }) => {
  try {
    const state = getState().data;
    const entity = state.currentUserData;
    const role = state.currentUserDetails?.role;

    if (role === "employee") {
      // Employees should not fetch visits
      return;
    }

    if (!entity || !role) {
      throw new Error("No entity or role found in the state.");
    }

    // Dispatch the RTK Query endpoint with the necessary arguments
    await dispatch(
      promoVisitApi.endpoints.getPromos.initiate({ entity, role })
    ).unwrap();
  } catch (error) {
    console.error("Failed to update promos:", error);
    throw error;
  }
});

// Create Visit Thunk
// Create Visit Thunk
export const createVisitAsync = createAsyncThunk<
  Visit, // Return type
  Visit, // Input type
  { state: { data: DataSliceState } }
>(
  "data/createVisit",
  async (visitData, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState().data;
      const entity = state.currentUserData;
      const role = state.currentUserDetails?.role;

      console.log("Debug: Current State", state);
      console.log("Debug: Visit Data", visitData);
      console.log("Debug: User Entity", entity);
      console.log("Debug: User Role", role);

      if (role === "employee") {
        console.warn("Debug: User is an employee, rejecting visit creation.");
        return rejectWithValue("You can't create visits.");
      }

      if (!entity || !role) {
        console.error("Debug: No entity or role found in the state.");
        throw new Error("No entity or role found in the state.");
      }

      // Dispatch the mutation and unwrap the response
      const result = await dispatch(
        promoVisitApi.endpoints.createVisit.initiate({
          visitData,
          entity,
          role,
        })
      ).unwrap();

      console.log("Debug: Visit creation successful", result);
      return visitData;

    } catch (err: unknown) {
      console.error("Debug: Error occurred", err);

      // Safely handle and type the error
      if (err instanceof Error && "data" in err) {
        return rejectWithValue((err as { data: string }).data);
      } else if (err instanceof Error) {
        return rejectWithValue(err.message);
      } else {
        return rejectWithValue("Failed to create visit.");
      }
    }
  }
);


// Update Visit Thunk
export const updateVisitAsync = createAsyncThunk<
  void, // Changed return type to void
  {
    _id: string;
    visitData: Visit;
  },
  { state: { data: DataSliceState } }
>(
  "data/updateVisit",
  async ({ _id, visitData }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState().data;
      const entity = state.currentUserData;
      const role = state.currentUserDetails?.role;

      if (role === "employee") {
        // Employees should not fetch visits
        return rejectWithValue("You can't update visits.");
      }

      if (!entity || !role) {
        throw new Error("No entity or role found in the state.");
      }

      // Dispatch the mutation and unwrap the response
      await dispatch(
        promoVisitApi.endpoints.updateVisit.initiate({
          _id,
          visitData,
          entity,
          role,
        })
      ).unwrap();
    } catch (err: unknown) {
      if (err instanceof Error && "data" in err) {
        return rejectWithValue((err as { data: string }).data);
      } else if (err instanceof Error) {
        return rejectWithValue(err.message);
      } else {
        return rejectWithValue("Failed to update visit.");
      }
    }
  }
);

// Create Promo Thunk
export const createPromoAsync = createAsyncThunk<
  Promo, // Changed return type to void
  Promo, // Input type
  { state: { data: DataSliceState } }
>(
  "data/createPromo",
  async (promoData, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState().data;
      const entity = state.currentUserData;
      const role = state.currentUserDetails?.role;

      if (role === "employee") {
        // Employees should not fetch visits
        return rejectWithValue("You can't create promos.");
      }

      if (!entity || !role) {
        throw new Error("No entity or role found in the state.");
      }

      // Dispatch the mutation and unwrap the response
      await dispatch(
        promoVisitApi.endpoints.createPromo.initiate({
          promoData,
          entity,
          role,
        })
      ).unwrap();
      return promoData;
    } catch (err: unknown) {
      if (err instanceof Error && "data" in err) {
        return rejectWithValue((err as { data: string }).data);
      } else if (err instanceof Error) {
        return rejectWithValue(err.message);
      } else {
        return rejectWithValue("Failed to create promo.");
      }
    }
  }
);

// Update Promo Thunk
export const updatePromoAsync = createAsyncThunk<
  void, // Changed return type to void
  {
    _id: string;
    promoData: Promo;
  },
  { state: { data: DataSliceState } }
>(
  "data/updatePromo",
  async ({ _id, promoData }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState().data;
      const entity = state.currentUserData;
      const role = state.currentUserDetails?.role;

      if (role === "employee") {
        // Employees should not fetch visits
        return rejectWithValue("You can't update promos.");
      }

      if (!entity || !role) {
        throw new Error("No entity or role found in the state.");
      }

      // Dispatch the mutation and unwrap the response
      await dispatch(
        promoVisitApi.endpoints.updatePromo.initiate({
          _id,
          promoData,
          entity,
          role,
        })
      ).unwrap();
    } catch (err: unknown) {
      if (err instanceof Error && "data" in err) {
        return rejectWithValue((err as { data: string }).data);
      } else if (err instanceof Error) {
        return rejectWithValue(err.message);
      } else {
        return rejectWithValue("Failed to update promo.");
      }
    }
  }
);
