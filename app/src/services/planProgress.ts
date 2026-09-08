import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionExercise, SessionPlan } from '@/redux/api/sessionApi';

export interface PlanProgress {
  lastExerciseIndex: number;
  lastExerciseId?: string;
  lastExerciseName?: string;
  hasStarted: boolean;
  isCompleted?: boolean;
  updatedAt: string;
}

const STORAGE_PREFIX = '@bodyaxis:plan_progress:';

function getStorageKey(sessionId: string, planId: string): string {
  return `${STORAGE_PREFIX}${sessionId}:${planId}`;
}

export async function savePlanProgress(
  sessionId: string,
  planId: string,
  progress: PlanProgress,
): Promise<void> {
  if (!sessionId || !planId) return;
  try {
    const key = getStorageKey(sessionId, planId);
    await AsyncStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save plan progress to AsyncStorage:', error);
  }
}

export async function getPlanProgress(
  sessionId: string,
  planId: string,
): Promise<PlanProgress | null> {
  if (!sessionId || !planId) return null;
  try {
    const key = getStorageKey(sessionId, planId);
    const data = await AsyncStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as PlanProgress;
  } catch (error) {
    console.error('Failed to get plan progress from AsyncStorage:', error);
    return null;
  }
}

export async function clearPlanProgress(
  sessionId: string,
  planId: string,
): Promise<void> {
  if (!sessionId || !planId) return;
  try {
    const key = getStorageKey(sessionId, planId);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear plan progress from AsyncStorage:', error);
  }
}

export interface PlanResumeState {
  isFirstTime: boolean;
  isCompleted: boolean;
  resumeIndex: number;
  resumeExercise: SessionExercise | null;
  totalExercises: number;
}

export function resolvePlanResumeState(
  dynamicExercises: SessionExercise[],
  savedProgress: PlanProgress | null,
  sessionPlan?: SessionPlan | null,
): PlanResumeState {
  const total = dynamicExercises.length;
  if (total === 0) {
    return {
      isFirstTime: true,
      isCompleted: false,
      resumeIndex: 0,
      resumeExercise: null,
      totalExercises: 0,
    };
  }

  // Check if plan is 100% completed
  const backendCompletedCount = sessionPlan?.completed_exercise_count ?? 0;
  const isAllExercisesCompleted =
    dynamicExercises.length > 0 && dynamicExercises.every((e) => e.is_completed);
  const isCompleted =
    sessionPlan?.progress_status === 'completed' ||
    (backendCompletedCount >= total && total > 0) ||
    isAllExercisesCompleted ||
    Boolean(savedProgress?.isCompleted);

  // If completed, user wants to restart from the beginning directly
  if (isCompleted) {
    return {
      isFirstTime: false,
      isCompleted: true,
      resumeIndex: 0,
      resumeExercise: dynamicExercises[0] ?? null,
      totalExercises: total,
    };
  }

  // Find the first uncompleted exercise from backend data
  const firstUncompletedBackendIndex = dynamicExercises.findIndex(
    (e) => !e.is_completed,
  );

  // Determine if it's the first time
  const hasCompletedAny =
    backendCompletedCount > 0 ||
    dynamicExercises.some((e) => e.is_completed);
  const hasStartedLocal = Boolean(savedProgress?.hasStarted);

  // If neither local progress nor backend completion exists, it's first time
  if (!hasCompletedAny && !hasStartedLocal) {
    return {
      isFirstTime: true,
      isCompleted: false,
      resumeIndex: 0,
      resumeExercise: dynamicExercises[0] ?? null,
      totalExercises: total,
    };
  }

  // Determine resume index
  let targetIndex = 0;
  if (
    typeof savedProgress?.lastExerciseIndex === 'number' &&
    savedProgress.lastExerciseIndex >= 0 &&
    savedProgress.lastExerciseIndex < total
  ) {
    targetIndex = savedProgress.lastExerciseIndex;
    // If backend reports uncompleted exercises further along, use the later index
    if (
      firstUncompletedBackendIndex >= 0 &&
      firstUncompletedBackendIndex > targetIndex
    ) {
      targetIndex = firstUncompletedBackendIndex;
    }
  } else if (firstUncompletedBackendIndex >= 0) {
    targetIndex = firstUncompletedBackendIndex;
  }

  // Ensure index is safely within bounds [0, total - 1]
  targetIndex = Math.max(0, Math.min(targetIndex, total - 1));

  // If targetIndex is 0 and 0 exercises were completed, starting where you left off
  // is identical to starting from the beginning. In that case, treat as first time
  // to avoid redundant prompting.
  if (targetIndex === 0 && !hasCompletedAny) {
    return {
      isFirstTime: true,
      isCompleted: false,
      resumeIndex: 0,
      resumeExercise: dynamicExercises[0] ?? null,
      totalExercises: total,
    };
  }

  return {
    isFirstTime: false,
    isCompleted: false,
    resumeIndex: targetIndex,
    resumeExercise: dynamicExercises[targetIndex] ?? null,
    totalExercises: total,
  };
}
