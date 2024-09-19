// src/features/data/promoVisitApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Promo, Visit } from "../../models/dataModels";
import { Admin, Agent, Client } from "../../models/entityModels";
import { mapPromosToEntity, mapVisitsToEntity } from "../../utils/dataLoader";
import {
  addOrUpdatePromo,
  addOrUpdateVisit,
  setCurrentUserPromos,
  setCurrentUserVisits,
} from "./dataSlice";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

// Unified API slice for handling visits and promos
export const promoVisitApi = createApi({
  reducerPath: "promoVisitApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include", // Ensures credentials (cookies, etc.) are sent with each request
  }),
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
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
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
