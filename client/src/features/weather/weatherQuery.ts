//src/features/weather/weatherQuery.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const weatherApi = createApi({
  reducerPath: "weatherApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.open-meteo.com/v1/" }),
  tagTypes: ["Weather"],
  endpoints: (builder) => ({
    getWeather: builder.query({
      query: ({ latitude, longitude }) =>
        `forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`,
      providesTags: (_result, _error, { latitude, longitude }) => [
        { type: "Weather" as const, id: `${latitude}-${longitude}` },
      ],
    }),
  }),
  keepUnusedDataFor: 3 * 60 * 60, // Cache the data for 3 hours
});

export const { useGetWeatherQuery, useLazyGetWeatherQuery } = weatherApi;
