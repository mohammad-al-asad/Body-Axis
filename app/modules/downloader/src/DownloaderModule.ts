import { NativeModule, requireNativeModule } from 'expo';

import {
  DownloaderModuleEvents,
  OfflineDownload,
  OfflineSessionRecord,
  SaveOfflineSessionRequest,
} from './Downloader.types';

declare class DownloaderModule extends NativeModule<DownloaderModuleEvents> {
  saveSessionAsync(payload: SaveOfflineSessionRequest): Promise<OfflineDownload[]>;
  getDownloadsAsync(sessionId?: string | null): Promise<OfflineDownload[]>;
  getSessionsAsync(): Promise<OfflineSessionRecord[]>;
  getSessionAsync(sessionId: string): Promise<OfflineSessionRecord | null>;
  getDownloadAsync(downloadId: string): Promise<OfflineDownload | null>;
  getPlayableUriAsync(downloadId: string): Promise<string | null>;
  pauseDownloadAsync(downloadId: string): Promise<boolean>;
  resumeDownloadAsync(downloadId: string): Promise<boolean>;
  cancelDownloadAsync(downloadId: string): Promise<boolean>;
  removeSessionAsync(sessionId: string): Promise<boolean>;
  resumePendingDownloadsAsync(): Promise<boolean>;
}

let moduleInstance: DownloaderModule;
try {
  moduleInstance = requireNativeModule<DownloaderModule>('Downloader');
} catch (error) {
  console.warn("Downloader native module is not available. Using fallback mock.", error);
  moduleInstance = {
    saveSessionAsync: async () => [],
    getDownloadsAsync: async () => [],
    getSessionsAsync: async () => [],
    getSessionAsync: async () => null,
    getDownloadAsync: async () => null,
    getPlayableUriAsync: async () => null,
    pauseDownloadAsync: async () => false,
    resumeDownloadAsync: async () => false,
    cancelDownloadAsync: async () => false,
    removeSessionAsync: async () => false,
    resumePendingDownloadsAsync: async () => false,
    addListener: () => ({ remove: () => {} }),
    removeAllListeners: () => {},
  } as unknown as DownloaderModule;
}

export default moduleInstance;
