// src/store/queries/userQueries.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User } from "../../models/entityModels";
import {
  generateErrorResponse,
  handleApiError,
} from "../../utils/errorHandling";
import { apiCall } from "../api/apiUtils";

// Define the RTK Query slice
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // Endpoint to fetch users by a batch of IDs
    fetchUsersByIds: builder.query<Partial<User>[], string[]>({
      queryFn: async (ids) => {
        try {
          // Fetch users by a batch of IDs
          const users = await apiCall<Partial<User>[]>(`users/batch`, "POST", { ids });
          return { data: users };
        } catch (error) {
          handleApiError(error, "fetchUsersByIds");
          return generateErrorResponse(error);
        }
      },
      providesTags: (result) =>
        result
          ? result.map(({ _id }) => ({ type: "User", id: _id }))
          : ["User"],
    }),

    // Endpoint to fetch a single user by ID
    getUserById: builder.query<User, string>({
      queryFn: async (id) => {
        try {
          // Fetch a user by ID
          const user = await apiCall<User>(`users/${id}`, "GET");
          return { data: user };
        } catch (error) {
          handleApiError(error, "getUserById");
          return generateErrorResponse(error);
        }
      },
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),

    // Endpoint to fetch all users
    getAllUsers: builder.query<User[], void>({
      queryFn: async () => {
        try {
          // Fetch all users
          const users = await apiCall<User[]>(`users`, "GET");
          return { data: users };
        } catch (error) {
          handleApiError(error, "getAllUsers");
          return generateErrorResponse(error);
        }
      },
      providesTags: ["User"],
    }),

    // Endpoint to update a user by ID
    updateUserById: builder.mutation<User, { id: string; updatedData: Partial<User> }>({
      queryFn: async ({ id, updatedData }) => {
        try {
          // Update user data
          const updatedUser = await apiCall<User>(`users/${id}`, "PATCH", updatedData);
          return { data: updatedUser };
        } catch (error) {
          handleApiError(error, "updateUserById");
          return generateErrorResponse(error);
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "User", id }],
    }),
  }),
});

export const {
  useFetchUsersByIdsQuery,
  useGetUserByIdQuery,
  useGetAllUsersQuery,
  useUpdateUserByIdMutation,
} = userApi;
