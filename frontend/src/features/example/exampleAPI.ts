import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const exampleAPI = createApi({
  reducerPath: 'exampleAPI',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }), // Base URL (not used in mock)
  endpoints: (builder) => ({
    getExample: builder.query<any, void>({
      query: () => 'api/example', // Define a dummy endpoint path
    }),
  }),
});

export const { useGetExampleQuery } = exampleAPI;
