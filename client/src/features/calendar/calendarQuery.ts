/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
//src/features/calendar/calendarQuery.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { AxiosError } from "axios";
import { CalendarEvent, Holiday } from "../../models/dataModels";
import {
  CreateEventPayload,
  GetEventsByMonthResponse,
  UpdateEventStatusPayload,
} from "../../models/propsModels";
import { axiosInstance } from "../../utils/apiUtils";

const currentLocale = (navigator.language || navigator.languages[0]).replace(
  /^[a-z]{2}-/,
  ""
);

//console.debug(`Modified locale (region only): ${currentLocale}`);

// Utility function to convert strings to Date objects
const normalizeDate = (date: string | Date): Date => {
  return typeof date === "string" ? new Date(date) : date;
};

// Base query with axios instance to manage access/refresh tokens
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
  baseQuery: baseQueryWithAxios,
  tagTypes: ["CalendarEvent"],
  endpoints: (builder) => ({
    getEventsByMonth: builder.query<
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
      providesTags: (result) => [
        { type: "CalendarEvent", id: "LIST" },
        ...(result?.map(({ _id }) => ({
          type: "CalendarEvent" as const,
          id: _id,
        })) ?? []),
      ],
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
      invalidatesTags: [{ type: "CalendarEvent", id: "LIST" }],
    }),
    updateEventStatus: builder.mutation<
      CalendarEvent,
      UpdateEventStatusPayload
    >({
      query: ({ eventId, status }) => {
        console.log("Updating event status:", { eventId, status });
        return {
          url: `calendar/events/${eventId}/status`,
          method: "PATCH",
          data: { status },
        };
      },
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: "CalendarEvent", id: "LIST" },
        { type: "CalendarEvent", id: eventId },
      ],
    }),
    deleteEvent: builder.mutation<{ message: string }, string>({
      query: (eventId) => ({
        url: `calendar/events/${eventId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, eventId) => [
        { type: "CalendarEvent", id: "LIST" },
        { type: "CalendarEvent", id: eventId },
      ],
    }),
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
        { type: "CalendarEvent", id: "LIST" },
        { type: "CalendarEvent", id: eventId },
      ],
    }),

    // Public API endpoint
    getHolidays: builder.query<Holiday[], { year: number }>({
      async queryFn({ year }, _queryApi, _extraOptions, fetchWithBQ) {
        let countryCode = "IT"; // Default to Italy

        // console.debug(`Current locale: ${currentLocale}`);
        // Map i18n language to the country code
        countryCode = currentLocale.toUpperCase();
        //console.debug(`Country code set to: ${countryCode}`);
        const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;

        try {
          const result = await fetchWithBQ({
            url,
            method: "GET",
            credentials: "omit",
          });

          if (result.error) {
            return {
              error: {
                status: result.error.status,
                data: result.error.data || {},
              },
            };
          }

          return { data: result.data as Holiday[] };
        } catch (error) {
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
  useGetEventsByMonthQuery,
  useCreateEventMutation,
  useUpdateEventStatusMutation,
  useEditEventMutation,
  useDeleteEventMutation,
  useGetHolidaysQuery,
} = calendarApi;
