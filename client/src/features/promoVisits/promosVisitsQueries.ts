/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/data/promoVisitApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { AxiosError } from "axios";
import { Promo, Visit } from "../../models/dataModels";
import { Admin, Agent, Client } from "../../models/entityModels";
import {
  mapPromosToEntity,
  mapVisitsToEntity,
} from "../../services/dataLoader";
import { axiosInstance } from "../../utils/apiUtils";
import {
  addOrUpdatePromo,
  addOrUpdateVisit,
  setCurrentUserPromos,
  setCurrentUserVisits,
} from "../data/dataSlice";

export const baseQueryWithAxios = async (
  args: any,
  _api: any,
  _extraOptions: any
) => {
  try {
    const result = await axiosInstance.request({ ...args });
    return { data: result.data };
  } catch (axiosError) {
    const err = axiosError as AxiosError;
    return {
      error: {
        status: err.response?.status,
        data: err.response?.data || err.message,
      },
    };
  }
};

// Unified API slice for handling visits and promos
export const promoVisitApi = createApi({
  reducerPath: "promoVisitApi",
  baseQuery: baseQueryWithAxios,
  tagTypes: ["Visit", "Promo", "Client", "Agent", "Admin"],
  endpoints: (builder) => ({
    // Fetch Visits Query
    getVisits: builder.query<
      Visit[],
      { entity: Client | Admin | Agent; role: "client" | "agent" | "admin" }
    >({
      query: () => ({
        url: "/visits",
        method: "GET",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { entity, role } = arg;

          if (!entity || !role) {
            throw new Error("No entity or role provided.");
          }

          // Transform the visits using the correct entity and role
          const mappedVisits = mapVisitsToEntity(data, entity, role);

          // Dispatch an action to update the slice
          dispatch(setCurrentUserVisits(mappedVisits));
        } catch (error) {
          // Handle error
          console.error("Failed to fetch and map visits:", error);
        }
      },
      providesTags: [{ type: "Visit", id: "LIST" }],
    }),

    // Fetch Promos Query
    getPromos: builder.query<
      Promo[],
      { entity: Client | Admin | Agent; role: "client" | "agent" | "admin" }
    >({
      query: () => ({
        url: "/promos",
        method: "GET",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { entity, role } = arg;

          if (!entity || !role) {
            throw new Error("No entity or role provided.");
          }

          // Transform the promos using the correct entity and role
          const mappedPromos = mapPromosToEntity(data, entity, role);

          // Dispatch an action to update the slice
          dispatch(setCurrentUserPromos(mappedPromos));
        } catch (error) {
          // Handle error
          console.error("Failed to fetch and map promos:", error);
        }
      },
      providesTags: [{ type: "Promo", id: "LIST" }],
    }),

    // Create Visit Mutation
    createVisit: builder.mutation<
      Visit,
      {
        visitData: Visit;
        entity: Client | Admin | Agent;
        role: "client" | "agent" | "admin";
      }
    >({
      query: ({ visitData }) => ({
        url: `/visits`,
        method: "POST",

        body: {
          ...visitData,
          date: visitData.date.toISOString(),
          createdAt: visitData.createdAt.toISOString(),
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { entity, role } = arg;

          if (!entity || !role) {
            throw new Error("No entity or role provided.");
          }

          dispatch(addOrUpdateVisit(data));
        } catch (error) {
          // Handle error
          console.error("Failed to create visit:", error);
        }
      },
      invalidatesTags: [{ type: "Visit", id: "LIST" }],
    }),

    // Update Visit Mutation
    updateVisit: builder.mutation<
      Visit,
      {
        _id: string; // Visit ID to be updated
        visitData: Visit; // Partial visit data to be updated
        entity: Client | Admin | Agent;
        role: "client" | "agent" | "admin";
      }
    >({
      query: ({ _id, visitData }) => ({
        url: `/visits/${_id}`,
        method: "PATCH",

        body: {
          ...visitData,
          date: visitData.date.toISOString(),
          createdAt: visitData.createdAt.toISOString(),
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { entity, role } = arg;

          if (!entity || !role) {
            throw new Error("No entity or role provided.");
          }

          dispatch(addOrUpdateVisit(data));
        } catch (error) {
          // Handle error
          console.error("Failed to update visit:", error);
        }
      },
      invalidatesTags: [{ type: "Visit", id: "LIST" }],
    }),

    // Create Promo Mutation
    createPromo: builder.mutation<
      Promo,
      {
        promoData: Promo;
        entity: Client | Admin | Agent;
        role: "client" | "agent" | "admin";
      }
    >({
      query: ({ promoData }) => ({
        url: `/promos`,
        method: "POST",

        body: {
          ...promoData,
          startDate: promoData.startDate.toISOString(),
          endDate: promoData.endDate.toISOString(),
          createdAt: promoData.createdAt.toISOString(),
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { entity, role } = arg;

          if (!entity || !role) {
            throw new Error("No entity or role provided.");
          }

          dispatch(addOrUpdatePromo(data));
        } catch (error) {
          // Handle error
          console.error("Failed to create promo:", error);
        }
      },

      invalidatesTags: [{ type: "Promo", id: "LIST" }],
    }),

    // Update Promo Mutation
    updatePromo: builder.mutation<
      Promo,
      {
        _id: string; // Promo ID to be updated
        promoData: Promo; // Partial promo data to be updated
        entity: Client | Admin | Agent;
        role: "client" | "agent" | "admin";
      }
    >({
      query: ({ _id, promoData }) => ({
        url: `/promos/${_id}`,
        method: "PATCH",

        body: {
          ...promoData,
          startDate: promoData.startDate.toISOString(),
          endDate: promoData.endDate.toISOString(),
          createdAt: promoData.createdAt.toISOString(),
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { entity, role } = arg;

          if (!entity || !role) {
            throw new Error("No entity or role provided.");
          }

          dispatch(addOrUpdatePromo(data));
        } catch (error) {
          // Handle error
          console.error("Failed to update promo:", error);
        }
      },
      invalidatesTags: [{ type: "Promo", id: "LIST" }],
    }),
  }),
});

export const {
  useGetVisitsQuery,
  useGetPromosQuery,
  useCreateVisitMutation,
  useUpdateVisitMutation,
  useCreatePromoMutation,
  useUpdatePromoMutation,
} = promoVisitApi;
