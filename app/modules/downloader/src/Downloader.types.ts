export type DownloadStatus =
  | 'queued'
  | 'downloading'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'canceled';

export type OfflineDownloadAsset = {
  id: string;
  url: string;
  title?: string;
  fileName?: string;
  mimeType?: string;
  headers?: Record<string, string>;
  planId?: string;
  exerciseId?: string;
  videoId?: string;
  metadata?: Record<string, unknown>;
};

export type SaveOfflineSessionRequest = {
  sessionId: string;
  title?: string;
  metadata: Record<string, unknown>;
  assets: OfflineDownloadAsset[];
};

export type OfflineDownload = {
  id: string;
  downloadId: string;
  sessionId: string;
  planId?: string | null;
  exerciseId?: string | null;
  videoId?: string | null;
  title?: string | null;
  url: string;
  filePath: string;
  localUri?: string | null;
  mimeType?: string | null;
  bytesDownloaded: number;
  totalBytes: number;
  progress: number;
  percentage: number;
  status: DownloadStatus;
  error?: string | null;
  createdAt: number;
  updatedAt: number;
};

export type OfflineSessionRecord = {
  id: string;
  title?: string | null;
  metadataJson: string;
  status: DownloadStatus;
  createdAt: number;
  updatedAt: number;
};

export type DownloadEventPayload = OfflineDownload;

export type DownloaderModuleEvents = {
  downloadProgress: (payload: DownloadEventPayload) => void;
  downloadCompleted: (payload: DownloadEventPayload) => void;
  downloadFailed: (payload: DownloadEventPayload) => void;
  downloadPaused: (payload: DownloadEventPayload) => void;
  downloadResumed: (payload: DownloadEventPayload) => void;
  downloadCanceled: (payload: DownloadEventPayload) => void;
};
