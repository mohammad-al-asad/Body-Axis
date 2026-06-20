import { baseApi } from '../baseApi';
import type { AuthUser } from './authApi';
import { updateUser } from '../slice/auth';

export interface IntakeRequest {
  pain_points: string[];
  primary_goal: string;
  schedule_days: number;
  schedule_weeks: number;
  session_duration: number;
  session_name?: string;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    saveIntake: builder.mutation<AuthUser, IntakeRequest>({
      query: (body) => ({
        url: '/users/intake',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Dynamically update the user inside Auth state directly when successful
          dispatch(updateUser(data));
        } catch {}
      },
    }),
  }),
});

export const { useSaveIntakeMutation } = userApi;
