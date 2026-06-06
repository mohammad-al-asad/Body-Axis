import { baseApi } from '../baseApi';

export interface SubscriptionStatus {
  active: boolean;
  entitlement_id: string;
  product_id: string | null;
  store: string | null;
  environment: string | null;
  expires_at: string | null;
  will_renew: boolean | null;
  management_url: string | null;
  last_event_type: string | null;
  updated_at: string | null;
}

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionStatus: builder.query<SubscriptionStatus, void>({
      query: () => ({
        url: '/subscription/me',
        method: 'GET',
      }),
      providesTags: ['Subscription'],
    }),

    syncSubscriptionStatus: builder.mutation<SubscriptionStatus, void>({
      query: () => ({
        url: '/subscription/sync',
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),
  }),
});

export const {
  useGetSubscriptionStatusQuery,
  useSyncSubscriptionStatusMutation,
} = subscriptionApi;
