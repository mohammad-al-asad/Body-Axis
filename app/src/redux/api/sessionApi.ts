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
  is_completed?: boolean;
  completed_at?: string | null;
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
  progress_status: 'pending' | 'active' | 'completed';
  progress_percent: number;
  completed_exercise_count: number;
  total_exercise_count: number;
}

export interface NextExercise {
  session_id: string;
  session_name: string;
  plan_id: string;
  plan_name: string;
  exercise_id: string;
  exercise_name: string;
  exercise_index?: number;
  phase: 'reset' | 'control' | 'integrate';
  tutorial_video?: SessionVideo | null;
  short_clip_video?: SessionVideo | null;
  primary_intent?: string | null;
  secondary_benefits?: string | null;
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
  status: 'pending' | 'active' | 'completed';
  progress_percent: number;
  completed_exercise_count: number;
  total_exercise_count: number;
  next_exercise?: NextExercise | null;
  created_at: string;
  updated_at: string;
}

export interface SessionListResponse {
  items: MovementSession[];
  total: number;
}

export interface CompleteExerciseRequest {
  sessionId: string;
  exerciseId: string;
  plan_id: string;
  completed_local_date: string;
  completed_weekday: string;
}

export interface ProgressAchievement {
  key: string;
  title: string;
  unlocked: boolean;
}

export interface ProgressSummary {
  current_streak_days: number;
  completed_dates_this_week: string[];
  weekly_completed_count: number;
  weekly_target_count: number;
  sessions_completed_total: number;
  total_exercises_completed: number;
  active_session?: MovementSession | null;
  next_exercise?: NextExercise | null;
  wins: ProgressAchievement[];
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
    completeExercise: builder.mutation<MovementSession, CompleteExerciseRequest>({
      query: ({ sessionId, exerciseId, ...body }) => ({
        url: `/sessions/${sessionId}/exercises/${exerciseId}/complete`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, payload) => [
        'Sessions',
        { type: 'Sessions' as const, id: payload.sessionId },
      ],
    }),
    getProgressSummary: builder.query<ProgressSummary, void>({
      query: () => '/sessions/summary/me',
      providesTags: ['Sessions'],
    }),
  }),
});

export const {
  useCreateSessionMutation,
  useGetSessionsQuery,
  useGetSessionQuery,
  useCompleteExerciseMutation,
  useGetProgressSummaryQuery,
} = sessionApi;
