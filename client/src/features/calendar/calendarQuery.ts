/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createApi /* fetchBaseQuery */ } from "@reduxjs/toolkit/query/react";
import { AxiosError } from "axios";
import { CalendarEvent, Holiday } from "../../models/dataModels";
import {
  CreateEventPayload,
  GetEventsByMonthResponse,
  UpdateEventStatusPayload,
} from "../../models/propsModels";
/* import { getAccessToken } from "../../services/tokenService";
 */ import { axiosInstance } from "../../utils/apiUtils";

/* const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
 */
const currentLocale = (navigator.language || navigator.languages[0]).replace(
  /^[a-z]{2}-/,
  ""
);
/* console.debug(`Modified locale (region only): ${currentLocale}`);
 */

// Utility function to convert strings to Date objects
const normalizeDate = (date: string | Date): Date => {
  // Only convert if the date is a string
  return typeof date === "string" ? new Date(date) : date;
};

/* const accessToken = getAccessToken();
 */
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

export const calendarApi = createApi({
  reducerPath: "calendarApi",
  baseQuery: baseQueryWithAxios, // Default to the query with credentials
  tagTypes: ["CalendarEvent"],
  endpoints: (builder) => ({
    getEventsByMonthForAdmin: builder.query<
      CalendarEvent[],
      { year: number; month: number }
    >({
      query: ({ year, month }) => ({
        url: `/calendar/events/admin`,
        method: "GET",
        params: { year, month },
      }),
      transformResponse: (response: GetEventsByMonthResponse) => {
        // Convert date strings to Date objects
        return response.map((event) => ({
          ...event,
          createdAt: normalizeDate(event.createdAt),
          startDate: normalizeDate(event.startDate),
          endDate: normalizeDate(event.endDate),
          updatedAt: normalizeDate(event.updatedAt),
        }));
      },
      providesTags: (result) =>
        result
          ? result.map(({ _id }) => ({ type: "CalendarEvent", _id }))
          : ["CalendarEvent"],
    }),

    getEventsByStatusAndUser: builder.query<
      CalendarEvent[],
      { year: number; month: number }
    >({
      query: ({ year, month }) => ({
        url: `/calendar/events/user`,
        method: "GET",
        params: { year, month },
      }),
      transformResponse: (response: GetEventsByMonthResponse) => {
        // Normalize date strings to Date objects
        return response.map((event) => ({
          ...event,
          createdAt: normalizeDate(event.createdAt),
          startDate: normalizeDate(event.startDate),
          endDate: normalizeDate(event.endDate),
          updatedAt: normalizeDate(event.updatedAt),
        }));
      },
      providesTags: (result) => {
        if (result && Array.isArray(result)) {
          /*           console.log("User Events Fetched:", result);
           */ return result.map(
            ({ _id }) => ({ type: "CalendarEvent", _id: _id } as const)
          );
        } else {
          console.error("No User Events Found or Fetch Failed.");
          return ["CalendarEvent"];
        }
      },
    }),

    createEvent: builder.mutation<CalendarEvent, CreateEventPayload>({
      query: (newEvent) => {
        console.log("Creating new event:", newEvent);
        return {
          url: "calendar/events",
          method: "POST",
          data: newEvent,
        };
      },
      invalidatesTags: ["CalendarEvent"],
    }),
    updateEventStatus: builder.mutation<
      CalendarEvent,
      UpdateEventStatusPayload
    >({
      query: ({ eventId, status }) => ({
        url: `calendar/events/${eventId}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: "CalendarEvent", _id: eventId },
      ],
    }),
    deleteEvent: builder.mutation<{ message: string }, string>({
      query: (eventId) => ({
        url: `calendar/events/${eventId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, eventId) => [
        { type: "CalendarEvent", _id: eventId },
      ],
    }),
    // Mutation to edit a calendar event
    editEvent: builder.mutation<
      CalendarEvent,
      { eventId: string; data: Partial<CreateEventPayload> }
    >({
      query: ({ eventId, data }) => ({
        url: `calendar/events/${eventId}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: "CalendarEvent", _id: eventId },
      ],
    }),

    // Public API endpoint
    getHolidays: builder.query<Holiday[], { year: number }>({
      async queryFn({ year }, _queryApi, _extraOptions, fetchWithBQ) {
        let countryCode = "IT"; // Default to Italy

        /*         console.debug(`Current locale: ${currentLocale}`);
         */ // Map i18n language to the country code
        countryCode = currentLocale.toUpperCase();
        /*         console.debug(`Country code set to: ${countryCode}`);
         */ const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;

        try {
          const result = await fetchWithBQ({
            url,
            method: "GET",
            credentials: "omit", // Explicitly omit credentials for CORS compliance
          });

          if (result.error) {
            // Ensure the error object matches the expected structure
            return {
              error: {
                status: result.error.status,
                data: result.error.data || {},
              },
            };
          }

          return { data: result.data as Holiday[] };
        } catch (error) {
          // Ensure the caught error is properly formatted
          return {
            error: {
              status: 500,
              data: { message: String(error) },
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetEventsByMonthForAdminQuery,
  useGetEventsByStatusAndUserQuery,
  useCreateEventMutation,
  useUpdateEventStatusMutation,
  useEditEventMutation, // Newly added
  useDeleteEventMutation, // Newly added
  useGetHolidaysQuery,
} = calendarApi;
