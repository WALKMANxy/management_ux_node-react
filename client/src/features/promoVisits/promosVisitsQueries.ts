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

// Define types for entities and roles to avoid repetition
type Entity = Client | Admin | Agent;
type Role = "client" | "agent" | "admin";

// Unified API slice for handling visits and promos
export const promoVisitApi = createApi({
  reducerPath: "promoVisitApi",
  baseQuery: baseQueryWithAxios,
  tagTypes: ["Visit", "Promo", "Client", "Agent", "Admin"],
  endpoints: (builder) => ({
    // Fetch Visits Query
    getVisits: builder.query<Visit[], { entity: Entity; role: Role; id?: string }>({
      query: ({ role, id }) => {
        const params = new URLSearchParams({ role });

        // If the role is 'client', include the 'id' in the query parameters
        if (role === "client" && id) {
          params.append("clientId", id);
        }

        return {
          url: `/visits?${params.toString()}`,
          method: "GET",
        };
      },
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
    getPromos: builder.query<Promo[], { entity: Entity; role: Role }>({
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
        entity: Entity;
        role: Role;
      }
    >({
      query: ({ visitData }) => {
        console.log("Debug: Visit Data in Query", visitData);

        return {
          url: "/visits", // Ensure URL is a string
          method: "POST",
          data: {
            // Use 'data' instead of 'body'
            ...visitData,
            date: new Date(visitData.date).toISOString(),
            createdAt: new Date(visitData.createdAt).toISOString(),
          },
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          console.log("Debug: onQueryStarted Argument", arg);

          const { data } = await queryFulfilled;
          console.log("Debug: Query Fulfilled Data", data);

          const { entity, role } = arg;

          console.log("Debug: Entity and Role", entity, role);

          if (!entity || !role) {
            console.error("Debug: No entity or role provided.");
            throw new Error("No entity or role provided.");
          }

          dispatch(addOrUpdateVisit(data));
          console.log("Debug: Visit added or updated successfully", data);
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
        visitData: Partial<Visit>; // Partial visit data to be updated
        entity: Entity;
        role: Role;
      }
    >({
      query: ({ _id, visitData }) => ({
        url: `/visits/${_id}`, // Ensure URL is a string with the ID
        method: "PATCH",
        data: {
          // Use 'data' instead of 'body'
          ...visitData,
          // Check if date fields exist before converting
          ...(visitData.date && {
            date: new Date(visitData.date).toISOString(),
          }),
          ...(visitData.createdAt && {
            createdAt: new Date(visitData.createdAt).toISOString(),
          }),
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
        entity: Entity;
        role: Role;
      }
    >({
      query: ({ promoData }) => {
        console.log("Debug: Promo Data in Query", promoData);

        return {
          url: "/promos", // Ensure URL is a string
          method: "POST",
          data: {
            // Use 'data' instead of 'body'
            ...promoData,
            startDate: new Date(promoData.startDate).toISOString(),
            endDate: new Date(promoData.endDate).toISOString(),
            createdAt: new Date(promoData.createdAt).toISOString(),
          },
        };
      },
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
        promoData: Partial<Promo>; // Partial promo data to be updated
        entity: Entity;
        role: Role;
      }
    >({
      query: ({ _id, promoData }) => ({
        url: `/promos/${_id}`, // Ensure URL is a string with the ID
        method: "PATCH",
        data: {
          // Use 'data' instead of 'body'
          ...promoData,
          // Check if date fields exist before converting
          ...(promoData.startDate && {
            startDate: new Date(promoData.startDate).toISOString(),
          }),
          ...(promoData.endDate && {
            endDate: new Date(promoData.endDate).toISOString(),
          }),
          ...(promoData.createdAt && {
            createdAt: new Date(promoData.createdAt).toISOString(),
          }),
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
