import { baseApi } from '../baseApi';

export interface CreateSessionRequest {
  target_area?: string;
  target_areas?: string[];
  pain_points?: string[];
  user_case?: string;
  primary_goal?: string;
  session_name?: string;
  schedule_days?: number;
  schedule_weeks?: number;
  session_duration?: number;
}

export interface SessionVideo {
  id: string;
  exercise_id: string;
  video_name: string;
  thumbnail_url: string;
  video_url: string;
}

export interface SessionExercise {
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  phase: 'reset' | 'control' | 'integrate';
  equipment_needed: string[];
  primary_intent?: string | null;
  secondary_benefits?: string | null;
  tutorial_video?: SessionVideo | null;
  short_clip_video?: SessionVideo | null;
}

export interface SessionPlanPhases {
  reset: SessionExercise[];
  control: SessionExercise[];
  integrate: SessionExercise[];
}

export interface SessionPlan {
  id: string;
  plan_id: string;
  plan_name: string;
  target_area: string;
  use_case: string;
  equipment_needed: string[];
  duration: string;
  phases: SessionPlanPhases;
  status: 'draft' | 'published';
}

export interface MovementSession {
  id: string;
  user_id: string;
  session_name: string;
  target_areas: string[];
  user_case: string;
  schedule_days?: number | null;
  schedule_weeks?: number | null;
  session_duration?: number | null;
  plans: SessionPlan[];
  plan_count: number;
  exercise_count: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SessionListResponse {
  items: MovementSession[];
  total: number;
}

export const sessionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSession: builder.mutation<MovementSession, CreateSessionRequest>({
      query: (body) => ({
        url: '/sessions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Sessions', 'Auth'],
    }),
    getSessions: builder.query<SessionListResponse, void>({
      query: () => '/sessions',
      providesTags: ['Sessions'],
    }),
    getSession: builder.query<MovementSession, string>({
      query: (sessionId) => `/sessions/${sessionId}`,
      providesTags: (_result, _error, sessionId) => [
        'Sessions',
        { type: 'Sessions' as const, id: sessionId },
      ],
    }),
  }),
});

export const {
  useCreateSessionMutation,
  useGetSessionsQuery,
  useGetSessionQuery,
} = sessionApi;
