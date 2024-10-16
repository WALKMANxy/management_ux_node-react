// src/thunks/visitPromoThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { Promo, Visit } from "../../models/dataModels";
import { DataSliceState } from "../../models/stateModels";
import {
  mapPromosToEntity,
  mapVisitsToEntity,
} from "../../services/dataLoader.ts";
import {
  createPromoApi,
  createVisitApi,
  getPromosApi,
  getVisitsApi,
  updatePromoApi,
  updateVisitApi,
} from "../promoVisits/api/promoVisit.ts";
import {
  addOrUpdatePromo,
  addOrUpdateVisit,
  setCurrentUserPromos,
  setCurrentUserVisits,
} from "./dataSlice.ts";
import { getUserAdminDataApi, getUserAgentDataApi, getUserClientDataApi } from "./api/userData.ts";

export const fetchInitialData = createAsyncThunk(
  "data/fetchInitialData",
  async (_, { getState }) => {
    const state = getState() as {
      auth: { role: string; id: string; userId: string };
    };
    const { role, id } = state.auth;

    if (role === "employee") {
      // For employees, skip data fetching
      return { role, userData: null };
    }

    let userData;
    if (role === "client") {
      userData = await getUserClientDataApi(id );

    } else if (role === "agent") {
      userData = await getUserAgentDataApi(id );

    } else if (role === "admin") {
      userData = await getUserAdminDataApi(id);
    } else {
      throw new Error("Invalid user role");
    }
    return { role, userData };
  }
);


// Thunk to update visits
export const getVisits = createAsyncThunk<
  void, // Return type
  void,
  { state: { data: DataSliceState } }
>("data/updateVisits", async (_, { dispatch, getState }) => {
  try {
    const state = getState().data;
    const entity = state.currentUserData;
    const id = state.currentUserDetails?.id;
    const role = state.currentUserDetails?.role;

    if (role === "employee") {
      // Employees should not fetch visits
      return;
    }

    if (!entity || !role) {
      throw new Error("No entity or role found in the state.");
    }

    const visits = await getVisitsApi({ role, clientId: id });

    // Transform the visits using the correct entity and role
    const mappedVisits = mapVisitsToEntity(visits, entity, role);

    // Dispatch an action to update the slice
    dispatch(setCurrentUserVisits(mappedVisits));
  } catch (error) {
    console.error("Failed to update visits:", error);
    throw error;
  }
});

// Thunk to update promos
export const getPromos = createAsyncThunk<
  void, // Return type
  void,
  { state: { data: DataSliceState } }
>("data/updatePromos", async (_, { dispatch, getState }) => {
  try {
    const state = getState().data;
    const entity = state.currentUserData;
    const role = state.currentUserDetails?.role;

    if (role === "employee") {
      // Employees should not fetch promos
      return;
    }

    if (!entity || !role) {
      throw new Error("No entity or role found in the state.");
    }

    const promos = await getPromosApi();

    // Transform the promos using the correct entity and role
    const mappedPromos = mapPromosToEntity(promos, entity, role);

    // Dispatch an action to update the slice
    dispatch(setCurrentUserPromos(mappedPromos));
  } catch (error) {
    console.error("Failed to update promos:", error);
    throw error;
  }
});

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

      // Call the API function
      const createdVisit = await createVisitApi(visitData);

      // Dispatch the action to update the slice
      dispatch(addOrUpdateVisit(createdVisit));

      console.log("Debug: Visit creation successful", createdVisit);
      return createdVisit;
    } catch (err: unknown) {
      console.error("Debug: Error occurred", err);

      // Safely handle and type the error
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      } else {
        return rejectWithValue("Failed to create visit.");
      }
    }
  }
);

// Update Visit Thunk
export const updateVisitAsync = createAsyncThunk<
  void, // Return type
  {
    _id: string;
    visitData: Partial<Visit>;
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
        // Employees should not update visits
        return rejectWithValue("You can't update visits.");
      }

      if (!entity || !role) {
        throw new Error("No entity or role found in the state.");
      }

      // Call the API function
      const updatedVisit = await updateVisitApi(_id, visitData);

      // Dispatch the action to update the slice
      dispatch(addOrUpdateVisit(updatedVisit));
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      } else {
        return rejectWithValue("Failed to update visit.");
      }
    }
  }
);

// Create Promo Thunk
export const createPromoAsync = createAsyncThunk<
  Promo, // Return type
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
        // Employees should not create promos
        return rejectWithValue("You can't create promos.");
      }

      if (!entity || !role) {
        throw new Error("No entity or role found in the state.");
      }

      // Convert Date fields to ISO strings before passing to the API
      const formattedPromoData = {
        ...promoData,
        startDate: new Date(promoData.startDate).toISOString(),
        endDate: new Date(promoData.endDate).toISOString(),
        createdAt: new Date(promoData.createdAt).toISOString(),
      };

      // Call the API function with the formatted data
      const createdPromo = await createPromoApi(formattedPromoData);
      // Dispatch the action to update the slice
      dispatch(addOrUpdatePromo(createdPromo));

      return createdPromo;
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      } else {
        return rejectWithValue("Failed to create promo.");
      }
    }
  }
);

// Update Promo Thunk
export const updatePromoAsync = createAsyncThunk<
  void, // Return type
  {
    _id: string;
    promoData: Partial<Promo>;
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
        // Employees should not update promos
        return rejectWithValue("You can't update promos.");
      }

      if (!entity || !role) {
        throw new Error("No entity or role found in the state.");
      }

      // Call the API function
      const updatedPromo = await updatePromoApi(_id, promoData);

      // Dispatch the action to update the slice
      dispatch(addOrUpdatePromo(updatedPromo));
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      } else {
        return rejectWithValue("Failed to update promo.");
      }
    }
  }
);
