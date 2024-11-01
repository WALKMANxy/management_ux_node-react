// src/features/users/userQueries.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User } from "../../models/entityModels";
import {
  generateErrorResponse,
  handleApiError,
} from "../../services/errorHandling";
import { apiCall } from "../../utils/apiUtils";

// Define the RTK Query slice
export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    fetchUsersByIds: builder.query<Partial<User>[], string[]>({
      queryFn: async (ids) => {
        try {
          const users = await apiCall<Partial<User>[]>(`users/batch`, "POST", {
            ids,
          });
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

    getUserById: builder.query<User, string>({
      queryFn: async (id) => {
        try {
          const user = await apiCall<User>(`users/${id}`, "GET");
          return { data: user };
        } catch (error) {
          handleApiError(error, "getUserById");
          return generateErrorResponse(error);
        }
      },
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),

    getAllUsers: builder.query<User[], void>({
      queryFn: async () => {
        try {
          const users = await apiCall<User[]>(`users`, "GET");
          return { data: users };
        } catch (error) {
          handleApiError(error, "getAllUsers");
          return generateErrorResponse(error);
        }
      },
      providesTags: ["User"],
    }),
    updateUserById: builder.mutation<
      User,
      { id: string; updatedData: Partial<User> }
    >({
      queryFn: async ({ id, updatedData }) => {
        try {
          const updatedUser = await apiCall<User>(
            `users/${id}`,
            "PATCH",
            updatedData
          );
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
