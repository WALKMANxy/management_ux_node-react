import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  GlobalPromos,
  GlobalVisits,
  Promo,
  Visit,
} from "../../models/dataModels";
import { Admin, Agent, Client } from "../../models/entityModels";
import { DataSliceState } from "../../models/stateModels";
import { mapPromosToEntity, mapVisitsToEntity } from "../../utils/dataLoader";
import { generateErrorResponse } from "../../utils/errorHandling";
import { loadPromosData, loadVisitsData } from "../api/apiUtils";

export const updateApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Client", "Agent", "Admin", "Visit", "Promo"],
  endpoints: (builder) => ({
    updateVisits: builder.query<Visit[] | GlobalVisits, void>({
      queryFn: async (_, { getState }) => {
        try {
          const visits = await loadVisitsData();

          const state = getState() as { data: DataSliceState };
          const entity = state.data.currentUserData as Client | Agent | Admin;
          const role = state.data.currentUserDetails?.role;

          if (!entity || !role)
            throw new Error("No entity or role found in the state.");

          // Map visits based on role
          const mappedVisits = mapVisitsToEntity(entity, visits, role);

          return { data: mappedVisits };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
      providesTags: ["Visit"],
    }),

    updatePromos: builder.query<Promo[] | GlobalPromos, void>({
      queryFn: async (_, { getState }) => {
        try {
          const promos = await loadPromosData();

          const state = getState() as { data: DataSliceState };
          const entity = state.data.currentUserData as Client | Agent | Admin;
          const role = state.data.currentUserDetails?.role;

          if (!entity || !role)
            throw new Error("No entity or role found in the state.");

          // Map promos based on role
          const mappedPromos = mapPromosToEntity(entity, promos, role);

          return { data: mappedPromos };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
      providesTags: ["Promo"],
    }),
  }),
});

export const { useUpdateVisitsQuery, useUpdatePromosQuery } = updateApi;
