import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Agent, Client, MovementDetail } from "../models/models";
import {
  loadAgentDetailsData,
  loadClientDetailsData,
  loadJsonData,
  mapDataToAgents,
  mapDataToMinimalAgents,
  mapDataToMinimalClients,
  mapDataToModels,
  mapDataToMovementDetails,
} from "../utils/dataLoader";

const baseUrl = process.env.REACT_APP_API_BASE_URL || "/";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getMinimalClients: builder.query<Client[], void>({
      queryFn: async () => {
        try {
          const data = await loadJsonData();
          const minimalClients = mapDataToMinimalClients(data);
          return { data: minimalClients };
        } catch (error) {
          const errorMessage = (error as Error).message;
          return { error: { status: "CUSTOM_ERROR", error: errorMessage } };
        }
      },
      keepUnusedDataFor: 60 * 20,
    }),
    getClients: builder.query<Client[], void>({
      queryFn: async () => {
        try {
          const [data, clientDetails, agentDetails] = await Promise.all([
            loadJsonData(),
            loadClientDetailsData(),
            loadAgentDetailsData(),
          ]);
          const clients = await mapDataToModels(data, clientDetails, agentDetails);
          return { data: clients };
        } catch (error) {
          const errorMessage = (error as Error).message;
          return { error: { status: "CUSTOM_ERROR", error: errorMessage } };
        }
      },
      keepUnusedDataFor: 60 * 20,
    }),
    getClientById: builder.query<Client, string>({
      queryFn: async (clientId) => {
        try {
          const [data, clientDetails, agentDetails] = await Promise.all([
            loadJsonData(),
            loadClientDetailsData(),
            loadAgentDetailsData(),
          ]);
          const clients = await mapDataToModels(data, clientDetails, agentDetails);
          const client = clients.find((client) => client.id === clientId);
          if (!client) {
            throw new Error("Client not found");
          }
          return { data: client };
        } catch (error) {
          const errorMessage = (error as Error).message;
          return { error: { status: "CUSTOM_ERROR", error: errorMessage } };
        }
      },
      keepUnusedDataFor: 60 * 20,
    }),
    getMinimalAgents: builder.query<Agent[], void>({
      queryFn: async () => {
        try {
          const data = await loadJsonData();
          const minimalAgents = mapDataToMinimalAgents(data);
          return { data: minimalAgents };
        } catch (error) {
          const errorMessage = (error as Error).message;
          return { error: { status: "CUSTOM_ERROR", error: errorMessage } };
        }
      },
      keepUnusedDataFor: 60 * 2,
    }),
    getAgents: builder.query<Agent[], void>({
      queryFn: async () => {
        try {
          const [data, agentDetails] = await Promise.all([
            loadJsonData(),
            loadAgentDetailsData(),
          ]);
          const agents = await mapDataToAgents(data, agentDetails);
          return { data: agents };
        } catch (error) {
          const errorMessage = (error as Error).message;
          return { error: { status: "CUSTOM_ERROR", error: errorMessage } };
        }
      },
      keepUnusedDataFor: 60 * 20,
    }),
    getAgentDetails: builder.query<Agent[], void>({
      queryFn: async () => {
        try {
          const agentDetails = await loadAgentDetailsData();
          return { data: agentDetails };
        } catch (error) {
          const errorMessage = (error as Error).message;
          return { error: { status: "CUSTOM_ERROR", error: errorMessage } };
        }
      },
      keepUnusedDataFor: 60 * 20,
    }),
    getAdminData: builder.query<{ agents: Agent[]; clients: Client[] }, void>({
      queryFn: async () => {
        try {
          const [data, clientDetails, agentDetails] = await Promise.all([
            loadJsonData(),
            loadClientDetailsData(),
            loadAgentDetailsData(),
          ]);
          const clients = await mapDataToModels(data, clientDetails, agentDetails);
          const agents = await mapDataToAgents(data, agentDetails);
          return { data: { agents, clients } };
        } catch (error) {
          const errorMessage = (error as Error).message;
          return { error: { status: "CUSTOM_ERROR", error: errorMessage } };
        }
      },
      keepUnusedDataFor: 60 * 20,
    }),
    getMovementDetails: builder.query<MovementDetail[], void>({
      queryFn: async () => {
        try {
          const data = await loadJsonData();
          const movementDetails = mapDataToMovementDetails(data);
          return { data: movementDetails };
        } catch (error) {
          const errorMessage = (error as Error).message;
          return { error: { status: "CUSTOM_ERROR", error: errorMessage } };
        }
      },
      keepUnusedDataFor: 60 * 20,
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useGetAgentsQuery,
  useGetMinimalClientsQuery,
  useGetMinimalAgentsQuery,
  useGetAgentDetailsQuery,
  useGetAdminDataQuery,
  useGetMovementDetailsQuery,
} = api;
