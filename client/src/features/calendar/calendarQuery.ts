import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import i18n from "../../i18n";
import { CalendarEvent, Holiday } from "../../models/dataModels";
import {
  CreateEventPayload,
  GetEventsByMonthResponse,
  UpdateEventStatusPayload,
} from "../../models/propsModels";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
const currentLocale = i18n.language;

// Utility function to convert strings to Date objects
const normalizeDate = (date: string | Date): Date => {
  // Only convert if the date is a string
  return typeof date === "string" ? new Date(date) : date;
};

// Base query for your server endpoints
const baseQueryWithCredentials = fetchBaseQuery({
  baseUrl,
  credentials: "include",
});

export const calendarApi = createApi({
  reducerPath: "calendarApi",
  baseQuery: baseQueryWithCredentials, // Default to the query with credentials
  tagTypes: ["CalendarEvent"],
  endpoints: (builder) => ({
    getEventsByMonthForAdmin: builder.query<
      CalendarEvent[],
      { year: number; month: number }
    >({
      query: ({ year, month }) =>
        `calendar/events/admin?year=${year}&month=${month}`,
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
      GetEventsByMonthResponse,
      { year: number; month: number }
    >({
      query: ({ year, month }) => {
        // Debugging: Log the query parameters
        console.log("Fetching User Events:", { year, month });

        return `calendar/events/user?year=${year}&month=${month}`;
      },
      providesTags: (result) => {
        if (result && result) {
          // Debugging: Log the result events
          console.log("User Events Fetched:", result);

          return result.map(
            ({ _id }) => ({ type: "CalendarEvent", _id: _id } as const)
          );
        } else {
          console.log("No User Events Found or Fetch Failed.");
          return ["CalendarEvent"];
        }
      },
    }),

    createEvent: builder.mutation<CalendarEvent, CreateEventPayload>({
      query: (newEvent) => ({
        url: "calendar/events",
        method: "POST",
        body: newEvent,
      }),
      invalidatesTags: ["CalendarEvent"],
    }),
    updateEventStatus: builder.mutation<
      CalendarEvent,
      UpdateEventStatusPayload
    >({
      query: ({ eventId, status }) => ({
        url: `calendar/events/${eventId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: "CalendarEvent", _id: eventId },
      ],
    }),
    // Public API endpoint
    getHolidays: builder.query<Holiday[], void>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const currentYear = new Date().getFullYear();
        let countryCode = "IT"; // Default to Italy

        // Map i18n language to the country code
        if (currentLocale === "en") {
          countryCode = "US"; // For example, US for English
        } else if (currentLocale === "it") {
          countryCode = "IT"; // Italy
        }

        const url = `https://date.nager.at/api/v3/PublicHolidays/${currentYear}/${countryCode}`;
        console.log(
          `Fetching holidays for ${currentYear} in ${countryCode} from ${url}`
        );

        try {
          const result = await fetchWithBQ({
            url,
            method: "GET",
            ..._queryApi,
            ...(_extraOptions || {}),
            credentials: "omit", // Explicitly omit credentials for CORS compliance
          });

          if (result.error) {
            return { error: result.error };
          }

          return { data: result.data as Holiday[] };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
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
  useGetHolidaysQuery,
} = calendarApi;
