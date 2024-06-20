// services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Client, Agent, MovementDetail } from "../models/models";
import { loadJsonData, mapDataToMinimalClients, mapDataToMinimalAgents, mapDataToAgents, mapDataToMovementDetails, mapDataToClients } from "../utils/dataLoader";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  endpoints: (builder) => ({
    getMinimalClients: builder.query<Client[], void>({
      queryFn: async () => {
        try {
          const data = await loadJsonData("datasetsfrom01JANto12JUN.json");
          const minimalClients = mapDataToMinimalClients(data);
          return { data: minimalClients };
        } catch (error) {
          const errorMessage = (error as Error).message;
          return { error: { status: "CUSTOM_ERROR", error: errorMessage } };
        }
      },
    }),
    getClients: builder.query<Client[], void>({
      queryFn: async () => {
        try {
          const data = await loadJsonData("datasetsfrom01JANto12JUN.json");
          const clients = await mapDataToClients(data); // Use the worker script for processing clients data
          return { data: clients };
        } catch (error) {
          const errorMessage = (error as Error).message;
          return { error: { status: "CUSTOM_ERROR", error: errorMessage } };
        }
      },
    }),
    getClientById: builder.query<Client, string>({
      queryFn: async (clientId) => {
        try {
          const data = await loadJsonData("datasetsfrom01JANto12JUN.json");
          const clients = await mapDataToClients(data);
          const client = clients.find(client => client.id === clientId);
          if (!client) {
            throw new Error('Client not found');
          }
          return { data: client };
        } catch (error) {
          const errorMessage = (error as Error).message;
          return { error: { status: "CUSTOM_ERROR", error: errorMessage } };
        }
      },
    }),
    getMinimalAgents: builder.query<Agent[], void>({
      queryFn: async () => {
        try {
          const data = await loadJsonData("datasetsfrom01JANto12JUN.json");
          const minimalAgents = mapDataToMinimalAgents(data);
          return { data: minimalAgents };
        } catch (error) {
          const errorMessage = (error as Error).message;
          return { error: { status: "CUSTOM_ERROR", error: errorMessage } };
        }
      },
    }),
    getAgents: builder.query<Agent[], void>({
      queryFn: async () => {
        try {
          const data = await loadJsonData("datasetsfrom01JANto12JUN.json");
          const agents = mapDataToAgents(data);
          return { data: agents };
        } catch (error) {
          const errorMessage = (error as Error).message;
          return { error: { status: "CUSTOM_ERROR", error: errorMessage } };
        }
      },
    }),
    getMovementDetails: builder.query<MovementDetail[], void>({
      queryFn: async () => {
        try {
          const data = await loadJsonData("datasetsfrom01JANto12JUN.json");
          const movementDetails = mapDataToMovementDetails(data);
          return { data: movementDetails };
        } catch (error) {
          const errorMessage = (error as Error).message;
          return { error: { status: "CUSTOM_ERROR", error: errorMessage } };
        }
      },
    }),
  }),
});

export const { useGetClientsQuery, useGetClientByIdQuery, useGetAgentsQuery, useGetMinimalClientsQuery, useGetMinimalAgentsQuery, useGetMovementDetailsQuery } = api;
