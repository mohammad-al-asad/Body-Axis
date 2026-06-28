import DownloaderModule, {
  DownloadEventPayload,
  DownloaderModuleEvents,
  OfflineDownload,
  OfflineDownloadAsset,
  OfflineSessionRecord,
  SaveOfflineSessionRequest,
} from '../../modules/downloader/src';
import { MovementSession, SessionPlan } from '@/redux/api/sessionApi';

type DownloadEventName = keyof DownloaderModuleEvents;

const phaseOrder = ['reset', 'control', 'integrate'] as const;

type OfflineMetadata = {
  session?: MovementSession | Partial<MovementSession> & {
    name?: string;
    targetAreas?: string[];
    userCase?: string;
  };
  plan?: SessionPlan;
  savedPlanIds?: string[];
};

export async function saveOfflineSession(payload: SaveOfflineSessionRequest) {
  const existing = await DownloaderModule.getSessionAsync(payload.sessionId);
  const existingMetadata = existing ? parseMetadata(existing.metadataJson) : null;
  const nextMetadata = mergeOfflineMetadata(existingMetadata, payload.metadata);

  return DownloaderModule.saveSessionAsync({
    ...payload,
    metadata: nextMetadata,
  });
}

export function getOfflineDownloads(sessionId?: string) {
  return DownloaderModule.getDownloadsAsync(sessionId ?? null);
}

export async function getSavedOfflineSessions() {
  const records = await DownloaderModule.getSessionsAsync();
  return records
    .map(offlineSessionRecordToMovementSession)
    .filter((session): session is MovementSession => Boolean(session));
}

export async function getSavedOfflineSession(sessionId: string) {
  const record = await DownloaderModule.getSessionAsync(sessionId);
  return record ? offlineSessionRecordToMovementSession(record) : null;
}

export function getOfflineDownload(downloadId: string) {
  return DownloaderModule.getDownloadAsync(downloadId);
}

export function getOfflinePlayableUri(downloadId: string) {
  return DownloaderModule.getPlayableUriAsync(downloadId);
}

export function pauseOfflineDownload(downloadId: string) {
  return DownloaderModule.pauseDownloadAsync(downloadId);
}

export function resumeOfflineDownload(downloadId: string) {
  return DownloaderModule.resumeDownloadAsync(downloadId);
}

export function cancelOfflineDownload(downloadId: string) {
  return DownloaderModule.cancelDownloadAsync(downloadId);
}

export function removeOfflineSession(sessionId: string) {
  return DownloaderModule.removeSessionAsync(sessionId);
}

export async function removeOfflinePlan(sessionId: string, plan: SessionPlan) {
  const record = await DownloaderModule.getSessionAsync(sessionId);
  if (!record) return false;

  const metadata = parseMetadata(record.metadataJson);
  if (!metadata) return removeOfflineSession(sessionId);

  const planId = plan.plan_id || plan.id;
  const savedPlanIds = (metadata.savedPlanIds ?? []).filter((id) => id !== planId);

  if (savedPlanIds.length === 0) {
    return removeOfflineSession(sessionId);
  }

  await DownloaderModule.saveSessionAsync({
    sessionId,
    title: record.title ?? undefined,
    metadata: {
      ...metadata,
      savedPlanIds,
    },
    assets: [],
  });

  return true;
}

export function resumePendingOfflineDownloads() {
  return DownloaderModule.resumePendingDownloadsAsync();
}

export function addOfflineDownloadListener(
  eventName: DownloadEventName,
  listener: (payload: DownloadEventPayload) => void,
) {
  return DownloaderModule.addListener(eventName, listener);
}

export function createPlanOfflineDownloadRequest(
  session: MovementSession,
  plan: SessionPlan,
): SaveOfflineSessionRequest {
  const assets = collectPlanVideoAssets(session.id, plan);

  return {
    sessionId: session.id,
    title: `${session.session_name} - ${plan.plan_name}`,
    metadata: {
      session,
      plan,
      savedPlanIds: [plan.plan_id || plan.id],
    },
    assets,
  };
}

export function planAssetDownloadIds(sessionId: string, plan: SessionPlan) {
  return collectPlanVideoAssets(sessionId, plan).map((asset) => asset.id);
}

export async function resolveOfflineVideoUri(
  sessionId: string,
  plan: SessionPlan,
  videoUrl: string,
): Promise<string | null> {
  const asset = collectPlanVideoAssets(sessionId, plan).find((item) => item.url === videoUrl);
  if (!asset) return null;
  return getOfflinePlayableUri(asset.id);
}

