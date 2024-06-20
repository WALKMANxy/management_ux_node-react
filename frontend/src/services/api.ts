import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Client, Agent } from "../models/models";
import { loadJsonData, mapDataToModels, mapDataToAgents } from "../utils/dataLoader";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  endpoints: (builder) => ({
    getClients: builder.query<Client[], void>({
      queryFn: async () => {
        try {
          const data = await loadJsonData("datasetsfrom01JANto12JUN.json");
          const clients = await mapDataToModels(data);
          return { data: clients };
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
  }),
});

export const { useGetClientsQuery, useGetAgentsQuery } = api;
