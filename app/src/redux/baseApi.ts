import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const rawBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8001/api/v1';

const rootUrl = rawBaseUrl.replace(/\/api\/v[0-9]+\/?$/, '').replace(/\/+$/, '');
const v1BaseUrl = `${rootUrl}/api/v1`;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: v1BaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as {
      auth?: {
        accessToken?: string | null;
        tokenType?: string | null;
      };
    };
    const accessToken = state.auth?.accessToken;

    if (accessToken) {
      headers.set('Authorization', `${state.auth?.tokenType ?? 'bearer'} ${accessToken}`);
    }

    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: async (args, api, extraOptions) => {
    let adjustedArgs = typeof args === 'string' ? { url: args } : { ...args };
    if (adjustedArgs.url.startsWith('/api/v2')) {
      adjustedArgs.url = `${rootUrl}${adjustedArgs.url}`;
    } else if (adjustedArgs.url.startsWith('/v2')) {
      adjustedArgs.url = `${rootUrl}/api${adjustedArgs.url}`;
    }
    return rawBaseQuery(adjustedArgs, api, extraOptions);
  },
  tagTypes: ['Auth', 'Subscription', 'Sessions'],
  endpoints: () => ({}),
});

