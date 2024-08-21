import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { DataSliceState } from "../models/stateModels";
import { mapPromosToEntity, mapVisitsToEntity } from "../utils/dataLoader";
import { generateErrorResponse } from "../utils/errorHandling";
import { loadPromosData, loadVisitsData } from "./api/apiUtils";
import { Client, Agent, Admin } from "../models/entityModels";

export const updateApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Client", "Agent", "Admin", "Visit", "Promo"],
  endpoints: (builder) => ({
    updateVisits: builder.query<Client | Agent | Admin, void>({
      queryFn: async (_, { getState }) => {
        try {
          const visits = await loadVisitsData();

          const state = getState() as { data: DataSliceState };
          const entity = { ...state.data.currentUserData } as Client | Agent | Admin;

          if (!entity) throw new Error("No entity found in the state.");

          mapVisitsToEntity(entity, visits);

          return { data: entity };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
      providesTags: ["Visit"],
    }),

    updatePromos: builder.query<Client | Agent | Admin, void>({
      queryFn: async (_, { getState }) => {
        try {
          const promos = await loadPromosData();

          const state = getState() as { data: DataSliceState };
          const entity = { ...state.data.currentUserData } as Client | Agent | Admin;

          if (!entity) throw new Error("No entity found in the state.");

          mapPromosToEntity(entity, promos);

          return { data: entity };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
      providesTags: ["Promo"],
    }),
  }),
});

export const { useUpdateVisitsQuery, useUpdatePromosQuery } = updateApi;