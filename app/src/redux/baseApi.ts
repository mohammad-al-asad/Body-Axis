import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8001/api/v1';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
  }),
  tagTypes: ['Auth'],
  endpoints: () => ({}),
});
