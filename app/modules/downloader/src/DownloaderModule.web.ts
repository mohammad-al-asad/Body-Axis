import { registerWebModule, NativeModule } from 'expo';

import {
  DownloaderModuleEvents,
  OfflineDownload,
  OfflineSessionRecord,
  SaveOfflineSessionRequest,
} from './Downloader.types';

// DownloaderModule is not available on the web platform.
class DownloaderModule extends NativeModule<DownloaderModuleEvents> {
  saveSessionAsync(_payload: SaveOfflineSessionRequest): Promise<OfflineDownload[]> {
    return Promise.reject(new Error('Downloader is only available in native builds.'));
  }

  getDownloadsAsync(_sessionId?: string | null): Promise<OfflineDownload[]> {
    return Promise.resolve([]);
  }

  getSessionsAsync(): Promise<OfflineSessionRecord[]> {
    return Promise.resolve([]);
  }

  getSessionAsync(_sessionId: string): Promise<OfflineSessionRecord | null> {
    return Promise.resolve(null);
  }

  getDownloadAsync(_downloadId: string): Promise<OfflineDownload | null> {
    return Promise.resolve(null);
  }

  getPlayableUriAsync(_downloadId: string): Promise<string | null> {
    return Promise.resolve(null);
  }

  pauseDownloadAsync(_downloadId: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  resumeDownloadAsync(_downloadId: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  cancelDownloadAsync(_downloadId: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  removeSessionAsync(_sessionId: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  resumePendingDownloadsAsync(): Promise<boolean> {
    return Promise.resolve(false);
  }
}

export default registerWebModule(DownloaderModule, 'Downloader');