function collectPlanVideoAssets(sessionId: string, plan: SessionPlan): OfflineDownloadAsset[] {
  const seen = new Set<string>();
  const assets: OfflineDownloadAsset[] = [];

  for (const phase of phaseOrder) {
    for (const exercise of plan.phases[phase]) {
      const videos = [
        { kind: 'tutorial', video: exercise.tutorial_video },
        { kind: 'short-clip', video: exercise.short_clip_video },
      ];

      for (const { kind, video } of videos) {
        if (!video?.video_url || seen.has(video.video_url)) continue;
        seen.add(video.video_url);

        const stableVideoId = video.id || stableHash(video.video_url);
        assets.push({
          id: [
            sessionId,
            plan.plan_id || plan.id,
            exercise.exercise_id,
            kind,
            stableVideoId,
          ].map(sanitizeIdPart).join('__'),
          url: video.video_url,
          title: `${exercise.exercise_name} ${kind === 'tutorial' ? 'Tutorial' : 'Short Clip'}`,
          fileName: `${sanitizeIdPart(plan.plan_id || plan.id)}-${sanitizeIdPart(exercise.exercise_id)}-${kind}-${sanitizeIdPart(stableVideoId)}.mp4`,
          mimeType: 'video/mp4',
          planId: plan.plan_id || plan.id,
          exerciseId: exercise.exercise_id,
          videoId: video.id,
          metadata: {
            phase,
            kind,
            exerciseName: exercise.exercise_name,
            thumbnailUrl: video.thumbnail_url,
          },
        });
      }
    }
  }

  return assets;
}

function mergeOfflineMetadata(
  existingMetadata: OfflineMetadata | null,
  incomingMetadata: Record<string, unknown>,
): Record<string, unknown> {
  const incoming = incomingMetadata as OfflineMetadata;
  const incomingPlanId = incoming.plan ? incoming.plan.plan_id || incoming.plan.id : undefined;
  const savedPlanIds = new Set([
    ...(existingMetadata?.savedPlanIds ?? []),
    ...(incoming.savedPlanIds ?? []),
    ...(incomingPlanId ? [incomingPlanId] : []),
  ]);

  return {
    ...existingMetadata,
    ...incoming,
    savedPlanIds: Array.from(savedPlanIds),
  };
}

function offlineSessionRecordToMovementSession(record: OfflineSessionRecord): MovementSession | null {
  const metadata = parseMetadata(record.metadataJson);
  if (!metadata) return null;

  const session = metadata.session;
  const legacySession = session as
    | {
        name?: string;
        targetAreas?: string[];
        userCase?: string;
      }
    | undefined;
  const savedPlanIds = new Set(metadata.savedPlanIds ?? []);
  const fullSession = isMovementSession(session) ? session : null;
  const plansFromSession = fullSession?.plans ?? [];
  const fallbackPlan = metadata.plan;
  const plans = plansFromSession.length
    ? plansFromSession.filter((plan) => savedPlanIds.size === 0 || savedPlanIds.has(plan.plan_id || plan.id))
    : fallbackPlan
      ? [fallbackPlan]
      : [];

  if (plans.length === 0) return null;

  if (fullSession) {
    return {
      ...fullSession,
      plans,
      plan_count: plans.length,
      exercise_count: plans.reduce((count, plan) => count + countPlanExercises(plan), 0),
      status: fullSession.status || 'offline',
    };
  }

  return {
    id: record.id,
    user_id: typeof session?.user_id === 'string' ? session.user_id : 'offline',
    session_name:
      typeof session?.session_name === 'string'
        ? session.session_name
        : typeof legacySession?.name === 'string'
          ? legacySession.name
          : record.title || 'Saved Offline Session',
    target_areas:
      Array.isArray(session?.target_areas)
        ? session.target_areas
        : Array.isArray(legacySession?.targetAreas)
          ? legacySession.targetAreas
          : plans.map((plan) => plan.target_area).filter(Boolean),
    user_case:
      typeof session?.user_case === 'string'
        ? session.user_case
        : typeof legacySession?.userCase === 'string'
          ? legacySession.userCase
          : plans[0]?.use_case ?? 'Saved offline',
    schedule_days: typeof session?.schedule_days === 'number' ? session.schedule_days : null,
    schedule_weeks: typeof session?.schedule_weeks === 'number' ? session.schedule_weeks : null,
    session_duration:
      typeof session?.session_duration === 'number' ? session.session_duration : null,
    plans,
    plan_count: plans.length,
    exercise_count: plans.reduce((count, plan) => count + countPlanExercises(plan), 0),
    status: record.status || 'offline',
    created_at: new Date(record.createdAt).toISOString(),
    updated_at: new Date(record.updatedAt).toISOString(),
  };
}

function parseMetadata(metadataJson: string): OfflineMetadata | null {
  try {
    return JSON.parse(metadataJson) as OfflineMetadata;
  } catch {
    return null;
  }
}

function isMovementSession(value: OfflineMetadata['session']): value is MovementSession {
  return Boolean(
    value &&
      typeof value.id === 'string' &&
      typeof value.session_name === 'string' &&
      Array.isArray(value.plans),
  );
}

function countPlanExercises(plan: SessionPlan) {
  return phaseOrder.reduce((count, phase) => count + plan.phases[phase].length, 0);
}

function sanitizeIdPart(value: string) {
  const sanitized = value.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^_+|_+$/g, '');
  return sanitized.slice(0, 96) || 'item';
}

function stableHash(value: string) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return Math.abs(hash >>> 0).toString(36);
}

export type { DownloadEventPayload, OfflineDownload };
