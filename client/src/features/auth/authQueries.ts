// services/api.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User } from "../../models/entityModels";
import { baseUrl } from "../../utils/apiUtils";
import { generateErrorResponse } from "../../utils/errorHandling"; // Import error handling functions
import { getAllUsers, getUserById, updateUserById } from "../users/api/users";
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "./api/auth";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getUserById: builder.query<User, string>({
      queryFn: async (id) => {
        try {
          const result = await getUserById(id);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    getAllUsers: builder.query<User[], void>({
      queryFn: async () => {
        try {
          const result = await getAllUsers();
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    updateUserById: builder.mutation<
      User,
      { id: string; updatedData: Partial<User> }
    >({
      queryFn: async ({ id, updatedData }) => {
        try {
          const result = await updateUserById(id, updatedData);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    registerUser: builder.mutation<
      { message: string; statusCode: number },
      { email: string; password: string }
    >({
      queryFn: async (credentials) => {
        try {
          const { message, statusCode } = await registerUser(credentials);
          return { data: { message, statusCode } };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    loginUser: builder.mutation<
      { redirectUrl: string; id: string; message: string; statusCode: number },
      { email: string; password: string }
    >({
      queryFn: async (credentials) => {
        try {
          const { redirectUrl, id, message, statusCode } = await loginUser(
            credentials
          );
          return { data: { redirectUrl, id, message, statusCode } };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    requestPasswordReset: builder.mutation<
      { message: string; statusCode: number },
      string
    >({
      queryFn: async (email) => {
        try {
          const { message, statusCode } = await requestPasswordReset(email);
          return { data: { message, statusCode } };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    resetPassword: builder.mutation<
      { message: string; statusCode: number },
      { token: string; passcode: string; newPassword: string }
    >({
      queryFn: async ({ token, passcode, newPassword }) => {
        try {
          const { message, statusCode } = await resetPassword(
            token,
            passcode,
            newPassword
          );
          return { data: { message, statusCode } };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),

    getUserRoleById: builder.query<User, string>({
      queryFn: async (id) => {
        try {
          const result = await getUserById(id);
          return { data: result };
        } catch (error) {
          return generateErrorResponse(error);
        }
      },
    }),
  }),
});

export const {
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useGetUserByIdQuery,
  useGetAllUsersQuery,
  useUpdateUserByIdMutation,
  useLoginUserMutation,
  useRegisterUserMutation,
} = authApi;
