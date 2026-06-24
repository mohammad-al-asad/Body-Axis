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

export interface UpdateProfileRequest {
  full_name: string;
  email?: string;
  gender: string;
  date_of_birth: string;
  height_cm?: number | null;
  weight_kg?: number | null;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    saveIntake: builder.mutation<AuthUser, IntakeRequest>({
      query: (body) => ({
        url: '/users/intake',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth', 'Sessions'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Dynamically update the user inside Auth state directly when successful
          dispatch(updateUser(data));
        } catch {}
      },
    }),
    getProfile: builder.query<AuthUser, void>({
      query: () => '/users/me',
      providesTags: ['Auth'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateUser(data));
        } catch {}
      },
    }),
    updateProfile: builder.mutation<AuthUser, UpdateProfileRequest>({
      query: (body) => ({
        url: '/users/me',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateUser(data));
        } catch {}
      },
    }),
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({
        url: '/users/password',
        method: 'PUT',
        body,
      }),
    }),
    deleteAccount: builder.mutation<void, void>({
      query: () => ({
        url: '/users/me',
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useSaveIntakeMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} = userApi;
