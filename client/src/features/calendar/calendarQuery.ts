import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CalendarEvent, Holiday } from "../../models/dataModels";
import {
  CreateEventPayload,
  GetEventsByMonthResponse,
  UpdateEventStatusPayload,
} from "../../models/propsModels";
import { transformCalendarEvents } from "../../utils/calendarUtils";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

const currentLocale = (navigator.language || navigator.languages[0]).replace(
  /^[a-z]{2}-/,
  ""
);

const baseQueryWithCredentials = fetchBaseQuery({
  baseUrl,
  credentials: "include",
});

export const calendarApi = createApi({
  reducerPath: "calendarApi",
  baseQuery: baseQueryWithCredentials,
  tagTypes: ["CalendarEvent"],
  endpoints: (builder) => ({
    getEventsByMonthForAdmin: builder.query<
      CalendarEvent[],
      { year: number; month: number }
    >({
      query: ({ year, month }) =>
        `calendar/events/admin?year=${year}&month=${month}`,
      transformResponse: (response: GetEventsByMonthResponse) =>
        transformCalendarEvents(response),
      serializeQueryArgs: () => {
        return "getEvents";
      },

      merge: (currentCache, newItems) => {
        const eventMap = new Map(
          currentCache.map((event) => [event._id, event])
        );
        newItems.forEach((event) => eventMap.set(event._id, event));
        // Update the current cache in place
        currentCache.splice(
          0,
          currentCache.length,
          ...Array.from(eventMap.values())
        );
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "CalendarEvent" as const,
                id: _id,
              })),
              { type: "CalendarEvent", id: "PARTIAL-LIST" },
            ]
          : [{ type: "CalendarEvent", id: "PARTIAL-LIST" }],
    }),

    getEventsByStatusAndUser: builder.query<
      CalendarEvent[],
      { year: number; month: number }
    >({
      query: ({ year, month }) =>
        `calendar/events/user?year=${year}&month=${month}`,
      transformResponse: (response: GetEventsByMonthResponse) =>
        transformCalendarEvents(response),
      serializeQueryArgs: () => {
        return "getEvents";
      },

      merge: (currentCache, newItems) => {
        const eventMap = new Map(
          currentCache.map((event) => [event._id, event])
        );
        newItems.forEach((event) => eventMap.set(event._id, event));
        // Update the current cache in place
        currentCache.splice(
          0,
          currentCache.length,
          ...Array.from(eventMap.values())
        );
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "CalendarEvent" as const,
                id: _id,
              })),
              { type: "CalendarEvent", id: "PARTIAL-LIST" },
            ]
          : [{ type: "CalendarEvent", id: "PARTIAL-LIST" }],
    }),

    createEvent: builder.mutation<CalendarEvent, CreateEventPayload>({
      query: (newEvent) => ({
        url: "calendar/events",
        method: "POST",
        body: newEvent,
      }),
      invalidatesTags: [{ type: "CalendarEvent", id: "LIST" }],
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
        { type: "CalendarEvent", id: eventId },
        { type: "CalendarEvent", id: "PARTIAL-LIST" },
      ],
    }),

    deleteEvent: builder.mutation<{ message: string }, string>({
      query: (eventId) => ({
        url: `calendar/events/${eventId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, eventId) => [
        { type: "CalendarEvent", id: eventId },
        { type: "CalendarEvent", id: "LIST" },
      ],
      async onQueryStarted(eventId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          calendarApi.util.updateQueryData(
            "getEventsByMonthForAdmin",
            {
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
            },
            (draft) => {
              const index = draft.findIndex((event) => event._id === eventId);
              if (index !== -1) draft.splice(index, 1);
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    editEvent: builder.mutation<
      CalendarEvent,
      { eventId: string; data: Partial<CreateEventPayload> }
    >({
      query: ({ eventId, data }) => ({
        url: `calendar/events/${eventId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: "CalendarEvent", id: eventId },
        { type: "CalendarEvent", id: "PARTIAL-LIST" },
      ],
    }),

    getHolidays: builder.query<Holiday[], { year: number }>({
      async queryFn({ year }, _queryApi, _extraOptions, fetchWithBQ) {
        let countryCode = "IT";
        countryCode = currentLocale.toUpperCase();
        const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;

        try {
          const result = await fetchWithBQ({
            url,
            method: "GET",
            ..._queryApi,
            ...(_extraOptions || {}),
            credentials: "omit",
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
  useEditEventMutation,
  useDeleteEventMutation,
  useGetHolidaysQuery,
} = calendarApi;
