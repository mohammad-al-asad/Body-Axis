import { baseApi } from '../baseApi';

export type AuthProvider = 'password' | 'google' | 'apple';
export type Gender = 'male' | 'female' | 'other';
export type OtpPurpose = 'email_verify' | 'forgot_password';

export interface AuthUser {
  id: string;
  full_name: string | null;
  email: string;
  gender: Gender | null;
  date_of_birth: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  avatar_url?: string | null;
  email_verified: boolean;
  auth_provider: AuthProvider;
  is_intake_completed: boolean;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  token_type: 'bearer';
  user: AuthUser;
  dev_otp?: string | null;
}

export interface SignupRequest {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  gender: Gender;
  date_of_birth: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpRequest {
  email: string;
  purpose: OtpPurpose;
}

export interface OtpResponse {
  message: string;
  dev_otp?: string | null;
}

export interface OtpVerifyRequest {
  email: string;
  purpose: OtpPurpose;
  otp_code: string;
  new_password?: string;
  confirm_new_password?: string;
}

export interface OtpVerifyResponse {
  message: string;
  verified: boolean;
}

export interface GoogleSignInRequest {
  id_token: string;
}

export interface AppleSignInRequest {
  identity_token: string;
  full_name?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (body) => ({
        url: '/auth/signup',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    requestOtp: builder.mutation<OtpResponse, OtpRequest>({
      query: (body) => ({
        url: '/auth/otp/request',
        method: 'POST',
        body,
      }),
    }),

    verifyOtp: builder.mutation<OtpVerifyResponse, OtpVerifyRequest>({
      query: (body) => ({
        url: '/auth/otp/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    googleSignIn: builder.mutation<AuthResponse, GoogleSignInRequest>({
      query: (body) => ({
        url: '/auth/google',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    appleSignIn: builder.mutation<AuthResponse, AppleSignInRequest>({
      query: (body) => ({
        url: '/auth/apple',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useGoogleSignInMutation,
  useAppleSignInMutation,
} = authApi;
